const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const History = require('../models/historyModel');

// Rotta per la lettura dello storico
router.get('/read', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Utente non autenticato.' });
    }

    try {
        const { operation, departureTime, destination, page = 1, limit = 10 } = req.query;

        const filters = { userId: req.session.userId };
        if (operation) {
            filters.operation = operation;
        }
        if (departureTime) {
            filters.departureTime = { [Op.gte]: departureTime };
        }
        if (destination) {
            filters.destination = {
                [Op.like]: `%${destination}%`,
            };
        }

        const offset = (page - 1) * limit;

        const { count, rows: history } = await History.findAndCountAll({
            where: filters,
            attributes: ['ticketId', 'operation', 'flightNumber', 'departureTime', 'destination', 'timestamp', 'flightStatus', 'seatNumber'],
            order: [['timestamp', 'DESC']],
            offset,
            limit: parseInt(limit),
        });

        if (history.length === 0) {
            return res.status(400).json({ message: 'Non è stata effettuata ancora nessuna operazione.' });
        }

        res.status(200).json({
            history,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalRecords: count,
        });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante il recupero dello storico.', error });
    }
});

module.exports = router;