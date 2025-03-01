const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { Op } = require('sequelize');

// Rotta per il recupero di tutti gli utenti
router.get('/users', async (req, res) => {
  const { email, name, surname, role, page = 1, limit = 10 } = req.query;

  try {
    const filters = {};
    if (email) filters.email = { [Op.like]: `%${email}%` };
    if (name) filters.name = { [Op.like]: `%${name}%` };
    if (surname) filters.surname = { [Op.like]: `%${surname}%` };
    if (role) filters.role = role;

    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      where: filters,
      offset,
      limit: parseInt(limit),
    });

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalUsers: count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Errore durante il recupero degli utenti.' });
  }
});

// Rotta per l'aggiornamento del ruolo di un utente
router.put('/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const user = await User.findByPk(id);
    if (user) {
      user.role = role;
      await user.save();
      res.json({ message: 'Ruolo aggiornato con successo.' });
    } else {
      res.status(404).json({ message: 'Utente non trovato.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Errore durante l\'aggiornamento del ruolo.' });
  }
});

module.exports = router;