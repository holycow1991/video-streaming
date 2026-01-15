export type JwtConfig = {
  accessSecret: string;
  refreshSecret: string;
  accessExpiration: string;
  refreshExpiration: string;
};

export type AppConfig = {
  port: number;
  uploadsFolder: string;
  dbConnectionString: string;
  jwt: JwtConfig;
};
