const { Model, DataTypes } = require('sequelize');
const _ = require('lodash');
const { newMysqlInstance } = require('../utils/utils');
require('dotenv').config();

const sequelize = newMysqlInstance();

const groups = JSON.parse(process.env.INIT_GROUP);

class Group extends Model {
  static publicFields() {
    return ['id', 'email', 'group'];
  }
}

Group.init(
  {
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    group: { type: DataTypes.STRING, allowNull: false },
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Group', // We need to choose the model name
  },
);

(async () => {
  await Group.sync();
  console.log('The table for the Group model was just (re)created!');
})();

async function initMigrateData() {
  for (const key in groups) {
    console.log(key);
    for (const ele of groups[key]) {
      console.log(ele);
      const inst = await Group.create({
        email: ele,
        group: key,
      });
      console.log(`Email ${inst.email} group info has been set up.`);
    }
  }
}

module.exports = { Group, initMigrateData };
