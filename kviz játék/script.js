let score = [0, 0];
let currentQuestions = [];
let currentQuestionIndex = 0;
let timer;
let helpUsed = false;
let currentPlayer = 0;
let questions = {};

// Kérdések betöltése a JSON fájlból
document.addEventListener('DOMContentLoaded', () => {
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
        })
        .catch(error => {
            console.error('Hiba a kérdések betöltésekor:', error);
        });
});

function isNameValid(name) {
    const regex = /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ ]+$/;
    return regex.test(name);
}

function startQuiz() {
    const player1Name = document.getElementById('player1-name').value;
    const player2Name = document.getElementById('player2-name').value;
    if (!isNameValid(player1Name) || !isNameValid(player2Name)) {
        alert("Kérlek, add meg mindkét játékos nevét!");
        return;
    }

    const topicSelect = document.getElementById('topic-select');
    const selectedTopic = topicSelect.value;
    currentQuestions = questions[selectedTopic].sort(() => 0.5 - Math.random()).slice(0, 10);
    score = [0, 0];
    currentQuestionIndex = 0;
    currentPlayer = 0;
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('score-container').innerHTML = "";
    document.getElementById('answer-container').innerHTML = "";
    document.getElementById('restart-button').style.display = 'none';
    document.getElementById('help-button').style.display = 'none';
    document.getElementById('back-button').style.display = 'block';
    displayQuestion();
}

function goBack() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
}

function displayQuestion() {
    clearTimeout(timer);

    if (currentQuestionIndex >= currentQuestions.length) {
        displayResults();
        return;
    }

    helpUsed = false;
    document.getElementById('help-button').style.display = 'block';
    const question = currentQuestions[currentQuestionIndex];
    const shuffledChoices = question.choices.sort(() => 0.5 - Math.random());
    const questionContainer = document.getElementById('question-container');
    const playerName = currentPlayer === 0 ? document.getElementById('player1-name').value : document.getElementById('player2-name').value;

    questionContainer.innerHTML = `
        <div>${playerName} kérdése: ${question.question}</div>
        <ul id="choices">
            ${shuffledChoices.map((choice, index) => `<li><button data-choice="${String.fromCharCode(65 + index)}" onclick="checkAnswer('${choice}')">${choice}</button></li>`).join('')}
        </ul>
        <div id="timer">Maradék idő: 20 másodperc</div>
    `;

    startTimer();
}

function startTimer() {
    let timeLeft = 20;
    const timerElement = document.getElementById('timer');

    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            timerElement.innerHTML = "Lejárt az idő!";
            checkAnswer(null);
        } else {
            timerElement.innerHTML = `Maradék idő: ${timeLeft} másodperc`;
            timeLeft--;
        }
    }, 1000);
}

function checkAnswer(selectedAnswer) {
    clearTimeout(timer);
    const correctAnswer = currentQuestions[currentQuestionIndex].answer;
    const choices = document.querySelectorAll('#choices li button');

    choices.forEach(button => {
        if (button.innerText === correctAnswer) {
            button.classList.add('correct');
        } else if (button.innerText === selectedAnswer) {
            button.classList.add('wrong');
        }
        button.disabled = true;
    });

    if (selectedAnswer === correctAnswer) {
        score[currentPlayer]++;
    }

    currentPlayer = (currentPlayer + 1) % 2;
    currentQuestionIndex++;

    setTimeout(displayQuestion, 1000);
}

function displayResults() {
    const player1Name = document.getElementById('player1-name').value;
    const player2Name = document.getElementById('player2-name').value;
    let winner;
    if (score[0] > score[1]) {
        winner = `${player1Name} a győztes!`;
    } else if (score[0] < score[1]) {
        winner = `${player2Name} a győztes!`;
    } else {
        winner = "Döntetlen!";
    }

    const answerContainer = document.getElementById('answer-container');
    answerContainer.innerHTML = `
        <div class="results">
            <h3>Eredmények:</h3>
            <div>${player1Name}: ${score[0]} pont</div>
            <div>${player2Name}: ${score[1]} pont</div>
            <h3>${winner}</h3>
        </div>
        <h3>Helyes válaszok:</h3>
        <ul>
            ${currentQuestions.map(q => `
                <li>
                    <div><strong>Kérdés:</strong> ${q.question}</div>
                    <div><strong>Helyes válasz:</strong> ${q.answer}</div>
                </li>
            `).join('')}
        </ul>
    `;
    document.getElementById('question-container').innerHTML = "";
    document.getElementById('restart-button').style.display = 'block';
    document.getElementById('help-button').style.display = 'none';
    document.getElementById('back-button').style.display = 'none';
}

function useHelp() {
    if (helpUsed) return;
    helpUsed = true;

    const correctAnswer = currentQuestions[currentQuestionIndex].answer;
    const choices = document.querySelectorAll('#choices li button');
    let incorrectChoices = Array.from(choices).filter(button => button.innerText !== correctAnswer);

    incorrectChoices.sort(() => 0.5 - Math.random()).slice(0, 2).forEach(button => {
        button.style.display = 'none';
    });
}

function restartQuiz() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
}
