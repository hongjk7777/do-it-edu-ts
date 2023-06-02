import { validate } from 'class-validator';
import { LoginInput } from './login.input';

describe('LoginInput', () => {
  it('should pass validation with valid input', async () => {
    const input = new LoginInput();
    input.username = 'valid_username';
    input.password = 'valid_password';
    const errors = await validate(input);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with short username', async () => {
    const input = new LoginInput();
    input.username = 'short';
    input.password = 'valid_password';
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should fail validation with empty username', async () => {
    const input = new LoginInput();
    input.username = '';
    input.password = 'valid_password';
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with short password', async () => {
    const input = new LoginInput();
    input.username = 'valid_username';
    input.password = 'bad';
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should fail validation with short password', async () => {
    const input = new LoginInput();
    input.username = 'valid_username';
    input.password = '';
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});
