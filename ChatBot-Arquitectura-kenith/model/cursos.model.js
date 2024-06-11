const { dbConnect } = require('../db/db');
const {DataTypes} = require ('sequelize');
const { INTEGER, STRING } = DataTypes

const cursos = dbConnect.define('cursos', {
  id_curso: {
    primaryKey: true,
    type: INTEGER,
    autoIncrement: true,
    allowNull: false
  },
  nombre: {
    type: STRING,
    allowNull: false,
  },
  descripcion: {
    type: STRING,
    allowNull: false,
  }
}, { timestamps: true });

module.exports = cursos;