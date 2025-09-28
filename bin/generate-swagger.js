const { NestFactory } = require('@nestjs/core');
const commander = require('commander');

const { AppModule } = require('../dist/app.module');
const { writeOpenapi } = require('../dist/swagger');

/**
 * @param {string | undefined} prefix
 */
async function bootstrap(prefix) {
  const app = await NestFactory.create(AppModule, { logger: false });
  if (prefix) app.setGlobalPrefix(prefix);
  writeOpenapi(app, prefix);
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
