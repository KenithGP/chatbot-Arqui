const { dbConnect } = require('../db/db');
const {DataTypes, TEXT} = require ('sequelize');
const { INTEGER, STRING } = DataTypes

const mensajes = dbConnect.define('mensajes', {
    id_mensaje: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_student: {
        type: INTEGER,
        allowNull: false,
    },
    id_tema: {
        type: STRING,
        allowNull: false,
    },
    remitente: {
        type: STRING,
        allowNull: false,
    },
    mensaje: {
        type: TEXT,
        allowNull: false,
    },
});

module.exports = mensajes;
