import { Type } from 'class-transformer';
import { IsInt, IsString, Max, Min } from 'class-validator';
import { AppConfig } from './app-config.type';

class DatabaseValidator {
  @IsString({ message: 'Database connection string must be a string' })
  connectionString: string;
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

  // @Type(() => DatabaseValidator)
  // database: DatabaseValidator;
}
