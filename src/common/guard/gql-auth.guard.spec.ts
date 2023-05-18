import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { GqlAuthGuard } from './gql-auth.guard';

describe('GqlAuthGuard', () => {
  let guard: GqlAuthGuard;
  const mockReflector = { getAllAndOverride: jest.fn() };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GqlAuthGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = moduleRef.get<GqlAuthGuard>(GqlAuthGuard);
  });

  it('should return true when the handler is decorated with `@Public()`', async () => {
    const mockContext = {
      getClass: jest.fn(),
      getHandler: jest.fn(),
    };
    mockReflector.getAllAndOverride.mockReturnValue(true);

    const result = await guard.canActivate(
      mockContext as unknown as ExecutionContext,
    );

    expect(result).toBe(true);
    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
  });

  it('should call the canActivate method of JwtAuthGuard when the handler is not decorated with `@Public()`', async () => {
    const context: ExecutionContext = {
      getClass: jest.fn(),
      getHandler: jest.fn(),
      switchToHttp: jest.fn(),
    } as any;

    mockReflector.getAllAndOverride.mockReturnValue(false);

    const mockSuperCanActivate = jest
      .spyOn(GqlAuthGuard.prototype, 'canActivate')
      .mockReturnValue(true);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    expect(mockSuperCanActivate).toHaveBeenCalledWith(context);
  });
});
