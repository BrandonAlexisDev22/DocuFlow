
import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { AuthService } from '../../application/auth/auth.service';
import { UsersService } from '../../application/users/users.service';

import { JwtAuthGuard } from '../../infrastructure/security/guards/jwt-auth.guard';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: AuthenticatedRequest) {
    const user = await this.usersService.findById(req.user.userId);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
