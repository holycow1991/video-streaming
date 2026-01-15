type DatabaseConfig = {
  connectionString: string;
};

export type AppConfig = {
  port: number;
  uploadsFolder: string;
  dbConnectionString: string;
  // database: DatabaseConfig;
};
