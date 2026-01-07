import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { signup, login } from '@/actions/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

describe('Auth Server Actions - Integration Tests', () => {
  const testEmailPrefix = 'test-integration';
  let testCounter = 0;

  beforeEach(() => {
    // Increment counter for unique emails
    testCounter++;
  });

  afterAll(async () => {
    // Cleanup: Delete all test users created during tests
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: testEmailPrefix,
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('signup', () => {
    it('should create a new user with hashed password', async () => {
      const formData = new FormData();
      const email = `${testEmailPrefix}-${testCounter}@example.com`;
      formData.append('name', 'Test User');
      formData.append('email', email);
      formData.append('password', 'Password123!');

      const result = await signup(null, formData);

      // Should not have errors
      expect(result?.errors).toBeUndefined();

      // User should be created in database
      const user = await prisma.user.findUnique({
        where: { email },
      });

      expect(user).toBeTruthy();
      expect(user?.name).toBe('Test User');
      expect(user?.email).toBe(email);
      expect(user?.role).toBe('CUSTOMER');

      // Password should be hashed (not plain text)
      expect(user?.password).not.toBe('Password123!');
      const isPasswordValid = await bcrypt.compare(
        'Password123!',
        user!.password
      );
      expect(isPasswordValid).toBe(true);
    });

    it('should reject duplicate email addresses', async () => {
      const email = `${testEmailPrefix}-duplicate-${testCounter}@example.com`;

      // Create first user
      const formData1 = new FormData();
      formData1.append('name', 'User One');
      formData1.append('email', email);
      formData1.append('password', 'Password123!');
      await signup(null, formData1);

      // Try to create second user with same email
      const formData2 = new FormData();
      formData2.append('name', 'User Two');
      formData2.append('email', email);
      formData2.append('password', 'DifferentPass123!');
      const result = await signup(null, formData2);

      // Should have error for duplicate email
      expect(result?.errors?.email).toBeTruthy();
      expect(result?.errors?.email).toContain('already');
    });

    it('should validate email format', async () => {
      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('email', 'invalid-email');
      formData.append('password', 'Password123!');

      const result = await signup(null, formData);

      // Should have validation error for email
      expect(result?.errors?.email).toBeTruthy();
    });

    it('should validate password length', async () => {
      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('email', `${testEmailPrefix}-${testCounter}@example.com`);
      formData.append('password', '123'); // Too short

      const result = await signup(null, formData);

      // Should have validation error for password
      expect(result?.errors?.password).toBeTruthy();
    });

    it('should require name field', async () => {
      const formData = new FormData();
      formData.append('email', `${testEmailPrefix}-${testCounter}@example.com`);
      formData.append('password', 'Password123!');
      // No name field

      const result = await signup(null, formData);

      // Should have validation error for name
      expect(result?.errors?.name).toBeTruthy();
    });
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      const email = `${testEmailPrefix}-login-${testCounter}@example.com`;
      const password = 'Password123!';

      // First create a user
      const signupData = new FormData();
      signupData.append('name', 'Login Test User');
      signupData.append('email', email);
      signupData.append('password', password);
      await signup(null, signupData);

      // Now try to login
      const loginData = new FormData();
      loginData.append('email', email);
      loginData.append('password', password);

      const result = await login(null, loginData);

      // Should not have errors
      expect(result?.errors).toBeUndefined();
    });

    it('should reject login with wrong password', async () => {
      const email = `${testEmailPrefix}-wrong-pass-${testCounter}@example.com`;

      // Create user
      const signupData = new FormData();
      signupData.append('name', 'Test User');
      signupData.append('email', email);
      signupData.append('password', 'CorrectPassword123!');
      await signup(null, signupData);

      // Try to login with wrong password
      const loginData = new FormData();
      loginData.append('email', email);
      loginData.append('password', 'WrongPassword123!');

      const result = await login(null, loginData);

      // Should have error
      expect(result?.errors?.credentials).toBeTruthy();
    });

    it('should reject login with non-existent email', async () => {
      const loginData = new FormData();
      loginData.append(
        'email',
        `${testEmailPrefix}-nonexistent-${testCounter}@example.com`
      );
      loginData.append('password', 'Password123!');

      const result = await login(null, loginData);

      // Should have error
      expect(result?.errors?.credentials).toBeTruthy();
    });

    it('should validate email format on login', async () => {
      const loginData = new FormData();
      loginData.append('email', 'invalid-email');
      loginData.append('password', 'Password123!');

      const result = await login(null, loginData);

      // Should have validation error
      expect(result?.errors?.email).toBeTruthy();
    });
  });

  describe('User Roles', () => {
    it('should create new users with CUSTOMER role by default', async () => {
      const email = `${testEmailPrefix}-role-${testCounter}@example.com`;

      const formData = new FormData();
      formData.append('name', 'Customer User');
      formData.append('email', email);
      formData.append('password', 'Password123!');

      await signup(null, formData);

      const user = await prisma.user.findUnique({
        where: { email },
      });

      expect(user?.role).toBe('CUSTOMER');
    });
  });
});
