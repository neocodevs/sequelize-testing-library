const fs = require("fs");
const Promise = require("bluebird");

const appDirectory = fs.realpathSync(process.cwd());
const configFile = require(`${appDirectory}/sequelize-testing-library.json`);
const { sequelize } = require(`${appDirectory}/${configFile.modelsFolder}`);
const fakers = require(`${process.cwd()}/${configFile.fakersFolder}`);
const { lowerCaseFirstLetter } = require("./utils");

function resetDB() {
  return Promise.map(Object.keys(sequelize.models), (model) =>
    sequelize.models[model].destroy({
      truncate: true,
      force: true,
      cascade: true,
    })
  );
}

function seedDB(settings) {
  return Promise.map(settings, seed);
}

function seed({ model, props = {}, count = 1 }) {
  const modelClass = sequelize.models[model];

  if (typeof modelClass === "undefined") {
    throw new Error("The provided model does not exist");
  }

  const faker = fakers[lowerCaseFirstLetter(model)];
  const times = [...Array(count)];

  return modelClass
    .bulkCreate(times.map(() => faker(props)))
    .then((instances) => instances.sort((a, b) => a.id - b.id))
    .then((instances) => instances.map((instance) => instance.toJSON()));
}

module.exports = { resetDB, seedDB };
