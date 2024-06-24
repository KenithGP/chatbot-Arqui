const { default: OpenAI } = require('openai');
require('dotenv').config();
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const openaiAPIKey = process.env.OPEN_IA_KEY2;
let openaiInstance;

if (openaiAPIKey) {
  const options = { apiKey: openaiAPIKey, dangerouslyAllowBrowser: true }; 
  openaiInstance = new OpenAI(options);
} else {
  console.error('La clave de API de OpenAI no está definida.');
}

const sendQueryToOpenAI = async (query, topic, imageUrl) => {
  try {
      if (openaiInstance) {
          let messages = [
              { role: 'system', content: 'Eres un profesor de nivel de primaria, cada tema que te escriba debes de detallar a fondo en como se hace, como se resolveria, etc. Recuerda que soy un alumno'},
              { role: 'user', content: `Tema actual: ${topic}\nPregunta: ${query}` }
          ];
          
          if (imageUrl) {
              messages.push({ role: 'user', content: `Imagen: ${imageUrl}` });
          }

          const response = await openaiInstance.request({
              method: 'POST',
              path: '/chat/completions',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: {
                  model: 'gpt-4o',  // Modelo de chat
                  messages,
                  max_tokens: 1050,
              },
          });

          if (response.choices && response.choices.length > 0) {
              const text = response.choices[0].message.content.trim();  // Accede a la respuesta correcta
              return text;
          } else {
              return null;
          }
      } else {
          console.error('La instancia de OpenAI no está definida.');
          return null;
      }
  } catch (error) {
      console.error('Error al enviar consulta a OpenAI:', error);
      return null;
  }
};

module.exports = { openaiInstance, sendQueryToOpenAI};
