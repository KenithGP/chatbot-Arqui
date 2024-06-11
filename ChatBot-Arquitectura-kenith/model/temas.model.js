const { dbConnect } = require('../db/db');
const {DataTypes} = require ('sequelize');
const cursos = require('./cursos.model');
const { INTEGER, STRING } = DataTypes

const temas = dbConnect.define('temas', {
  id_tema: {
    primaryKey: true,
    type: INTEGER,
    autoIncrement: true,
    allowNull: false
  },
  id_curso: {
    foreignKey: true,
    type: INTEGER,
    allowNull: false,
    references: {
        model: cursos,
        key: 'id_curso',
    }
  },
  titulo: {
    type: STRING,
    allowNull: false,
  },
}, { timestamps: true });

module.exports = temas;