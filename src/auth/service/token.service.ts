import { SecurityConfig } from '@common/config/config.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UserService } from '@user/user.service';
import { Cache } from 'cache-manager';
import { Token } from '../domain/token.model';

@Injectable()
export class TokenService {
  ACCES_KEY = 'access-';
  REFRESH_KEY = 'refresh-';

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async generateTokens(payload: { userId: string }): Promise<Token> {
    const tokens: Token = {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };

    await this.updateTokens(payload, tokens);

    return tokens;
  }

  private async updateTokens(payload: { userId: string }, tokens: Token) {
    await this.cacheManager.set(
      this.ACCES_KEY + payload.userId,
      tokens.refreshToken,
      0,
    );
    await this.cacheManager.set(
      this.REFRESH_KEY + payload.userId,
      tokens.refreshToken,
      0,
    );
  }

  private generateAccessToken(payload: { userId: string }): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    });
  }

  private generateRefreshToken(payload: { userId: string }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig.refreshIn,
    });
  }

  async refreshTokens(refreshToken: string) {
    // if (!user) {
    //   throw new ForbiddenException('Access Denied');
    // }
    const decode = this.jwtService.decode(refreshToken);
    const userId = decode['userId'];

    const savedRt = await this.cacheManager.get(this.REFRESH_KEY + userId);

    if (savedRt !== refreshToken) {
      await this.expireTokens(userId);
      throw new ForbiddenException('Invalid Refresh Token');
    }

    return await this.generateTokens({ userId: userId.toString() });
  }

  async expireTokens(userId: number) {
    await this.cacheManager.del(this.ACCES_KEY + userId);
    await this.cacheManager.del(this.REFRESH_KEY + userId);
  }

  getUserFromToken(token: string): Promise<User> {
    const id = parseInt(this.jwtService.decode(token)['userId']);
    return this.userService.findOneById(id);
  }
}
