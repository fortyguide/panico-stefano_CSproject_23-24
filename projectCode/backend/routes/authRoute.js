const express = require('express');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../models/userModel');
const router = express.Router();

// Rotta di registrazione
router.post('/register', [
    check('email').isEmail().withMessage('Inserisci un indirizzo email valido.'),
    check('password').isLength({ min: 6 }).withMessage('La password deve contenere almeno 6 caratteri.'),
    check('name').notEmpty().withMessage('Il nome è obbligatorio.'),
    check('surname').notEmpty().withMessage('Il cognome è obbligatorio.'),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, surname, role = 'user' } = req.body;

    try {
        
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ errors: [{ msg: 'Email già in uso.' }] });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword, name, surname, role });

        res.status(201).json({ message: 'Utente registrato con successo.', userId: newUser.id });
    } catch (error) {
        console.error('Errore interno:', error.message);
        res.status(500).json({ errors: [{ msg: 'Errore interno del server. Riprova più tardi.' }] });
    }
});

module.exports = router;

// Rotta per il login di un utente
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(400).json({ message: 'Email o password non corretti.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Email o password non corretti.' });
        }

        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.userPassword = user.password;
        res.status(200).json({ message: 'Login riuscito.' });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante il login.', error });
    }
});

// Rotta per la visualizzazione del profilo utente
router.get('/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Utente non autenticato.' });
    }

    try {
        const user = await User.findByPk(req.session.userId, {
            attributes: ['email', 'name', 'surname', 'role']
        });
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato.' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante il recupero del profilo.', error });
    }
});

// Rotta per la modifica del profilo utente
router.put('/profile/edit', async (req, res) => {
    const { name, surname, email, password, newPassword } = req.body;

    if (!req.session.userId) {
        return res.status(401).json({ message: 'Utente non autenticato.' });
    }

    try {
        const user = await User.findByPk(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato.' });
        }

        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email già in uso.' });
            }
            user.email = email;
        }

        if (password && newPassword) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'La password attuale non è corretta.' });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }

        user.name = name || user.name;
        user.surname = surname || user.surname;

        await user.save();

        res.status(200).json({ message: 'Profilo aggiornato con successo.', user });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante l\'aggiornamento del profilo.', error });
    }
});

// Rotta per il logout dell'utente
router.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Errore durante il logout.' });
            } else {
                return res.status(200).json({ message: 'Logout riuscito.' });
            }
        });
    } else {
        return res.status(400).json({ message: 'Nessuna sessione attiva.' });
    }
});

module.exports = router;
