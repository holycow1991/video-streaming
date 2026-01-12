import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AppConfig } from './app-config.type';
import { AppConfigValidator } from './app-config.validator';

export const appConfig = (): AppConfig => {
  const conf = plainToClass(AppConfigValidator, {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    uploadsFolder: process.env.UPLOADS_FOLDER,
  });

  const errors = validateSync(conf, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return {
    port: conf.port,
    uploadsFolder: conf.uploadsFolder,
  };
};
