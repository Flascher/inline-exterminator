import fs from 'fs';

const prepareCleanup = () => {
  const initialEntities = fs.readdirSync(`${__dirname}/../tests`);

  return () => {
    const allEntities = fs.readdirSync(`${__dirname}/..tests/`);

    const newEntities = allEntities.filter(entity => !initialEntities.includes(entity));

    console.log('files to be deleted:');
    console.log(newEntities);
    // newEntities.forEach(entity => fs.unlinkSync(entity));
  }
}

export default prepareCleanup;