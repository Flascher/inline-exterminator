import path from 'path';
import fs from 'fs';

function *walkSync(dir) {
  const entities = fs.readdirSync(dir);

  console.log('entities:');
  console.log(entities);

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

const getAllModifiedFiles = (dir) => {
  const files = [ ...walkSync(dir) ];

  // test whether the filename contains a no-replace style suffix
  files.filter(file => file.split('.').length >= 3);

  return files;
}

const getModifiedFilesInDir = (dir) => {
  return fs.readdirSync(dir).filter(file => 
    !fs.statSync(file).isDirectory() && file.split('.').length >= 3
  );
}

export {
  getAllModifiedFiles,
  getModifiedFilesInDir
};