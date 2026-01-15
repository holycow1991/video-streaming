export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  [key: string]: unknown;
}

export interface JwtRefreshPayload {
  sub: string; // user id
  tokenId: string; // session id for revocation
  [key: string]: unknown;
}
