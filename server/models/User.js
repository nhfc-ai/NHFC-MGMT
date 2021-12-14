const { Model, DataTypes } = require('sequelize');
const _ = require('lodash');
const sendEmail = require('../aws-ses');
const generateSlug = require('../utils/slugify');
const { getEmailTemplate } = require('./EmailTemplate');
const { newMysqlInstance } = require('../utils/utils');
require('dotenv').config();

const sequelize = newMysqlInstance();
// const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
//   host: process.env.MYSQL_SERVER,
//   dialect: 'mysql',
// });

class User extends Model {
  static publicFields() {
    return [
      'id',
      'displayName',
      'email',
      'avatarUrl',
      'slug',
      'department',
      'isAdmin',
      'isManagement',
    ];
  }

  static async signInOrSignUp({
    googleId,
    email,
    googleToken,
    displayName,
    department,
    avatarUrl,
    isManagement,
  }) {
    const user = await this.findOne({ where: { googleId } });

    if (user) {
      const modifier = {};

      if (googleToken.accessToken) {
        modifier.googleAccessToken = googleToken.accessToken;
      }

      if (googleToken.refreshToken) {
        modifier.googleRefreshToken = googleToken.refreshToken;
      }

      if (_.isEmpty(modifier)) {
        return user;
      }

      await user.update(modifier);

      return user;
    }

    const slug = await generateSlug(this, displayName);
    // const userCount = await this.find().countDocuments();
    const userCount = await this.count();

    const newUser = await this.create({
      googleId,
      email,
      googleAccessToken: googleToken.accessToken,
      googleRefreshToken: googleToken.refreshToken,
      displayName,
      department,
      slug,
      avatarUrl,
      isAdmin: userCount === 0,
      isManagement,
    });

    try {
      const template = await getEmailTemplate('welcome', {
        userName: displayName,
      });

      await sendEmail({
        from: process.env.EMAIL_ADDRESS_FROM,
        to: [email],
        subject: template.subject,
        body: template.message,
      });
    } catch (err) {
      console.error('Email sending error:', err);
    }

    return _.pick(newUser, User.publicFields());
  }
}

User.init(
  {
    displayName: { type: DataTypes.STRING, allowNull: true },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false },
    department: { type: DataTypes.STRING, allowNull: false },
    avatarUrl: { type: DataTypes.STRING, allowNull: false },
    googleAccessToken: { type: DataTypes.STRING, allowNull: true },
    googleRefreshToken: { type: DataTypes.STRING, allowNull: true },
    googleId: { type: DataTypes.STRING, allowNull: false, unique: true },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
    isManagement: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'User', // We need to choose the model name
  },
);

(async () => {
  await User.sync();
  console.log('The table for the User model was just (re)created!');
})();

module.exports = User;
