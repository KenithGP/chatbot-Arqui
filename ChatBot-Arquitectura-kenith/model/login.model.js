const { dbConnect } = require('../db/db');
const {DataTypes} = require ('sequelize');
const { INTEGER, STRING } = DataTypes

const users = dbConnect.define('users', {
  id_user: {
    primaryKey: true,
    type: INTEGER,
    autoIncrement: true,
    allowNull: false
  },
  email: {
    type: STRING,
    allowNull: false,
  },
  password: {
    type: STRING,
    allowNull: false,
  }
}, { timestamps: true });

module.exports = users;