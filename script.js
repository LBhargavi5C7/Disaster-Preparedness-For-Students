let currentUser  = null;
let voiceEnabled = true;
let gameLevel = 1;
let gameScore = 0;
let progress = 0;
let badges = [];
let quizQuestions = [
    { q: "What to do in earthquake?", a: "Drop, Cover, Hold On", options: ["Run", "Drop, Cover, Hold On", "Hide under bed"] }
];
let disasters = ['flood', 'fire', 'evacuation', 'tsunami', 'earthquake'];
let userLocation = null;

// --- LOGIN/SIGNUP ---
function showSignup() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('signupScreen').classList.remove('hidden');
}
function showLogin() {
    document.getElementById('signupScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
}
function signup() {
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value.trim();
    if (!username || !password) {
        alert('Please enter username and password.');
        return;
    }
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
        alert('Username already exists.');
        return;
    }
    users[username] = { password: password };
    localStorage.setItem('users', JSON.stringify(users));
    alert('Account created! Please sign in.');
    showLogin();
}
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    // Demo user
    if (username === "student" && password === "pass123") {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        return;
    }
    if (users[username] && users[username].password === password) {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
    } else {
        alert('Invalid credentials');
    }
}
function logout() {
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
}

// --- NAVIGATION ---
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
    if (sectionId === 'quizzes') {
        startQuiz();
    }
}
function toggleVoice() {
    voiceEnabled = !voiceEnabled;
    alert('Voice is now ' + (voiceEnabled ? 'ON' : 'OFF'));
}
function speak(text) {
    if (voiceEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    }
}
function shareContacts() {
    const contacts = 'NDMA: 011-26701700\nPunjab: 0172-2740271';
    navigator.clipboard.writeText(contacts).then(() => alert('Contacts copied! Share with parents.'));
}

// --- QUIZ ---
function startQuiz() {
    const content = document.getElementById('quizContent');
    content.innerHTML = '';
    quizQuestions.forEach((q, i) => {
        const div = document.createElement('div');
        div.innerHTML = `<p>${q.q}</p>`;
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(i, opt, q.a);
            div.appendChild(btn);
        });
        content.appendChild(div);
    });
}
function checkAnswer(index, selected, correct) {
    if (selected === correct) {
        gameScore += 10;
        alert('Correct! +10 points');
        addBadge('Quiz Master');
    } else {
        alert('Wrong! Try again.');
    }
    updateScore();
}
function addBadge(badge) {
    if (!badges.includes(badge)) {
        badges.push(badge);
        document.getElementById('badgeList').textContent = badges.join(', ');
    }
}
function loadProgress() {
    document.getElementById('progress').textContent = progress + '%';
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('badgeList').textContent = badges.join(', ');
}

