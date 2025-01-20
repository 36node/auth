const fs = require('fs');

const { NestFactory } = require('@nestjs/core');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const commander = require('commander');

const { AppModule } = require('../dist/app.module');
const { SHA256 } = require('crypto-js');

async function bootstrap(prefix) {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix(prefix);

  const config = new DocumentBuilder()
    .setTitle('Auth API Server')
    .setDescription('Auth API for auth service')
    .setVersion('1.0')
    .addApiKey(
      {
        in: 'header',
        name: 'x-api-key',
        type: 'apiKey',
      },
      'ApiKey'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const documentWithSha = {
    hash: SHA256(JSON.stringify(document, null, 2)).toString(),
    ...document,
  };
  fs.writeFileSync('./openapi.json', JSON.stringify(documentWithSha, null, 2));

  await app.close();
}

const program = new commander.Command();
program
  .name('generate-swagger')
  .option('-p, --prefix <string>', 'route prefix', '')
  .action((options) => {
    bootstrap(options.prefix)
      .catch((err) => {
        console.error(err);
        process.exit(1);
      })
      .then(() => {
        process.exit(0);
      });
  });

program.parse(process.argv);
