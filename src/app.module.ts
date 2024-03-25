import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { BoardsModule } from "./boards/boards.module";
import { CommentsModule } from "./comments/comments.module";
import { ReplysModule } from "./replys/replys.module";
import { LikeModule } from "./like/like.module";
import { TagsModule } from "./tags/tags.module";
import { BoardTagsModule } from "./board-tags/board-tags.module";
import { UploadModule } from "./upload/upload.module";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    BoardsModule,
    CommentsModule,
    ReplysModule,
    LikeModule,
    TagsModule,
    BoardTagsModule,
    UploadModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
