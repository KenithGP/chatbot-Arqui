document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
  
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
  
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
  
        const formData = {
            email: email,
            password: password
        };
  
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (response.ok) {
              console.log(response)
                alert('Bienvenido');
                window.location.href = '/cursos'; 
            } else {
                alert('¡Error de inicio de sesión! Verifique su correo electrónico y contraseña.');
            }
        })
        .catch(error => {
            console.error('Error al enviar la solicitud:', error);
        });
    });
  });