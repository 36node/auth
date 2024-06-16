import fs from 'fs';

import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import { SHA256 } from 'crypto-js';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import minMax from 'dayjs/plugin/minMax';
import * as sourceMapSupport from 'source-map-support';

import { settings } from 'src/config';
import { MongoErrorsInterceptor } from 'src/mongo';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { exceptionFactory } from './common/exception-factory';

dayjs.extend(isoWeek);
dayjs.extend(minMax);

const openapiPath = `openapi.json`;

async function bootstrap() {
  sourceMapSupport.install();
  const app = await NestFactory.create(AppModule, {
    cors: { exposedHeaders: ['Link', 'X-Total-Count'] },
  });
  app.setGlobalPrefix(settings.prefix);

  const config = new DocumentBuilder()
    .setTitle('Auth API Server')
    .setDescription('Auth API for auth service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${settings.prefix}/openapi`, app, document);

  app.use(compression());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, exceptionFactory }));

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalInterceptors(new MongoErrorsInterceptor());
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.MQTT,
      options: settings.mqtt,
    },
    { inheritAppConfig: true }
  );

  await app.startAllMicroservices();
  await app.listen(settings.port);

  // write openapi.json
  if (process.env.NODE_ENV === 'development') {
    const documentWithSha = {
      hash: SHA256(JSON.stringify(document, null, 2)).toString(),
      ...document,
    };
    fs.writeFileSync(openapiPath, JSON.stringify(documentWithSha, null, 2));
  }
}

bootstrap();
