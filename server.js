const express = require('express');
const cors = require('cors'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { checkUserExists, registerUser, getUserByEmail } = require('./consultas'); 

dotenv.config();
const app = express();

app.use(cors());  
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.post('/usuarios', async (req, res) => {
    const { email, password, rol, lenguage } = req.body;
    try {
        const userExists = await checkUserExists(email);
        if (userExists) {
            return res.status(400).send('Usuario ya registrado');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await registerUser(email, hashedPassword, rol, lenguage);
        res.status(201).send('Usuario creado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al crear usuario');
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(400).send('Usuario no encontrado');
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send('Contraseña incorrecta');
        }
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.get('/usuarios', authenticateToken, async (req, res) => {
    try {
        const user = await getUserByEmail(req.user.email);
        if (!user) {
            return res.status(404).send('Usuario no encontrado');
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});
