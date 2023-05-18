import { Token } from '@auth/domain/token.model';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../service/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<Token> {
    const token = await this.authService.login(username, password);
    if (!token) {
      throw new UnauthorizedException();
    }
    return token;
  }
}
