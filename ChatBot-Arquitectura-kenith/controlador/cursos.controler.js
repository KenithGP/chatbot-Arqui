let studentData = {}
document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/student-info');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del estudiante');
        }

        studentData = await response.json();
        document.getElementById('student-name').textContent = `${studentData.nombres} ${studentData.apellidos}`;
        
        const birthDate = new Date(studentData.fecha_nacimiento);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);

        document.getElementById('student-age').textContent = age;
        document.getElementById('student-grade').textContent = studentData.grado;
        document.getElementById('student-email').textContent = studentData.email;

        document.querySelectorAll('.course').forEach(courseElement => {
            const courseName = courseElement.getAttribute('data-course');
            loadTopics(courseName, courseElement);
        });
        

    } catch (error) {
        console.error('Error al obtener los datos del estudiante:', error);
    }
});

async function loadTopics(courseName, courseElement) {
    try {
        const response = await fetch(`/topics?course=${encodeURIComponent(courseName)}`);
        if (!response.ok) {
            throw new Error('No se pudo obtener los temas del curso');
        }

        const topics = await response.json();
        console.log(topics);

        // Buscar el elemento <select> dentro del contenedor del curso
        let selectElement = courseElement.querySelector('.topics-menu');

        // Si no existe un elemento <select>, crear uno nuevo
        if (!selectElement) {
            selectElement = document.createElement('select');
            selectElement.classList.add('topics-menu'); // Añadir la clase "topics-menu"
            courseElement.appendChild(selectElement);
        } else {
            // Limpiar las opciones anteriores
            selectElement.innerHTML = '';
        }

        // Iterar sobre los temas y agregar opciones al elemento <select>
        topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic.titulo;
            option.textContent = topic.titulo;
            selectElement.appendChild(option);
        });

        // Agregar el controlador de eventos al elemento <select>
        selectElement.addEventListener('change', function() {
            const selectedTema = this.value;
            const selectedGrade = studentData.grado;
            window.location.href = `/chat?Grado=${selectedGrade}&Tema=${selectedTema}`;
        });

    } catch (error) {
        console.error('Error al obtener los temas: ', error);
    }
}
