
/// <reference types="node" />

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = Number(process.env.PORT ?? 3000);

    await app.listen(port);

    console.log(`DocuFlow API running on port ${port}`);
}

bootstrap();
