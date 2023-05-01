import { validate } from 'class-validator';
import { SignupInput } from './signup.input';

describe('signupInput', () => {
  it('should pass validation with valid input', async () => {
    const input = new SignupInput('valid_username', 'valid_password');
    const errors = await validate(input);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with short username', async () => {
    const input = new SignupInput('short', 'valid_password');
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should fail validation with empty username', async () => {
    const input = new SignupInput('', 'valid_password');
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with short password', async () => {
    const input = new SignupInput('valid_username', 'short');
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should fail validation with empty password', async () => {
    const input = new SignupInput('valid_username', '');
    const errors = await validate(input);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});
