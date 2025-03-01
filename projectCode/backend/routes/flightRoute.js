const express = require('express');
const router = express.Router();
const Flight = require('../models/flightModel');
const History = require('../models/historyModel');
const { check, validationResult } = require('express-validator');
const { checkRole } = require('../middlewares/authMiddleware');
const { Op } = require('sequelize');

// Rotta per aggiungere un nuovo volo (solo per admin)
router.post('/flights', checkRole('admin'), async (req, res) => {
    const { flightNumber, departureTime, arrivalTime, destination, availableSeats } = req.body;
  
    try {
      const newFlight = await Flight.create({ flightNumber, departureTime, arrivalTime, destination, availableSeats });
      res.status(201).json({ message: 'Volo creato con successo.', flight: newFlight });
    } catch (error) {
      res.status(500).json({ message: 'Errore durante la creazione del volo.', error });
    }
});
  
  // Rotta per leggere un volo specifico
router.get('/flights/:flightNumber', async (req, res) => {
    const { flightNumber } = req.params;
  
    try {
      const flight = await Flight.findOne({
        where: { flightNumber }
      });
      if (!flight) {
        return res.status(404).json({ message: 'Volo non trovato.' });
      }
      res.status(200).json({ flight });
    } catch (error) {
      res.status(500).json({ message: 'Errore durante il recupero del volo.', error });
    }
});

// Rotta per aggiornare un volo (solo per admin)
router.put('/flights/:id', checkRole('admin'), async (req, res) => {
    const { id } = req.params;
    const { flightNumber, departureTime, arrivalTime, destination, availableSeats } = req.body;
  
    try {
      const flight = await Flight.findByPk(id);
      if (!flight) {
        return res.status(404).json({ message: 'Volo non trovato.' });
      }
      // Aggiorna i dettagli del volo
      flight.flightNumber = flightNumber;
      flight.departureTime = departureTime;
      flight.arrivalTime = arrivalTime;
      flight.destination = destination;
      flight.availableSeats = availableSeats;
  
      await flight.save();
      res.status(200).json({ message: 'Volo aggiornato con successo.', flight });
    } catch (error) {
      res.status(500).json({ message: 'Errore durante l\'aggiornamento del volo.', error });
    }
});

// Rotta per cancellare un volo (solo per admin)
router.delete('/flights/:id', checkRole('admin'), async (req, res) => {
  const { id } = req.params;

  try {
    const flight = await Flight.findByPk(id);
    if (!flight) {
      return res.status(404).json({ message: 'Volo non trovato.' });
    }

    await History.update(
      { flightStatus: 'cancellato' },
      { where: { flightNumber: flight.flightNumber } }
    );
    
    await flight.destroy();

    res.status(200).json({ message: 'Volo cancellato con successo.' });
  } catch (error) {
    res.status(500).json({ message: 'Errore durante la cancellazione del volo.', error });
  }
});

// Rotta di ricerca dei voli con validazione, paginazione e filtro
router.get('/search', [
  // Validazione dei parametri di query
  check('flightNumber').optional().isString().withMessage('Il numero del volo deve essere una stringa.'),
  check('destination').optional().isString().withMessage('La destinazione deve essere una stringa.'),
  check('departureTime').optional().isISO8601().toDate().withMessage('La data di partenza deve essere in formato ISO 8601 (YYYY-MM-DDTHH:mm:ss).'),
  check('availableSeats').optional().isInt({ min: 0 }).withMessage('Il numero di posti disponibili deve essere un numero intero positivo.'),
  check('page').optional().isInt({ min: 1 }).withMessage('La pagina deve essere un numero intero positivo.'),
  check('limit').optional().isInt({ min: 1 }).withMessage('Il limite deve essere un numero intero positivo.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { flightNumber, destination, departureTime, availableSeats, page = 1, limit = 10 } = req.query;

  try {
      
      let searchCriteria = {};

      if (flightNumber) {
          searchCriteria.flightNumber = flightNumber;
      }

      if (destination) {
          searchCriteria.destination = {
              [Op.like]: `${destination}%` 
          };
      }


      if (departureTime) {
          searchCriteria.departureTime = {
              [Op.gte]: new Date(departureTime),  
          };
      }

      if (availableSeats) {
          searchCriteria.availableSeats = {
              [Op.gte]: availableSeats, 
          };
      }

      const offset = (page - 1) * limit;

      const { count, rows: flights } = await Flight.findAndCountAll({
          where: searchCriteria,
          offset: offset,
          limit: parseInt(limit),
      });

      if (flights.length === 0) {
          return res.status(404).json({ message: 'Nessun volo trovato con i criteri di ricerca specificati.' });
      }

      res.status(200).json({
          flights,
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalFlights: count,
      });
  } catch (error) {
      res.status(500).json({ message: 'Errore durante la ricerca dei voli.', error });
  }
});

// Rotta per leggere tutti i voli con paginazione e filtri
router.get('/flights', async (req, res) => {
  const { destination, departureTime, availableSeats, page = 1, limit = 10 } = req.query;

  try {
    let searchCriteria = {};

    if (destination) {
      searchCriteria.destination = {
        [Op.like]: `${destination}%`
      };
    }

    if (departureTime) {
      searchCriteria.departureTime = {
        [Op.gte]: new Date(departureTime)
      };
    }

    if (availableSeats) {
      searchCriteria.availableSeats = {
        [Op.gte]: availableSeats
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows: flights } = await Flight.findAndCountAll({
      where: searchCriteria,
      offset: offset,
      limit: parseInt(limit),
    });

    res.status(200).json({
      flights,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: 'Errore durante la ricerca dei voli.', error });
  }
});

module.exports = router;
  
  
  