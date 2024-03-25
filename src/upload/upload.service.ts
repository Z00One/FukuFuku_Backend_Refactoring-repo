import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
} from "@nestjs/common";
import { Request } from "express";
import { deleteObject } from "../common/util/deleteObjectFromS3";
import { UploadRepository } from "./upload.repository";
import { Cron } from "@nestjs/schedule";

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

  @Cron("0 0 3 * * *")
  async removeExpiredImage() {
    // db에서 이미지 정보 가져오기
    const images = await this.uploadRepository.getAllTempImage();

    images.forEach(async (image) => {
      Promise.all([
        this.uploadRepository.deleteTempImage(image.url),
        deleteObject([image.key]),
      ]);
    });
  }
}
