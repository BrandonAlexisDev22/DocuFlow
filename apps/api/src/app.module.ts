
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from './infrastructure/storage/storage.module';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { HealthController } from './presentation/health/health.controller';
import { UsersModule } from './presentation/users/users.module';
import { AuthModule } from './presentation/auth/auth.module';
import { DocumentsModule } from './presentation/documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    PrismaModule,
    UsersModule,
    AuthModule,
    DocumentsModule,
    StorageModule
  ],

  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
