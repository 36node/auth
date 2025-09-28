import fs from 'fs';

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SHA256 } from 'crypto-js';

import { GetAuthorizerQuery } from './auth';
import { ListCaptchasQuery } from './captcha';
import { ListEmailRecordsQuery } from './email';
import { ListGroupsQuery } from './group';
import { ListIndustriesQuery } from './industry';
import { ListNamespacesQuery } from './namespace';
import { ListRolesQuery } from './role';
import { ListSessionsQuery } from './session';
import { ListSmsRecordsQuery } from './sms';
import { ListThirdPartyQuery } from './third-party';
import { ListUsersQuery } from './user';

const openapiPath = `openapi.json`;

export function writeOpenapi(app: INestApplication<any>, prefix?: string) {
  const swaggerPrefix = prefix ? `${prefix}/openapi` : 'openapi';
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

  // write openapi.json
  if (process.env.NODE_ENV === 'development') {
    const documentWithSha = {
      hash: SHA256(JSON.stringify(document, null, 2)).toString(),
      ...document,
    };
    fs.writeFileSync(openapiPath, JSON.stringify(documentWithSha, null, 2));
  }
}
