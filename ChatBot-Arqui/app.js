require('dotenv').config();
const dotenv = require('dotenv');
const express = require('express');
const session = require('express-session');
const path = require('path');
const {dbConnect} = require ('./db/db');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const users = require('./model/login.model');
const students = require('./model/students.model');
const cursos = require('./model/cursos.model');
const temas = require('./model/temas.model');
const { sendQueryToOpenAI } = require('./controlador/openIA');
const mensajes = require('./model/mensajes.model');

dbConnect.authenticate()
.then(() => console.log('Db authenticated'))
.catch(err => console.log(err));

dbConnect.sync()
.then(() => console.log('Db synced'))
.catch(err => console.log(err));

const app = express();
const server = http.createServer(app);
const secret = crypto.randomBytes(32).toString('hex');

app.use(session({
    secret: `${secret}`,
    resave: false,
    saveUninitialized: false,
  }));

app.use(bodyParser.json());
app.use(cookieParser());

const requireLogin = (req, res, next) => {
    if (req.session.user) {
        next(); 
    } else {
        res.redirect('/login'); 
    }
};

const saveMessage = async (id_student, id_tema, remitente, mensaje) => {
    try {
        await mensajes.create({
            id_student,
            id_tema,
            remitente,
            mensaje
        });
    } catch (error) {
        console.log('Error al guardar el mensaje: ', error);
    }
}

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
        } else {
            res.redirect('/login');
        }
    });
});

app.use('/home/css', express.static(path.join(__dirname, 'css'), {extensions: ['css']}));
app.use('/home/js', express.static(path.join(__dirname, 'controlador'), {extensions: ['js']}));
app.use('/home/img', express.static(path.join(__dirname, 'img'), {extensions: ['.png']}));
app.use('/home/html', express.static(path.join(__dirname, 'vista'), {extensions: ['.html']})); 

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'vista', 'login.vista.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'vista', 'register.vista.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'vista', 'home.vista.html'));
});

app.get('/cursos', (req, res) => {
    res.sendFile(path.join(__dirname, 'vista', 'cursos.vista.html'));
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'vista', 'chatPrueba.vista.html'));
});

server.listen(9000, () => {
    console.log("Servidor iniciado en el port: 9000");
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body)
    try {
        const user = await users.findOne({ where: { email } });

        if (user) {
            if (password === user.password) {
                req.session.user = user;
                res.status(200).send('Inicio de sesión exitoso');
            } else {
                res.status(401).send('Correo electrónico o contraseña incorrectos');
            }
        } else {
            res.status(401).send('Correo electrónico o contraseña incorrectos');
        }

    } catch (error) {
        console.error('Error al intentar iniciar sesión:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.post('/register', async (req, res) => {
    const { nombres, apellidos, nacimiento, email, password, grado, genero } = req.body;
    // console.log(req.body)

    try {
        const user = await users.create({
            email: email,
            password: password
        });
        
        await students.create({
            nombres,
            apellidos,
            fecha_nacimiento: nacimiento,
            grado,
            genero,
            id_user: user.id_user
        });
        
        res.status(200).send('Registro exitoso');

    } catch (error) {
        console.error('Error al intentar registrar usuario:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.get('/student-info', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('No autorizado');
    }

    try {
        const student = await students.findOne({
            where: { id_user: req.session.user.id_user },
        });
        // console.log(req.session.user)
        
        if (student) {
            res.json({
                nombres: student.nombres,
                apellidos: student.apellidos,
                fecha_nacimiento: student.fecha_nacimiento,
                grado: student.grado,
                genero: student.genero,
                email: req.session.user.email
            });
        } else {
            res.status(404).send('Estudiante no encontrado');
        }
    } catch (error) {
        console.error('Error al obtener los datos del estudiante:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.get('/topics', async (req, res) => {
    //nombre del curso seleccionado
    const nombre = req.query.course;
    // console.log('get topics: ', nombre);

    if (!nombre) {
        return res.status(400).send({ error: 'Nombre del curso es requerido'});
    } 

    const cursosInfo = await cursos.findOne({
        where: {nombre}
    });

    const id_curso = cursosInfo.id_curso
    
    const topics = await temas.findAll({
        where: {id_curso}
    });

    res.json(topics);
});


app.post('/api/chat', async (req, res) => {
    try {
        const { question, topic } = req.body;
        const userId = req.session.user.id_user;  // Asegúrate de que el ID del usuario esté disponible en la sesión
        const titulo = topic;

        console.log('Pregunta recibida:', question);

        const searchTema = await temas.findOne({
            where: {titulo}
        })
        const id_tema = searchTema.id_tema;

        const botResponse = await sendQueryToOpenAI(question);

        // Guardar mensaje del usuario
        await saveMessage(userId, id_tema, 'user', question);

        // Guardar respuesta del bot
        await saveMessage(userId, id_tema, 'bot', botResponse);

        res.json({ response: botResponse });
    } catch (error) {
        console.error('Error al procesar la solicitud de chat:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


app.get('/api/chat/messages', async (req, res) => {
    try {
        const id_student = req.session.user.id_user;
        const titulo = req.query.topic;

        const searchTema = await temas.findOne({
            where: {titulo}
        })

        const id_tema = searchTema.id_tema

        if (!id_student || !id_tema) {
            return res.status(400).send({ error: 'Usuario o tema no especificado' });
        }

        const messages = await mensajes.findAll({
            where: {
                id_student,
                id_tema
            },
            order: [['createdAt', 'ASC']]
        });

        res.json(messages);
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
