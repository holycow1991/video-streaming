import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AppConfig } from './app-config.type';
import { AppConfigValidator } from './app-config.validator';

export const appConfig = (): AppConfig => {
  const conf = plainToClass(AppConfigValidator, <AppConfig>{
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    uploadsFolder: process.env.UPLOADS_FOLDER,
    dbConnectionString: `mongodb://${process.env.MONGO_APP_USERNAME}:${process.env.MONGO_APP_PASSWORD}@localhost:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}?authSource=${process.env.MONGO_DATABASE}`,
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
      refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    },
  });

  const errors = validateSync(conf, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return {
    port: conf.port,
    uploadsFolder: conf.uploadsFolder,
    dbConnectionString: conf.dbConnectionString,
    jwt: conf.jwt,
  };
};
