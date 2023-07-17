import { ChangePasswordInput } from '@auth/input/change-password.input';
import { InitPasswordInput } from '@auth/input/init-password.input';
import { SignupInput } from '@auth/input/signup.input';
import { PasswordService } from '@auth/service/password-service.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
  ) {}

  async save(userData: SignupInput): Promise<User> {
    const duplicatedUser = await this.prisma.user.findUnique({
      where: {
        username: userData.username,
      },
    });

    if (duplicatedUser) {
      throw new ConflictException('이미 같은 번호로 가입된 회원이 존재합니다.');
    }

    const savedUser = await this.prisma.user.create({
      data: {
        ...userData,
      },
    });

    return savedUser;
  }

  async initPassword(userData: InitPasswordInput): Promise<User> {
    const initPassword =
      userData.username + this.configService.get('INIT_PASSWORD');

    const newPassword = await this.passwordService.hashPassword(initPassword);

    const savedUser = await this.prisma.user.update({
      where: {
        username: userData.username,
      },
      data: {
        password: newPassword,
      },
    });

    return savedUser;
  }

  async changePassword(
    changePasswordInput: ChangePasswordInput,
    userId: number,
  ): Promise<User> {
    const newPassword = await this.passwordService.hashPassword(
      changePasswordInput.newPassword,
    );

    const savedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: newPassword,
      },
    });

    return savedUser;
  }

  async findOneById(id: number): Promise<User> {
    const findUser = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!findUser) {
      throw new NotFoundException('해당하는 유저가 없습니다.');
    }

    return findUser;
  }

  async findOneByUsername(username: string): Promise<User> {
    const findUser = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!findUser) {
      throw new NotFoundException('해당하는 유저가 없습니다.');
    }

    return findUser;
  }

  async deleteOneById(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id: id,
      },
    });
  }

  async deleteOneByPhoneNum(userName: string): Promise<void> {
    await this.prisma.user.delete({
      where: {
        username: userName,
      },
    });
  }
}
