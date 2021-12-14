const { Model, DataTypes } = require('sequelize');
const _ = require('lodash');
const { newMysqlInstance } = require('../utils/utils');

require('dotenv').config();

const sequelize = newMysqlInstance();

class EmailTemplate extends Model {}

EmailTemplate.init(
  {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    subject: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.STRING(5000), allowNull: false },
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'EmailTemplate', // We need to choose the model name
  },
);

(async () => {
  await EmailTemplate.sync();
  console.log('The table for the EmailTemplate model was just (re)created!');
})();

// module.exports = EmailTemplate;

async function getEmailTemplate(name, params) {
  const et = await EmailTemplate.findOne({ name: name }); // eslint-disable-line

  if (!et) {
    throw new Error(`No EmailTemplates found.`);
  }

  return {
    message: _.template(et.message)(params),
    subject: _.template(et.subject)(params),
  };
}

async function insertTemplates() {
  const templates = [
    {
      name: 'welcome',
      subject: 'Welcome to NHFC-MGMT',
      message: `<%= userName %>,
          <p>
            Thanks for signing up for NHFC-MGMT!
          </p>
          <p>
            NHFC-MGMT is a brand new web service platform, which aims to facilitate daily work of each NHFC staff.
            Please select the option Got quesiton? from your avatar if you have any questions or requests. Thank you.
          </p>
  
          Jia Wang
        `,
    },
  ];

  for (const t of templates) { // eslint-disable-line
    const et = await EmailTemplate.findOne({ name: t.name }); // eslint-disable-line

    const message = t.message.replace(/\n/g, '').replace(/[ ]+/g, ' ').trim();

    if (!et) {
      try {
        await EmailTemplate.create({ ...t, message }); // eslint-disable-line
      } catch (err) {
        console.error('insertTemplates() create error:', err);
      }
    } else if (et.subject !== t.subject || et.message !== message) {
      try {
        await et.update({ message: message, subject: t.subject }); // eslint-disable-line
      } catch (err) {
        console.error('insertTemplates() update error:', err);
      }
    }
  }
}

exports.insertTemplates = insertTemplates;
exports.getEmailTemplate = getEmailTemplate;
