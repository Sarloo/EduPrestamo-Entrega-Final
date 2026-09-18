const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'src');
const destination = path.join(root, 'dist');

fs.rmSync(destination, { recursive: true, force: true });
fs.cpSync(source, destination, {
  recursive: true,
  filter(currentSource) {
    const relative = path.relative(source, currentSource);
    return !relative.split(path.sep).some((segment) =>
      ['data', '.env', '.git'].includes(segment),
    );
  },
});

const manifest = {
  name: 'eduprestamo',
  version: require('../package.json').version,
  builtAt: new Date(0).toISOString(),
};
fs.writeFileSync(
  path.join(destination, 'build-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

process.stdout.write(`Construccion creada en ${destination}\n`);
