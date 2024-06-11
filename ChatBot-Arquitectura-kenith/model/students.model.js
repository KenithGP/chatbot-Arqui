const { dbConnect } = require('../db/db');
const {DataTypes} = require ('sequelize');
const { INTEGER, STRING } = DataTypes

const students = dbConnect.define('students', {
  id_student: {
    primaryKey: true,
    type: INTEGER,
    autoIncrement: true,
    allowNull: false
  },
  nombres: {
    type: STRING,
    allowNull: false,
  },
  apellidos: {
    type: STRING,
    allowNull: false,
  },
  grado: {
    type: STRING,
    allowNull: false,
  },
  genero: {
    type: STRING,
    allowNull: false,
  },
  fecha_nacimiento: {
    type: STRING,
    allowNull: false,
  },
  id_user: {
    type: INTEGER,
    allowNull: false,
  }
}, { timestamps: true });

module.exports = students;