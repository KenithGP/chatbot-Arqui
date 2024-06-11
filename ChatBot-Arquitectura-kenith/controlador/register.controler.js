document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
  
    registerForm.addEventListener('submit', function (event) {
        event.preventDefault();
  
        const username = document.getElementById('nombres').value;
        const firstname = document.getElementById('apellidos').value;
        const nacimiento = document.getElementById('dob').value;
        const grado = document.getElementById('grade').value;
        const genero = document.querySelector('input[name="gender"]:checked').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
  
        const formData = {
            nombres: username,
            apellidos: firstname,
            nacimiento,
            grado,
            genero,
            email: email,
            password: password 
        };
  
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (response.ok) {
                alert('¡Registro exitoso! Por favor inicie sesión.');
                window.location.href = '/login'; 
            } else {
                alert('¡Error en el registro! Por favor verifique los datos y vuelva a intentarlo.');
            }
        })
        .catch(error => {
            console.error('Error al enviar la solicitud:', error);
        });
    });
  });
  