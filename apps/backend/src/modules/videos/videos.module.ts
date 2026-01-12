import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.get<string>('uploadsFolder'),
          filename: (req, file, cb) => {
            console.log('Received mimetype:', file.mimetype);
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const originalName = file.originalname;
            cb(null, uniqueSuffix + '-' + originalName);
          },
        }),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
