import fs from 'fs';

import { gen } from '@36node/openapi-ts-gen';
import commander from 'commander';

const rootDir = __dirname + '/..';
const openapiPath = `${rootDir}/openapi.json`;

async function main(outputDir = `${rootDir}/sdk`) {
  // 创建目录
  const srcDir = `${outputDir}/src`;
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  // 生成 sdk
  const result = gen({ name: 'core', input: openapiPath });

  console.log('generate sdk to: ', outputDir);
  result.files.forEach((file) => {
    fs.writeFileSync(srcDir + '/' + file.filename, file.content);
  });
  writePackageJson(outputDir + '/package.json');
  fs.copyFileSync(rootDir + '/tsconfig.json', outputDir + '/tsconfig.json');
  fs.copyFileSync(rootDir + '/.npmrc', outputDir + '/.npmrc');
  console.log('generate sdk success');
}

async function writePackageJson(packageJsonPath: string) {
  const rootPackageJsonPath = rootDir + '/package.json';
  const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf-8'));

  const packageJson = {
    name: `${rootPackageJson.name}-sdk`,
    version: rootPackageJson.version,
    source: 'src/index.ts',
    main: 'dist/main.js',
    module: 'dist/module.js',
    types: 'dist/types.d.ts',
    files: ['dist'],
    scripts: {
      build: 'parcel build',
    },
    dependencies: {
      axios: '*',
    },
    devDependencies: {
      '@parcel/core': 'latest',
      '@parcel/packager-ts': 'latest',
      '@parcel/transformer-typescript-types': 'latest',
      'parcel': 'latest',
    },
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

const program = new commander.Command();
program
  .name('openapi-generator')
  .option('-o, --output <path>', 'sdk output directory')
  .action((options) => {
    main(options.output).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  });

program.parse(process.argv);
