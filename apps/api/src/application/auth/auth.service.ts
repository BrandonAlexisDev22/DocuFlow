
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

export type LoginInput = {
  email: string;
  password: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async login(data: LoginInput) {
    // 1. Buscar usuario por correo
    const user = await this.usersService.findByEmail(
      data.email,
    );

    if (!user) {
      throw new UnauthorizedException(
        'Credenciales inválidas',
      );
    }

    // 2. Comparar contraseña con el hash almacenado
    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Credenciales inválidas',
      );
    }

    // 3. Devolver información pública del usuario
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
