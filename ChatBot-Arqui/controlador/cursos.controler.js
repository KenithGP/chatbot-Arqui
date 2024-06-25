let studentData = {};
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
            courseElement.addEventListener('click', function () {
                const courseName = this.getAttribute('data-course');
                openCourseModal(courseName);
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
        console.log(topics);

        const topicsContainer = courseElement.querySelector('.topics-container');
        if (!topicsContainer) {
            const newContainer = document.createElement('div');
            newContainer.classList.add('topics-container');
            courseElement.appendChild(newContainer);
        } else {
            topicsContainer.innerHTML = '';
        }

        topics.forEach(topic => {
            const topicButton = document.createElement('button');
            topicButton.classList.add('topic-button');
            topicButton.textContent = topic.titulo;
            topicButton.addEventListener('click', function () {
                const selectedTema = topic.titulo;
                showOptionsModal(selectedTema);
            });
            topicsContainer.appendChild(topicButton);
        });

    } catch (error) {
        console.error('Error al obtener los temas: ', error);
    }
}

function openCourseModal(courseName) {
    const modal = document.getElementById('course-modal');
    const courseElement = modal.querySelector('.modal-content');
    modal.style.display = 'block';
    loadTopics(courseName, courseElement);

    const closeButton = modal.querySelector('.close');
    closeButton.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

function showOptionsModal(selectedTema) {
    const optionsModal = document.getElementById('options-modal');
    optionsModal.style.display = 'block';

    const chatButton = optionsModal.querySelector('#chat-button');
    const evaluationButton = optionsModal.querySelector('#evaluation-button');
    const selectedGrade = studentData.grado;

    chatButton.onclick = function() {
        window.location.href = `/chat?Grado=${selectedGrade}&Tema=${selectedTema}`;
    };

    evaluationButton.onclick = function() {
        window.location.href = `/evaluacion?Grado=${selectedGrade}&Tema=${selectedTema}`;
    };

    const closeButton = optionsModal.querySelector('.close');
    closeButton.onclick = function() {
        optionsModal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == optionsModal) {
            optionsModal.style.display = 'none';
        }
    };
}

document.getElementById('homeLogo').addEventListener('click', function() {
    window.location.href = '/';
});