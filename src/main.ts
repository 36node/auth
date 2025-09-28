import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import compression from 'compression';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import minMax from 'dayjs/plugin/minMax';
import * as sourceMapSupport from 'source-map-support';

import { MongoErrorsInterceptor } from 'src/mongo';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { exceptionFactory } from './common/exception-factory';
import { port, prefix } from './config/config';
import { writeOpenapi } from './swagger';

dayjs.extend(isoWeek);
dayjs.extend(minMax);

async function bootstrap() {
  sourceMapSupport.install();
  const app = await NestFactory.create(AppModule, {
    cors: { exposedHeaders: ['Link', 'X-Total-Count'] },
  });

  if (prefix) {
    app.setGlobalPrefix(prefix);
  }

  app.use(compression());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, exceptionFactory }));

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalInterceptors(new MongoErrorsInterceptor());

  // setup swagger
  writeOpenapi(app, prefix);

  await app.listen(port);
}

bootstrap();
