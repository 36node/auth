import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Namespace, NamespaceSchema } from './entities/namespace.entity';
import { LoadNamespaceMiddleware } from './namespace-load.middleware';
import { NamespaceController } from './namespace.controller';
import { NamespaceService } from './namespace.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Namespace.name, schema: NamespaceSchema }])],
  controllers: [NamespaceController],
  providers: [NamespaceService],
  exports: [NamespaceService],
})
export class NamespaceModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoadNamespaceMiddleware)
      .forRoutes(
        { path: '*namespaces/:namespaceId', method: RequestMethod.DELETE },
        { path: '*namespaces/:namespaceId', method: RequestMethod.PATCH },
        { path: '*namespaces/:namespaceIdOrNs', method: RequestMethod.GET }
      );
  }
}
