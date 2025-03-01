const { DataTypes } = require('sequelize');
const sequelize = require('../config/index');
const User = require('./userModel'); 

const Ticket = sequelize.define('Ticket', {
  flightNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
	allowNull: false,
    defaultValue: 'active'
  },
  checkinDone: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

Ticket.belongsTo(User);

module.exports = Ticket;
