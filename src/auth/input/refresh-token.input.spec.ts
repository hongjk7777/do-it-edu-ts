import { validate } from 'class-validator';
import { RefreshTokenInput } from './refresh-token.input';

describe('refreshTokenInput', () => {
  it('should pass validation with valid input', async () => {
    const input = new RefreshTokenInput();
    input.token = 'valid.jwt.token';
    const errors = await validate(input);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with invalid jwt', async () => {
    const input = new RefreshTokenInput();
    input.token = 'not jwt token';
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isJwt');
  });

  it('should fail validation with empty input', async () => {
    const input = new RefreshTokenInput();
    input.token = '';
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});
