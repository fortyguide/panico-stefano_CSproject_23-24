const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const Ticket = require('../models/ticketModel');
const Flight = require('../models/flightModel');
const History = require('../models/historyModel');
const { checkRole } = require('../middlewares/authMiddleware');
const { query, validationResult } = require('express-validator');

// Rotta per l'acquisto di un biglietto
router.post('/purchase', async (req, res) => {
    const { flightNumber } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Utente non autenticato.' });
    }

    try {
    
        const flight = await Flight.findOne({
            where: { flightNumber }
        });

        if (!flight) {
            return res.status(404).json({ message: 'Volo non trovato.' });
        }

        if (flight.availableSeats <= 0) {
            return res.status(400).json({ message: 'Non ci sono posti disponibili per questo volo.' });
        }

        const newTicket = await Ticket.create({
            flightNumber,
            destination: flight.destination,
            date: flight.departureTime,
            UserId: userId
        });

        flight.availableSeats -= 1;
        await flight.save();

        await History.create({
            userId: req.session.userId,
            operation: 'acquisto',
            ticketId: newTicket.id,
            flightNumber: flight.flightNumber,
            departureTime: flight.departureTime,
            destination: flight.destination,
            timestamp: new Date(),
        });

        res.status(201).json({ message: 'Biglietto acquistato con successo.', ticket: newTicket });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante l\'acquisto del biglietto.', error });
    }
});

// Rotta per la cancellazione di un biglietto
router.post('/cancel/:ticketId', async (req, res) => {
    const { ticketId } = req.params;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Utente non autenticato.' });
    }

    try {
        const ticket = await Ticket.findOne({ where: { id: ticketId, UserId: userId } });

        if (!ticket) {
            return res.status(404).json({ message: 'Biglietto non trovato.' });
        }

        if (ticket.status === 'cancelled') {
            return res.status(400).json({ message: 'Il biglietto è già stato cancellato.' });
        }

        if (ticket.checkinDone) {
            return res.status(400).json({ message: 'Non è possibile cancellare un biglietto dopo aver effettuato il check-in.' });
        }

        ticket.status = 'cancelled';
        ticket.timestamp = new Date();
        await ticket.save();

        const flight = await Flight.findOne({
            where: { flightNumber: ticket.flightNumber }
        });
        flight.availableSeats += 1;
        await flight.save();

        const historyRecord = await History.findOne({
            where: { ticketId: ticket.id, userId: req.session.userId, operation: 'acquisto' }
        });

        if (historyRecord) {
            historyRecord.operation = 'cancellazione';
            historyRecord.timestamp = new Date(); 
            await historyRecord.save();
        }

        res.status(200).json({ message: 'Biglietto cancellato con successo.' });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante la cancellazione del biglietto.', error });
    }
});

// Rotta per il check-in di un biglietto
router.post('/checkin/:ticketId', async (req, res) => {
    const { ticketId } = req.params;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Utente non autenticato.' });
    }

    try {
        const ticket = await Ticket.findOne({ where: { id: ticketId, UserId: userId } });

        if (!ticket) {
            return res.status(404).json({ message: 'Biglietto non trovato.' });
        }

        if (ticket.status === 'cancelled') {
            return res.status(400).json({ message: 'Il biglietto è stato cancellato e non può essere utilizzato per il check-in.' });
        }

        if (ticket.checkinDone) {
            return res.status(400).json({ message: 'Il check-in è già stato effettuato.' });
        }

        ticket.checkinDone = true;
        ticket.timestamp = new Date(); 
        await ticket.save();

        const historyRecord = await History.findOne({
            where: { ticketId: ticket.id, userId: req.session.userId, operation: 'acquisto' }
        });

        if (historyRecord) {
            historyRecord.operation = 'check-in';
            historyRecord.timestamp = new Date();
            historyRecord.seatNumber = await History.count({ where: { flightNumber: ticket.flightNumber, operation: 'check-in' } }) + 1;
            await historyRecord.save();
        }

        res.status(200).json({ message: 'Check-in completato con successo.' });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante il check-in del biglietto.', error });
    }
});

// Rotta di monitoraggio degli eventi sui biglietti (solo per admin)
router.get(
    '/monitoring',
    checkRole('admin'),
    [
        query('flightNumber')
            .optional()
            .isString()
            .withMessage('Il numero del volo deve essere una stringa.'),
        query('operation')
            .optional()
            .isIn(['acquisto', 'cancellazione', 'check-in'])
            .withMessage('L\'operazione deve essere uno tra: acquisto, cancellazione, check-in.'),
        query('departureTime')
            .optional()
            .isISO8601()
            .withMessage('La data deve essere in formato ISO 8601 (YYYY-MM-DDTHH:mm:ss).'),
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Il numero di pagina deve essere un intero positivo.'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Il limite deve essere un intero tra 1 e 100.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { flightNumber, operation, departureTime, page = 1, limit = 10 } = req.query;

        try {
    
            let whereClause = {};

            if (flightNumber) {
                whereClause.flightNumber = flightNumber;
            }

            if (operation) {
                whereClause.operation = operation;
            }

            if (departureTime) {
                whereClause.timestamp = {
                    [Op.gte]: departureTime
                };
            }

            const offset = (page - 1) * limit;

            const history = await History.findAndCountAll({
                where: whereClause,
                attributes: ['userId', 'ticketId', 'operation', 'flightNumber', 'departureTime', 'destination', 'timestamp'],
                offset,
                limit
            });

            res.status(200).json({
                totalRecords: history.count,
                totalPages: Math.ceil(history.count / limit),
                currentPage: page,
                history: history.rows
            });
        } catch (error) {
            res.status(500).json({ message: 'Errore durante il monitoraggio.', error });
        }
    }
);

module.exports = router;
