import { Type } from 'class-transformer';
import { IsInt, IsString, Max, Min, ValidateNested } from 'class-validator';
import { AppConfig, JwtConfig } from './app-config.type';

class JwtConfigValidator implements JwtConfig {
  @IsString({ message: 'JWT access secret must be a string' })
  accessSecret: string;

  @IsString({ message: 'JWT refresh secret must be a string' })
  refreshSecret: string;

  @IsString({ message: 'JWT access expiration must be a string' })
  accessExpiration: string;

  @IsString({ message: 'JWT refresh expiration must be a string' })
  refreshExpiration: string;
}

export class AppConfigValidator implements AppConfig {
  @IsInt({ message: 'Port must be an integer' })
  @Min(1, { message: 'Port must be at least 1' })
  @Max(65535, { message: 'Port must be at most 65535' })
  port: number;

  @IsString({ message: 'Uploads folder must be a string' })
  uploadsFolder: string;

  @IsString({ message: 'Database connection string must be a string' })
  dbConnectionString: string;

  @ValidateNested()
  @Type(() => JwtConfigValidator)
  jwt: JwtConfigValidator;
}
