import fs from 'fs';
import path from 'path';

function *walkSync(dir) {
  const entities = fs.readdirSync(dir);

  for (const entity of entities) {
    const pathToEntity = path.join(dir, entity);
    const isDir = fs.statSync(pathToEntity).isDirectory();

    if (isDir) {
      yield *walkSync(pathToEntity);
    } else {
      yield pathToEntity;
    }
  }
}

const prepareCleanup = () => {
  const initialEntities = [ ...walkSync(path.resolve(__dirname, '..')) ];

  return () => {
    const allEntities = [ ...walkSync(path.resolve(__dirname, '..')) ];

    const newEntities = allEntities.filter(entity => !initialEntities.includes(entity));
    newEntities.forEach(entity => fs.unlinkSync(`${entity}`));
  }
}

export default prepareCleanup;