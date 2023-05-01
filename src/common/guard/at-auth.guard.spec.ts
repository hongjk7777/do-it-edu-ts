import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AtAuthGuard } from './at-auth.guard';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';

describe('AtAuthGuard', () => {
  let guard: AtAuthGuard;
  const mockReflector = { getAllAndOverride: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AtAuthGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<AtAuthGuard>(AtAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if the request is public', () => {
    const context: ExecutionContext = {
      getClass: jest.fn(),
      getHandler: jest.fn(),
      switchToHttp: jest.fn(),
    } as any;

    const isPublic = true;
    mockReflector.getAllAndOverride.mockReturnValue(isPublic);

    const result = guard.canActivate(context);
    expect(result).toBe(true);

    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
  });

  it('should call super.canActivate if the request is not public', () => {
    const context: ExecutionContext = {
      getClass: jest.fn(),
      getHandler: jest.fn(),
      switchToHttp: jest.fn(),
    } as any;

    const isPublic = false;
    mockReflector.getAllAndOverride.mockReturnValue(isPublic);
    const mockSuperCanActivate = jest
      .spyOn(AtAuthGuard.prototype, 'canActivate')
      .mockReturnValue(true);
    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    expect(mockSuperCanActivate).toHaveBeenCalledWith(context);
  });
});
