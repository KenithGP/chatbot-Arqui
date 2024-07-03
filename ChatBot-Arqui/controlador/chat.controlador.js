document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const grado = params.get('Grado');
    const tema = params.get('Tema');
    const isEvaluation = window.location.pathname.startsWith('/evaluacion');

    const form = document.getElementById('message-form');
    const userInput = document.getElementById('user-input');
    const imageInput = document.getElementById('image-input');
    const chatWindow = document.getElementById('chat-window');
    const courseName = document.getElementById('name-course');
    const youtubeVideosDiv = document.getElementById('youtube-videos');
   

    let initialMessage = '';
    let nextPageToken = '';
    let displayedVideoIds = new Set();

    if (grado && tema) {
        if (isEvaluation) {
            initialMessage = `Hola, necesito que me hagas una evaluación sobre el tema ${tema} para el grado ${grado}. La nota máxima que puedo sacar es 20 y la evaluación debe tener 10 preguntas. Por favor, hazlo en un formato de evaluación con cada pregunta numerada y separada por una líneas en blanco, sin darme las respuestas hasta que termine.`;

            getBotResponse(initialMessage, tema).then(botResponse => {
                appendMessage('bot', botResponse);
            }).catch(error => {
                console.error('Error al obtener respuesta del bot:', error);
            });
        } else {

            initialMessage = `
                    <h2>Información sobre el tema: ${tema}</h2>
                    <p>Grado: ${grado}</p>
                    <p>Por favor, mantén un formato entendible y ordenado, manteniendo los espacios necesarios para que los pueda entender un niño de nivel primaria y si puedes usa algunos emojis.</p>
                    <p>A continuación, algunas instrucciones específicas:</p>
                    <ul>
                        <li>Usa títulos claros y concisos y explica el tema de manera breve y entendible.</li>
                        <li>Incluye ejemplos 5 ejemplos usando correctamente los signos que corresponden al tema </li>
                    </ul>`;

            const previousMessages = await loadPreviousMessages(tema);
            previousMessages.forEach(message => {
                if (message.imageUrl) {
                    appendMessage(message.remitente, `<img src="${message.imageUrl}" alt="Image">`);
                } else {
                    appendMessage(message.remitente, message.mensaje);
                }
            });

            if (previousMessages.length === 0) {
                getBotResponse(initialMessage, tema).then(botResponse => {
                    appendMessage('bot', botResponse);
                }).catch(error => {
                    console.error('Error al obtener respuesta del bot:', error);
                });
            }
        }

        courseName.textContent = tema;
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const message = userInput.value.trim();
        const formData = new FormData();

        if (message !== '') {
            formData.append('question', message);
            appendMessage('user', message);
        }

        if (imageInput.files.length > 0) {
            formData.append('image', imageInput.files[0]);
            formData.append('topic', tema);

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                appendMessage('user', `<img src="${data.imageUrl}" alt="Image">`);

                const botResponse = await getBotResponse('Imagen', tema, data.imageUrl);
                appendMessage('bot', botResponse);

                imageInput.value = ''; // Resetear el input de imagen
            } catch (error) {
                console.error('Error al subir la imagen:', error);
            }
        } else {
            if (message !== '') {
                const botResponse = await getBotResponse(message, tema);
                appendMessage('bot', botResponse);

                // Si el usuario pide recomendaciones de videos
                if (message.toLowerCase().includes('video')) {
                    const videos = await searchYouTubeVideos(tema);
                    displayYouTubeVideos(videos);
                } else {
                    youtubeVideosDiv.innerHTML = ''; // Limpiar los videos si no se piden recomendaciones
                }

                userInput.value = ''; // Resetear el input de texto
            }
        }
    });

    async function loadPreviousMessages(topic, isEvaluation) {
        try {
            const response = await fetch(`/api/chat/messages?topic=${encodeURIComponent(topic)}`);
            const messages = await response.json();
            return messages.filter(message => {
                if (isEvaluation) {
                    return message.mensaje.includes('evaluación');
                } else {
                    return !message.mensaje.includes('evaluación');
                }
            });
        } catch (error) {
            console.error('Error al cargar mensajes previos:', error);
            return [];
        }
    }

    function getBotResponse(userMessage, topic, imageUrl = null) {
        const body = { question: userMessage, topic };
        if (imageUrl) {
            body.imageUrl = imageUrl;
        }

        return fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(response => response.json())
        .then(data => data.response)
        .catch(error => {
            console.error('Error al obtener respuesta del bot:', error);
            return 'Lo siento, ha ocurrido un error.';
        });
    }

    function appendMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');

        if (message.startsWith('<iframe') || message.startsWith('<img')) {
            messageElement.innerHTML = message;
        } else {
            const lines = message.split('\n');
            lines.forEach(line => {
                const lineElement = document.createElement('p');
                lineElement.innerHTML = line;
                messageElement.appendChild(lineElement);
            });
        }

        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    async function searchYouTubeVideos(topic) {
        try {
            const response = await fetch(`/api/youtube/videos?query=${encodeURIComponent(topic)}&pageToken=${nextPageToken}`);
            const data = await response.json();

            nextPageToken = data.nextPageToken; // Actualiza el token para la siguiente página de resultados

            const uniqueVideos = data.videos.filter(video => !displayedVideoIds.has(video.id));
            uniqueVideos.forEach(video => displayedVideoIds.add(video.id)); // Agrega los nuevos videos al set

            return uniqueVideos;
        } catch (error) {
            console.error('Error al buscar videos en YouTube:', error);
            return [];
        }
    }

    function displayYouTubeVideos(videos) {
        youtubeVideosDiv.innerHTML = '';
        videos.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.classList.add('video-item');
            videoElement.innerHTML = `
                <iframe width="560" height="315" src="https://www.youtube.com/embed/${video.id}" frameborder="0" allowfullscreen></iframe>
                <p>${video.title}</p>
            `;
            appendMessage('bot', videoElement.innerHTML);
        });
    }
});

document.getElementById('redirectButton').addEventListener('click', function() {
    window.location.href = '/cursos';
});

const express = require('express');
const multer = require('multer');
const path = require('path');
const vision = require('@google-cloud/vision');
const app = express();

// Crea un cliente de Vision
const client = new vision.ImageAnnotatorClient({
  keyFilename: 'ruta/a/tu/archivo/clave.json' // Actualiza esto con la ruta a tu archivo de clave
});

// Configuración de multer para la subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Asegúrate de que este directorio exista
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta para manejar la subida de imágenes y análisis con Vision API
app.post('/api/upload', upload.single('image'), async (req, res) => {
  console.log('Archivo recibido:', req.file); // Log para verificar que el archivo se recibe

  if (!req.file) {
    console.error('No se ha subido ninguna imagen.');
    return res.status(400).send('No se ha subido ninguna imagen.');
  }

  const filePath = path.join(__dirname, 'uploads', req.file.filename);

  try {
    // Realiza una solicitud a Vision API para analizar la imagen
    const [result] = await client.textDetection(filePath);
    const detections = result.textAnnotations;
    const text = detections.length > 0 ? detections[0].description : 'No se detectó texto.';

    const imageUrl = `/uploads/${req.file.filename}`;
    const botResponse = `He recibido tu imagen y he detectado el siguiente texto: "${text}"`;

    console.log('Respuesta del bot:', botResponse); // Log para verificar la respuesta generada
    res.json({ imageUrl, botResponse });
  } catch (error) {
    console.error('Error al analizar la imagen:', error);
    res.status(500).send('Error al analizar la imagen.');
  }
});

app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});

