import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
} from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { CreateUserDto } from "./dto/create-user.dto";
import {
  UpdateUserIntroductionDto,
  UpdateUserNicknameDto,
} from "./dto/update-user.dto";
import { UserDeleteWhereDto } from "./dto/delete-user.dto";
import { deleteObject } from "../common/util/deleteObjectFromS3";
import { UserImageRepository } from "./userImage.repository";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userImageRepository: UserImageRepository,
  ) {}

  async findUser(uniqueValue: {
    id?: number;
    email?: string;
    nickName?: string;
  }) {
    return this.userRepository.findOne(uniqueValue);
  }

  async signUp(userDto: CreateUserDto) {
    return this.userRepository.createUser(userDto);
  }

  // refresh token 기간 끝 OR 가입
  async sign(userDto: CreateUserDto) {
    // 가입 여부 확인
    let userInfo = await this.userRepository.findOne({ email: userDto.email });

    if (userInfo !== null) {
      return userInfo;
    }

    // 가입되지 않은 경우 자동 가입
    userInfo = await this.signUp(userDto);

    return userInfo;
  }

  // 닉네임 중복 체크
  async nicknameDuplicateCheck(nickName: string, type = "check") {
    const isExist = await this.findUser({ nickName });

    // 없는 경우
    if (isExist === null) {
      return true;
    }

    // 있는 경우
    if (type === "check") {
      return false;
    }

    throw new ConflictException();
  }

  // 닉네임 수정
  async editNickname(updateUserNicknameDto: UpdateUserNicknameDto) {
    const isNotExist = await this.nicknameDuplicateCheck(
      updateUserNicknameDto.data.nickName,
    );

    if (isNotExist) {
      const userInfo = await this.userRepository.updateUser(
        updateUserNicknameDto,
      );
      return { nickName: userInfo.nickName };
    }

    throw new ConflictException();
  }

  // 자기 소개 수정
  async editIntroduction(updateUserIntroductionDto: UpdateUserIntroductionDto) {
    const userInfo = await this.userRepository.updateUser(
      updateUserIntroductionDto,
    );
    return { introduction: userInfo.introduction };
  }

  // 회원 탈퇴
  async withdraw(userInfo: UserDeleteWhereDto) {
    // 사진 삭제
    const previousUserInfo = await this.userImageRepository.findOne({
      u_id: userInfo.where.id,
    });

    if (previousUserInfo !== null) {
      const { key } = previousUserInfo;

      deleteObject([key]);
    }

    const result = await this.userRepository.deleteUser({
      id: userInfo.where.id,
    });

    return result;
  }

  // 이미지 수정
  async editPicture(id, req) {
    // 이미지 파일 보내지 않은 경우
    if (!req?.file) {
      throw new UnprocessableEntityException("No file");
    }
    const fileValidationError = req.fileValidationError;
    // 이미지 파일 형식이 맞지 않은 경우
    if (fileValidationError === "format doesn't fit") {
      throw new UnsupportedMediaTypeException();
    }
    // url 가져오기
    const picture = req.file.location;
    const updateUserPictureDto = { where: { id }, data: { picture } };

    // 기존 S3 이미지 삭제 - userImageRepo 를 조회해 key를 가져와 제거
    const previousUserInfo = await this.userImageRepository.findOne({
      u_id: id,
    });

    if (previousUserInfo !== null) {
      const { key } = previousUserInfo;

      deleteObject([key]);

      await this.userImageRepository.update({
        u_id: id,
        url: picture,
        key: req.file.key,
      });
    }

    const userInfo = await this.userRepository.updateUser(updateUserPictureDto);
    // 새로운 이미지 저장
    return { picture: userInfo.picture };
  }

  // 마이페이지 이동
  async mypage(nickName: string, page: number = 0) {
    // 유저 닉네임으로 조회 - 닉네임은 기본적으로 email과 같은 값을 가지도록 해 참조하지 못하는 일은 생기지 않을 것임
    const userPage = await this.userRepository.getUserPage(nickName, page);

    if (!userPage.length) throw new NotFoundException();
    return userPage[0].board;
  }

  // 사용자 본인이 좋아요 눌렀던 게시글 가져오기
  async myLiked(
    client:
      | string
      | {
          [key: string]: any;
        },
  ) {
    const id = parseInt(client["id"]);
    return this.userRepository.getLiked(id);
  }
}
