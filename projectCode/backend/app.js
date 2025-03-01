const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const sequelize = require('./config/index');
const authRoutes = require('./routes/authRoute');
const ticketRoutes = require('./routes/ticketRoute');
const flightRoutes = require('./routes/flightRoute');
const historyRoutes = require('./routes/historyRoute');
const userRoleRoutes = require('./routes/userRoleRoute');
const app = express();

// Middleware di sicurezza (Helmet)
app.use(helmet());

// Configurazione CORS
const allowedOrigins = ['https://localhost:8081', 
                        'https://localhost:8082',
                        'https://localhost:8083', 
                        'https://localhost:8084', 
                        'https://localhost:8085', 
                        'https://localhost:8086', 
                        'https://localhost:8087', 
                        'https://localhost:8088', 
                        'https://localhost:8089', 
                        'https://localhost:8090' ];
app.use(cors({
    origin: (origin, callback) => {
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Non consentito da CORS'));
        }
    },
    credentials: true // Permette l'invio di credenziali come cookie
}));

// Configurazione sessioni
app.use(session({
    secret: 'il_tuo_segreto_di_sessione',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: false,   // Impedisce l'accesso ai cookie da JavaScript
        secure: false,     // Imposta secure a true solo su HTTPS
        sameSite: 'lax' // Protezione contro attacchi CSRF
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint di test
app.get('/', (req, res) => {
    res.send('Server Express HTTPS è in esecuzione!');
});

// Configurazione delle chiavi SSL per HTTPS
const options = {
    key: fs.readFileSync(path.join(__dirname, 'localhost.key')), 
    cert: fs.readFileSync(path.join(__dirname, 'localhost.crt'))   
};

// Test della connessione al database
sequelize.authenticate()
    .then(() => {
        console.log('Connessione al database avvenuta con successo.');
    })
    .catch(err => {
        console.error('Errore di connessione al database:', err);
    });

// Sincronizzazione dei modelli User, Ticket, History e Flight con il database
const syncModels = async () => {
    try {
        await sequelize.sync();
        console.log('Modelli sincronizzati con successo.');
    } catch (err) {
        console.error('Errore nella sincronizzazione del database:', err);
    }
};

syncModels();

// Utilizzo delle rotte
app.use('/api/auth', authRoutes);
app.use('/api/ticket', ticketRoutes);
app.use('/api/flight', flightRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/user', userRoleRoutes);

// Avvio del server HTTPS
https.createServer(options, app).listen(3000, () => {
    console.log('Server HTTPS in ascolto sulla porta 3000');
});