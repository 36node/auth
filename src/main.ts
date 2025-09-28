import fs from 'fs';

import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import { SHA256 } from 'crypto-js';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import minMax from 'dayjs/plugin/minMax';
import * as sourceMapSupport from 'source-map-support';

import { MongoErrorsInterceptor } from 'src/mongo';

import { AppModule } from './app.module';
import { GetAuthorizerQuery } from './auth';
import { ListCaptchasQuery } from './captcha';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { exceptionFactory } from './common/exception-factory';
import { port, prefix } from './config/config';
import { ListEmailRecordsQuery } from './email';
import { ListGroupsQuery } from './group';
import { ListIndustriesQuery } from './industry';
import { ListNamespacesQuery } from './namespace';
import { ListRolesQuery } from './role';
import { ListSessionsQuery } from './session';
import { ListSmsRecordsQuery } from './sms';
import { ListThirdPartyQuery } from './third-party';
import { ListUsersQuery } from './user';

dayjs.extend(isoWeek);
dayjs.extend(minMax);

const openapiPath = `openapi.json`;

async function bootstrap() {
  sourceMapSupport.install();
  const app = await NestFactory.create(AppModule, {
    cors: { exposedHeaders: ['Link', 'X-Total-Count'] },
  });

  let swaggerPrefix = 'openapi';
  if (prefix) {
    app.setGlobalPrefix(prefix);
    swaggerPrefix = `${prefix}/${swaggerPrefix}`;
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auth API Server')
    .setDescription('Auth API for auth service')
    .setVersion('2.0')
    .addApiKey(
      {
        in: 'header',
        name: 'x-api-key',
        type: 'apiKey',
      },
      'ApiKey'
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [
      ListUsersQuery,
      ListNamespacesQuery,
      GetAuthorizerQuery,
      ListCaptchasQuery,
      ListEmailRecordsQuery,
      ListGroupsQuery,
      ListIndustriesQuery,
      ListRolesQuery,
      ListSessionsQuery,
      ListSmsRecordsQuery,
      ListThirdPartyQuery,
    ],
  });
  SwaggerModule.setup(swaggerPrefix, app, document);

  app.use(compression());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, exceptionFactory }));

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalInterceptors(new MongoErrorsInterceptor());

  await app.listen(port);

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