// --- GAME ---
function startGame() {
    const area = document.getElementById('gameArea');
    area.innerHTML = '';
    area.classList.remove('fire-bg', 'earthquake-bg', 'flood-bg');
    area.classList.add('flood-bg');
    const question = document.createElement('h3');
    question.textContent = "What should you take during a flood?";
    area.appendChild(question);
    const person = document.createElement('div');
    person.id = 'personInFlood';
    person.textContent = '🧑';
    person.style.position = 'absolute';
    person.style.left = '50%';
    person.style.bottom = '20px';
    person.style.fontSize = '48px';
    person.style.transform = 'translateX(-50%)';
    area.appendChild(person);
    const items = [
        { name: "Life Jacket", correct: true },
        { name: "Boat", correct: true },
        { name: "Mobile Phone", correct: false },
        { name: "Toy Car", correct: false }
    ];
    items.forEach((item, i) => {
        const elem = document.createElement('div');
        elem.className = 'draggable';
        elem.textContent = item.name;
        elem.style.left = (i * 120) + 20 + 'px';
        elem.style.top = '100px';
        elem.draggable = true;
        elem.ondragstart = drag;
        elem.dataset.correct = item.correct;
        elem.dataset.item = item.name;
        area.appendChild(elem);
    });
    const drop = document.createElement('div');
    drop.className = 'dropzone';
    drop.ondragover = allowDrop;
    drop.ondrop = dropItem;
    drop.id = 'safetyZone';
    drop.textContent = "Drag correct items here!";
    drop.style.marginTop = "180px";
    area.appendChild(drop);
}
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.dataset.item);
    ev.dataTransfer.setData("correct", ev.target.dataset.correct);
}
function allowDrop(ev) {
    ev.preventDefault();
}
function dropItem(ev) {
    ev.preventDefault();
    const itemName = ev.dataTransfer.getData("text");
    const isCorrect = ev.dataTransfer.getData("correct") === "true";
    const area = document.getElementById('gameArea');
    const items = area.querySelectorAll('.draggable');
    items.forEach(item => {
        if (item.textContent === itemName) {
            item.style.pointerEvents = "none";
            item.classList.add('float-up');
            setTimeout(() => { item.style.display = "none"; }, 1000);
        }
    });
    const person = document.getElementById('personInFlood');
    if (person) {
        person.classList.remove('float-up', 'sink-person');
        void person.offsetWidth;
        if (isCorrect) {
            person.classList.add('float-up');
            speak("Great! You escaped the flood!");
        } else {
            person.classList.add('sink-person');
            speak("Oh no! You sank in the flood!");
        }
    }
    updateScore();
}
function updateScore() {
    document.getElementById('gameScore').textContent = `Score: ${gameScore}`;
    progress = Math.min(100, (gameScore / 100) * 100);
    document.getElementById('progress').textContent = progress + '%';
    document.getElementById('progressFill').style.width = progress + '%';
}

// --- ADVANCED SIMULATION ---
function startAdvancedSimulation() {
    const simQuestion = document.getElementById('simQuestion');
    const simFeedback = document.getElementById('simFeedback');
    const realMap = document.getElementById('realMap');
    const safePlaces = document.getElementById('safePlaces');
    simQuestion.textContent = "At present, floods have come to your place. What can you do?";
    simFeedback.innerHTML = `
        <b>Directions:</b><br>
        <ul>
            <li><b>Move to the highest safe place in your house</b> (such as the terrace or upper floor).</li>
            <li><b>Avoid basements and low-lying areas.</b></li>
            <li>Keep emergency supplies with you.</li>
            <li>Wait for rescue teams if needed.</li>
        </ul>
        <b>Safe places:</b> Terrace, upper floors, nearby schools, hospitals, police stations, shelters<br>
        <b>Unsafe places:</b> Basement, ground floor, garage
    `;
    speak("At present, floods have come to your place. Move to the highest safe place in your house, such as the terrace or upper floor. Avoid basements and low-lying areas. You can also go to the nearest school, hospital, police station, or shelter.");
    realMap.innerHTML = '';
    safePlaces.innerHTML = '';

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            // Show OpenStreetMap with a marker at user's location
            realMap.innerHTML = `<iframe width="100%" height="300" frameborder="0" style="border:0"
                src="https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01}%2C${lat-0.01}%2C${lon+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lon}" allowfullscreen></iframe>
                <br><small><a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}" target="_blank">View Larger Map</a></small>`;

            // Show Google Maps links for nearby safe places
            safePlaces.innerHTML = `
                <b>Find nearest safe places in your area:</b>
                <a href="https://www.google.com/maps/search/school/@${lat},${lon},15z" target="_blank">Nearest Schools</a>
                <a href="https://www.google.com/maps/search/hospital/@${lat},${lon},15z" target="_blank">Nearest Hospitals</a>
                <a href="https://www.google.com/maps/search/police+station/@${lat},${lon},15z" target="_blank">Nearest Police Stations</a>
                <a href="https://www.google.com/maps/search/shelter/@${lat},${lon},15z" target="_blank">Nearest Shelters</a>
            `;
        }, function(error) {
            simFeedback.innerHTML += "<br><b>Unable to access your location. Please allow location access in your browser.</b>";
            speak("Unable to access your location. Please allow location access in your browser.");
        });
    } else {
        simFeedback.innerHTML += "<br><b>Geolocation is not supported by your browser.</b>";
        speak("Geolocation is not supported by your browser.");
    }
}