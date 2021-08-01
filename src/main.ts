import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Just a test')
    .setDescription('The test API description')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const HTTP_PORT = app.get(ConfigService).get<number>('HTTP_PORT');

  await app.listen(HTTP_PORT);

  logger.log(`http server listening: ${HTTP_PORT}`);
  logger.log(
    `open "http://localhost:${HTTP_PORT}/api" to access api description`,
  );
}
bootstrap();
