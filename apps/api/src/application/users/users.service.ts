
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../infrastructure/database/prisma.service';

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE
  async create(data: CreateUserInput) {
    const existingUser = await this.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictException(
        'El correo electrónico ya está registrado',
      );
    }

    return this.prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // READ: Buscar todos los usuarios
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // READ: Buscar usuario por ID
  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        documents: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  // READ: Buscar usuario por correo
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // UPDATE
  async update(id: number, data: UpdateUserInput) {
    await this.findById(id);

    if (data.email) {
      const existingUser = await this.findByEmail(data.email);

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          'El correo electrónico ya está registrado',
        );
      }
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // DELETE
  async remove(id: number) {
    await this.findById(id);

    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
}
