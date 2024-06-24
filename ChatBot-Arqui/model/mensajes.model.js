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
        type: INTEGER,
        allowNull: false,
    },
    remitente: {
        type: STRING,
        allowNull: false,
    },
    mensaje: {
        type: TEXT,
        allowNull: true,
    },
    imageUrl: {
        type: STRING,
        allowNull: true,
    }
});

module.exports = mensajes;
