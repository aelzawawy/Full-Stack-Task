import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcryptjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, any>>;
  let jwtService: Partial<Record<keyof JwtService, any>>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    id: '507f1f77bcf86cd799439011',
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'hashedPassword123',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
    };

    jwtService = {
      sign: vi.fn().mockReturnValue('mocked.jwt.token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signup', () => {
    it('should successfully register a new user and return a JWT', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      usersService.create!.mockResolvedValue(mockUser);
      vi.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashedPassword123' as any);

      const result = await authService.signup({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!',
      });

      expect(usersService.findByEmail).toHaveBeenCalledWith('jane@example.com');
      expect(usersService.create).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toHaveProperty('access_token', 'mocked.jwt.token');
      expect(result.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
      });
    });

    it('should throw ConflictException if email is already taken', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser);

      await expect(
        authService.signup({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('signin', () => {
    it('should successfully authenticate user with valid credentials', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser);
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => true as any);

      const result = await authService.signin({
        email: 'jane@example.com',
        password: 'Password123!',
      });

      expect(result).toHaveProperty('access_token', 'mocked.jwt.token');
      expect(result.user.email).toBe('jane@example.com');
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      await expect(
        authService.signin({
          email: 'notfound@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser);
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => false as any);

      await expect(
        authService.signin({
          email: 'jane@example.com',
          password: 'WrongPassword!',
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
