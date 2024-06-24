require('dotenv').config();
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize')

dotenv.config({ path: '.env' });

const dbConnect = new Sequelize({
    dialect: 'mysql',
    host: '127.0.0.1',
    username: 'root',
    password: '',
    port: '3306',
    database: 'chatbot',
    logging: false,
    dialectOptions: process.env.NODE_ENV === 'production'? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
  });

  // const dbConnect = new Sequelize({
  //   dialect: 'mysql',
  //   host: process.env.DBHOST,
  //   username: process.env.DBUSER,
  //   password: process.env.DBPASS,
  //   port: process.env.DBPORT,
  //   database: process.env.DBNAME,
  //   logging: false,
  //   dialectOptions: process.env.NODE_ENV === 'production'? {
  //     ssl: {
  //       require: true,
  //       rejectUnauthorized: false
  //     }
  //   } : {},
  // });
  module.exports = {dbConnect};