const { Sequelize } = require('sequelize');
const path = require('path');

// Inizializzazione di Sequelize con SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false 
});

module.exports = sequelize;
