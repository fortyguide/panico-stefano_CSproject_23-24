const sequelize = require('../config/index');
const { DataTypes } = require('sequelize');

const History = sequelize.define('History', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  operation: {
    type: DataTypes.ENUM('acquisto', 'cancellazione', 'check-in'),
    allowNull: false,
  },
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  flightNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  departureTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  flightStatus: {
    type: DataTypes.ENUM('attivo', 'cancellato', 'modificato'),
    allowNull: false,
    defaultValue: 'attivo',
  },
  seatNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = History;