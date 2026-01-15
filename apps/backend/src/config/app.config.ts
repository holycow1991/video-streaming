import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AppConfig } from './app-config.type';
import { AppConfigValidator } from './app-config.validator';

export const appConfig = (): AppConfig => {
  const conf = plainToClass(AppConfigValidator, <AppConfig>{
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    uploadsFolder: process.env.UPLOADS_FOLDER,
    dbConnectionString: `mongodb://${process.env.MONGO_APP_USERNAME}:${process.env.MONGO_APP_PASSWORD}@localhost:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}?authSource=${process.env.MONGO_DATABASE}`,
  });

  const errors = validateSync(conf, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return {
    port: conf.port,
    uploadsFolder: conf.uploadsFolder,
    dbConnectionString: conf.dbConnectionString,
    // database: {
    //   connectionString: conf.database.connectionString,
    // },
  };
};
