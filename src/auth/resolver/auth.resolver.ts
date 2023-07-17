import { ChangePasswordInput } from '@auth/input/change-password.input';
import { InitPasswordInput } from '@auth/input/init-password.input';
import { CurrentUserId } from '@common/decorator/current-user-id.decorator';
import { Public } from '@common/decorator/public.decorator';
import {
  Resolver,
  Mutation,
  Args,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { User } from '@user/model/user.model';
import { UserService } from '@user/service/user.service';
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
    private readonly userService: UserService,
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

  @Mutation(() => User)
  async initPassword(@Args('data') data: InitPasswordInput) {
    const user = await this.userService.initPassword(data);

    return user;
  }

  @Public()
  @Mutation(() => Token)
  async login(@Args('data') { username, password }: LoginInput) {
    const token = await this.authService.login(username, password);

    return token;
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

  @Mutation(() => User)
  async changePassowrd(
    @CurrentUserId() userId: number,
    @Args('data') chnagePasswordInput: ChangePasswordInput,
  ) {
    return await this.userService.changePassword(chnagePasswordInput, userId);
  }
}
