import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '@user/user.service';
import UserInfo from '../dto/user-info.dto';
import { SignupInput } from '../input/signup.input';
import { PasswordService } from './password-service.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(userId: number): Promise<UserInfo> {
    const id = parseInt(userId.toString());
    const findUser = await this.userService.findOneById(id);

    return new UserInfo(findUser);
  }

  async login(username: string, pass: string) {
    const findUser = await this.userService.findOneByUsername(username);

    const passwordValid = this.passwordService.validatePassword(
      pass,
      findUser.password,
    );

    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }

    return await this.tokenService.generateTokens({
      userId: findUser.id.toString(),
    });
  }

  async signUp(userData: SignupInput) {
    const hashedPassword = await this.passwordService.hashPassword(
      userData.password,
    );

    const user = SignupInput.of(userData.username, hashedPassword);

    const savedUser = await this.userService.save(user);

    return await this.tokenService.generateTokens({
      userId: savedUser.id.toString(),
    });
  }
}
