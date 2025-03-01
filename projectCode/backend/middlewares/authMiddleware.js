const User = require('../models/userModel');

// Middleware per verificare i ruoli
const checkRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ message: 'Utente non autenticato.' });
        }

        // Cerca l'utente nel database in base all'ID memorizzato nella sessione
        User.findOne({ where: { id: req.session.userId } })
            .then(user => {
                if (!user) {
                    return res.status(404).json({ message: 'Utente non trovato.' });
                }

                // Verifica se il ruolo dell'utente corrisponde a quello richiesto
                if (user.role !== requiredRole) {
                    return res.status(403).json({ message: 'Accesso negato. Non hai i permessi necessari.' });
                }

                // Se il ruolo è corretto, prosegue con la richiesta
                next();
            })
            .catch(error => res.status(500).json({ message: 'Errore del server.', error }));
    };
};

module.exports = {
    checkRole,
};
