document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const grado = params.get('Grado');
    const tema = params.get('Tema');

    const form = document.getElementById('message-form');
    const userInput = document.getElementById('user-input');
    const chatWindow = document.getElementById('chat-window');
    document.getElementById('name-course').textContent = tema

    if (grado && tema) {
        const initialMessage = `Hola, necesito información sobre el tema ${tema} para el grado ${grado}.`;

        const previousMessages = await loadPreviousMessages(tema);
        // console.log('Previous messages:', previousMessages);  
        previousMessages.forEach(message => {
            // console.log('Appending message:', message);  

            appendMessage(message.remitente, message.mensaje);
        });

        if (previousMessages.length === 0) {
            // Enviar el mensaje inicial si no hay mensajes previos
            getBotResponse(initialMessage, tema).then(botResponse => {
                appendMessage('bot', botResponse);
            }).catch(error => {
                console.error('Error al obtener respuesta del bot:', error);
            });
        }
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const message = userInput.value.trim();
        if (message === '') return;

        appendMessage('user', message);

        const botResponse = await getBotResponse(message, tema);

        appendMessage('bot', botResponse);

        userInput.value = '';
    });

    async function getBotResponse(userMessage, topic) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question: userMessage, topic })
            });
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error al obtener respuesta del bot:', error);
            return 'Lo siento, ha ocurrido un error.';
        }
    }

    async function loadPreviousMessages(topic) {
        try {
            const response = await fetch(`/api/chat/messages?topic=${encodeURIComponent(topic)}`);
            const messages = await response.json();
            return messages;
        } catch (error) {
            console.error('Error al cargar mensajes previos:', error);
            return [];
        }
    }

    function appendMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        messageElement.textContent = message;
        chatWindow.appendChild(messageElement);
        // Desplazar hacia abajo para mostrar el mensaje más reciente
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
});

/* document.addEventListener('paste', (event) => {
    const items = event.clipboardData.items;
    for (let item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            const formData = new FormData();
            formData.append('image', file);

            fetch('/send_image', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('Image pasted and uploaded:', data);
                // Procesar la respuesta del servidor
                // Añadir imagen al historial
                const chatHistory = document.getElementById('chat-history');
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.style.maxWidth = '100%';
                img.style.display = 'block';
                img.style.margin = '10px 0';
                chatHistory.appendChild(img);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    }
}); */
