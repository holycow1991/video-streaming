import { IsInt, IsString, Max, Min } from 'class-validator';
import { AppConfig } from './app-config.type';

export class AppConfigValidator implements AppConfig {
  @IsInt({ message: 'Port must be an integer' })
  @Min(1, { message: 'Port must be at least 1' })
  @Max(65535, { message: 'Port must be at most 65535' })
  port: number;

  @IsString({ message: 'Uploads folder must be a string' })
  uploadsFolder: string;
}
