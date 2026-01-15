import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { SessionDocument } from '../user/schemas/session.schema';
import { UserDocument, UserStatus } from '../user/schemas/user.schema';
import { SessionRepository } from '../user/repositories/session.repository';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload, JwtRefreshPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private sessionRepository: SessionRepository,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userService.create({
      ...registerDto,
      password: hashedPassword,
    });

    return this.generateTokens(user);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    return user;
  }

  async login(user: UserDocument): Promise<AuthResponseDto> {
    return this.generateTokens(user);
  }

  async refreshTokens(
    userId: string,
    tokenId: string,
  ): Promise<AuthResponseDto> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    // Delete old session
    await this.sessionRepository.deleteByTokenId(tokenId);

    return this.generateTokens(user);
  }

  async logout(userId: string, tokenId?: string): Promise<void> {
    if (tokenId) {
      await this.sessionRepository.deleteByTokenId(tokenId);
    } else {
      // Logout from all devices
      await this.sessionRepository.deleteByUserId(userId);
    }
  }

  async validateRefreshToken(
    userId: string,
    tokenId: string,
    refreshToken: string,
  ): Promise<SessionDocument | null> {
    const session = await this.sessionRepository.findByUserAndTokenId(
      userId,
      tokenId,
    );

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    const isTokenValid = await bcrypt.compare(
      refreshToken,
      session.refreshToken,
    );
    if (!isTokenValid) {
      return null;
    }

    return session;
  }

  private async generateTokens(user: UserDocument): Promise<AuthResponseDto> {
    const accessPayload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    // Create session for refresh token
    const refreshExpiration =
      this.configService.get<string>('jwt.refreshExpiration') || '7d';
    const expiresAt = this.calculateExpiration(refreshExpiration);

    const session = await this.sessionRepository.create({
      userId: user._id,
      refreshToken: 'placeholder', // Will be updated after hashing
      expiresAt,
    });

    const refreshPayload: JwtRefreshPayload = {
      sub: user._id.toString(),
      tokenId: session._id.toString(),
    };

    const accessExpirationMs = this.parseExpiration(
      this.configService.get<string>('jwt.accessExpiration') || '15m',
    );
    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: Math.floor(accessExpirationMs / 1000), // Convert to seconds
    });

    const refreshExpirationMs = this.parseExpiration(refreshExpiration);
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: Math.floor(refreshExpirationMs / 1000), // Convert to seconds
    });

    // Hash and store the refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.sessionRepository.update(session._id.toString(), {
      refreshToken: hashedRefreshToken,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  private calculateExpiration(duration: string): Date {
    return new Date(Date.now() + this.parseExpiration(duration));
  }

  private parseExpiration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000; // Default 7 days
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
  }
}
