const { DataTypes } = require('sequelize');
const sequelize = require('../config/index');
const Flight = sequelize.define('Flight', {
  flightNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  departureTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  arrivalTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  availableSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = Flight;
