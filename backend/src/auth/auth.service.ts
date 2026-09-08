import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { SigninDto } from './dto/signin.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.usersService.findByEmail(signupDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    const newUser = await this.usersService.create({
      name: signupDto.name,
      email: signupDto.email,
      password: hashedPassword,
    });

    const userId = newUser._id?.toString() || (newUser as any).id;
    const token = this.jwtService.sign({
      sub: userId,
      email: newUser.email,
    });

    return {
      access_token: token,
      user: {
        id: userId,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    };
  }

  async signin(signinDto: SigninDto) {
    const user = await this.usersService.findByEmail(signinDto.email, true);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(signinDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const userId = user._id?.toString() || (user as any).id;
    const token = this.jwtService.sign({
      sub: userId,
      email: user.email,
    });

    return {
      access_token: token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }
}
