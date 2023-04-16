import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { SignupInput } from 'src/auth/input/signup.input';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async save(userData: SignupInput): Promise<User> {
    const duplicatedUser = await this.prisma.user.findUnique({
      where: {
        username: userData.username,
      },
    });

    if (duplicatedUser) {
      throw new BadRequestException(
        '이미 같은 번호로 가입된 회원이 존재합니다.',
      );
    }

    const savedUser = await this.prisma.user.create({
      data: {
        ...userData,
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

    return findUser;
  }

  async findOneByUsername(username: string): Promise<User> {
    const findUser = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    return findUser;
  }

  async deleteOneById(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id: id,
      },
    });
  }
}
