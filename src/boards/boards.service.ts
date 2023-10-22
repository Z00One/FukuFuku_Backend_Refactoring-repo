import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Board } from "@prisma/client";
import { BoardRepository } from "./board.repository";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";
import { PostImageRepository } from "./boardImage.repository";
import { deleteObject } from "../common/util/deleteObjectFromS3";
import { Image } from "./dto/create-board.dto";

@Injectable()
export class BoardsService {
  constructor(
    private readonly postRepository: BoardRepository,
    private readonly postImageRepository: PostImageRepository,
  ) {}

  /** 게시판 가져오기 - 조회 순서 옵션, 날짜 옵션 */
  async getAllBoards(
    option: "recent" | "trendy" = undefined,
    createdAt: {
      gte: string | Date;
      lte: string | Date;
    } = undefined,
    lastId: number = 0,
  ): Promise<Board[]> {
    let searchOption: object = {
      orderBy: [{ id: "desc" }, { like: { _count: "desc" } }],
    };

    if (option === "recent") {
      searchOption["orderBy"] = [{ id: "desc" }];
    } else {
      searchOption["orderBy"] = [{ id: "desc" }, { views: "desc" }];
    }

    // 값이 두 개 다 들어온 경우에만 적용
    if (createdAt.gte && createdAt.lte) {
      createdAt.gte = new Date(createdAt.gte);
      createdAt.lte = new Date(createdAt.lte);
      searchOption["where"] = { createdAt };
    }

    return this.postRepository.getAllBoards(searchOption, lastId);
  }

  /** 특정한 글 하나 가져오기 */
  async getBoardById(b_id: number) {
    const post = await this.postRepository.getBoardById(b_id);
    if (post === null) {
      throw new NotFoundException("No post");
    }

    // 조회수 업데이트
    await this.postRepository.updateViews(b_id);
    return post;
  }

  /** 유저가 쓴 글 전체 불러오기 */
  async getUsersBoards(nickName: string) {
    const usersBoards = await this.postRepository.getUsersBoards(nickName);

    if (!usersBoards.length) throw new NotFoundException();
    return usersBoards;
  }

  /** 게시글 생성, 이미지 연결, 업로드된 이미지가 DB image 테이블에 없다면 에러 발생 */
  async createBoard(createPostDto: CreateBoardDto): Promise<Board> {
    const isStoredImage = await this.isStoredImage(createPostDto);
    // 저장된 이미지와 등록하려는 이미지가 다른 경우
    if (!isStoredImage) {
      throw new BadRequestException(
        "등록할 수 없는 이미지가 포함 되어 있습니다.",
      );
    }

    const userStoredImage = Array.isArray(isStoredImage);

    // 이미지가 있는 경우
    if (userStoredImage) {
      // 임시저장한 곳에서 삭제
      await this.postImageRepository.deleteTempImage(createPostDto.images);
    }

    const board = await this.postRepository.create(createPostDto);

    if (userStoredImage) {
      this.connectImagesAndBoard(board.id, isStoredImage);
    }
    return board;
  }

  /** S3 객체 삭제 후 게시글 삭제 */
  async deleteBoard(id: number) {
    try {
      const images = await this.postImageRepository.getImages(id);

      const s3ObjectKeys = images.map((image) => image.key);

      deleteObject(s3ObjectKeys);

      // 게시글 삭제
      await this.postRepository.deleteBoard({ id });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  /** 게시글 수정 - 이미지, 제목, 내용 */
  async updateBoard(updateBoardDto: UpdateBoardDto): Promise<Board> {
    // 이미지 수정 시 기존 이미지 삭제
    const previousImages = await this.postImageRepository.getImages(
      updateBoardDto.b_id,
    );

    const keys = [];

    const updateImages = updateBoardDto.images.map((image) => {
      return image.url;
    });

    previousImages.forEach((image) => {
      if (!updateImages.includes(image.url)) {
        keys.push(image.key);
      }
    });

    if (keys.length) {
      deleteObject(keys);
    }

    return this.postRepository.updateBoard(updateBoardDto);
  }

  /** 게시글 검색 */
  async searchBoard(
    keyword: string,
    nickName: string = undefined,
  ): Promise<Board[]> {
    const searchOption = {
      OR: [
        {
          title: { contains: keyword },
        },
        {
          content: { contains: keyword },
        },
        {
          board_tag: {
            some: {
              tag: { name: { contains: keyword } },
            },
          },
        },
      ],
    };

    if (nickName) {
      const AND = [{ user: { nickName } }];
      searchOption["AND"] = AND;
    }

    return this.postRepository.searchBoard(searchOption);
  }

  /** 이미지와 게시글 연결 */
  async connectImagesAndBoard(
    b_id: number,
    storedImage: { url: string; key: string }[],
  ) {
    const connectData = storedImage.map((image) => {
      return { b_id, url: image.url, key: image.key };
    });

    // 이미지 연결
    this.postImageRepository.connect(connectData);
  }

  /** 이미지 저장 여부 확인 */
  async isStoredImage(createPostDto: CreateBoardDto) {
    const isEnclude = createPostDto.images?.length;
    if (!isEnclude) {
      return true;
    }

    const storedImages = await this.postImageRepository.getTempImage(
      createPostDto.images,
    );

    const isSavable = this.validateImageList(
      storedImages,
      createPostDto.images,
    );

    return isSavable ? storedImages : false;
  }

  /** 유저가 제출한 이미지 목록이 임시저장된 이미지 목록에 있는 지 확인 */
  validateImageList(storedImages: Image[], images: Image[]) {
    // 임시 저장된 이미지 길이 보다 게시글에 사용하려는 이미지 수가 더 많으면 안됨
    const lengthCheck = storedImages.length >= images.length;

    if (!lengthCheck) {
      return false;
    }

    // url 값을 추출
    const storedUrls = storedImages.map((image) => image.url);

    // 전달된 값들의 url 값을 안에서 찾아본다.
    for (const image of images) {
      const isIn = storedUrls.includes(image.url);
      if (!isIn) {
        return false;
      }
    }

    return true;
  }
}
