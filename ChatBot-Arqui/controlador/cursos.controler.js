let studentData = {};

document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/student-info');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del estudiante');
        }

        studentData = await response.json();
        updateStudentInfo(studentData);

        const courses = document.querySelectorAll('.course');
        courses.forEach(course => {
            course.addEventListener('click', function() {
                const courseName = course.getAttribute('data-course');
                redirectToTopics(courseName);
            });
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
        renderTopicsMenu(courseElement, topics);

    } catch (error) {
        console.error('Error al obtener los temas: ', error);
    }
}

function updateStudentInfo(studentData) {
    document.getElementById('student-name').textContent = `${studentData.nombres} ${studentData.apellidos}`;
    const age = calculateAge(studentData.fecha_nacimiento);
    document.getElementById('student-age').textContent = age;
    document.getElementById('student-grade').textContent = studentData.grado;
    document.getElementById('student-email').textContent = studentData.email;
}

function calculateAge(birthDateStr) {
    const birthDate = new Date(birthDateStr);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function redirectToTopics(courseName) {
    switch (courseName) {
        case 'MATEMÁTICA':
            window.location.href = '/temas.vista.html?curso=matematica';
            break;
        case 'CIENCIA Y TECNOLOGÍA':
            window.location.href = '/temas.vista.html?curso=ciencia';
            break;
        case 'CIENCIAS SOCIALES':
            window.location.href = '/temas.vista.html?curso=sociales';
            break;
        case 'INGLÉS':
            window.location.href = '/temas.vista.html?curso=ingles';
            break;
        case 'DPCC':
            window.location.href = '/temas.vista.html?curso=dpcc';
            break;
        default:
            console.log('Curso no encontrado:', courseName);
            break;
    }
}

function renderTopicsMenu(courseElement, topics) {
    let selectElement = courseElement.querySelector('.topics-menu');
    if (!selectElement) {
        selectElement = document.createElement('select');
        selectElement.classList.add('topics-menu');
        courseElement.appendChild(selectElement);
    } else {
        selectElement.innerHTML = '';
    }

    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic.titulo;
        option.textContent = topic.titulo;
        selectElement.appendChild(option);
    });

    selectElement.addEventListener('change', function() {
        const selectedTema = this.value;
        const selectedGrade = studentData.grado;
        window.location.href = `/chat.html?Grado=${selectedGrade}&Tema=${selectedTema}`;
    });
}
