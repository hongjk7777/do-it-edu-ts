import {
  Resolver,
  Mutation,
  Args,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { Public } from 'src/common/decorator/public.decorator';
import { User } from 'src/user/model/user.moel';
import { Auth } from '../domain/auth.model';
import { Token } from '../domain/token.model';
import { LoginInput } from '../input/login.input';
import { RefreshTokenInput } from '../input/refresh-token.input';
import { SignupInput } from '../input/signup.input';
import { AuthService } from '../service/auth.service';
import { TokenService } from '../service/token.service';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Public()
  @Mutation(() => Auth)
  async signup(@Args('data') data: SignupInput) {
    const { accessToken, refreshToken } = await this.authService.signUp(data);
    return {
      accessToken,
      refreshToken,
    };
  }

  @Public()
  @Mutation(() => Auth)
  async login(@Args('data') { username, password }: LoginInput) {
    const { accessToken, refreshToken } = await this.authService.login(
      username,
      password,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  @Public()
  @Mutation(() => Token)
  async refreshToken(@Args() { token }: RefreshTokenInput) {
    return this.tokenService.refreshTokens(token);
  }

  @ResolveField('user', () => User)
  async user(@Parent() auth: Auth) {
    return await this.tokenService.getUserFromToken(auth.accessToken);
  }
}
