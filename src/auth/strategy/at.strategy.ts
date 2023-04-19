import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtDto } from '../dto/jwt.dto';
import { AuthService } from '../service/auth.service';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtDto) {
    const userInfo = await this.authService.validateUser(payload.userId);

    if (!userInfo) {
      throw new UnauthorizedException('');
    }

    return userInfo;
  }
}
