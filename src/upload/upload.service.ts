import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
} from "@nestjs/common";
import { Request } from "express";
import { deleteObject } from "../common/util/deleteObjectFromS3";
import { UploadRepository } from "./upload.repository";

@Injectable()
export class UploadService {
  constructor(private uploadRepository: UploadRepository) {}

  /** 업로드 결과 */
  async upload(req: Request) {
    const fileValidationError = req["fileValidationError"];
    // 이미지 파일 형식이 맞지 않은 경우
    if (fileValidationError === "format doesn't fit") {
      throw new UnsupportedMediaTypeException();
    }

    // 이미지 파일 보내지 않은 경우
    if (!req?.file) {
      throw new UnprocessableEntityException("No file");
    }

    // url, key 가져오기
    const url = req.file["location"];
    const key = req.file["key"];

    // 저장
    this.uploadRepository.storeTempImage(url, key);

    return { url, key };
  }

  /** TimeOut이 끝나면 board DB 확인 */
  async check(fileInfo: { url: string; key: string }) {
    const timeOut = 1 * 60 * 1000;

    // 연결된 게시글이 있는 지 확인
    const editResult = await new Promise((resolve) => {
      setTimeout(async () => {
        console.log("timeOut");
        const result = await this.uploadRepository.findImage(fileInfo.url);
        resolve(result);
      }, timeOut);
    });

    // 없으면 DB, S3로부터 삭제
    if (!editResult) {
      await this.uploadRepository.deleteTempImage(fileInfo.url);
      deleteObject([fileInfo.key]);
    }
  }

  /** image 삭제 - DB 데이터 삭제, S3 객체 삭제 */
  async deleteImage(url: string) {
    try {
      // key 값 얻어오기
      const key = (await this.uploadRepository.findImage(url)).key;
      // DB
      await this.uploadRepository.deleteImage(url);

      // S3
      deleteObject([key]);
    } catch (error) {
      throw new NotFoundException("No Image");
    }
  }
}
