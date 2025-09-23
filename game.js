mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

let map, scene, camera, renderer, player;
let disasterItems = [];
let score = 0;

const scoreText = document.getElementById("score-text");
const message = document.getElementById("message");
const startButton = document.getElementById("start-game");

const itemsList = ["Water", "Food", "Helmet", "Fire Extinguisher"];

startButton.addEventListener("click", () => {
    score = 0;
    scoreText.textContent = "Score: " + score;
    message.textContent = "Fetching location...";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            message.textContent = `Location acquired: (${lat.toFixed(3)}, ${lon.toFixed(3)})`;
            initMap(lat, lon);
        }, err => {
            message.textContent = "Location denied, using default location.";
            initMap(28.6139, 77.2090); // Delhi default
        });
    } else {
        message.textContent = "Geolocation not supported, using default location.";
        initMap(28.6139, 77.2090);
    }
});

function initMap(lat, lon) {
    map = new mapboxgl.Map({
        container: 'game-container',
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [lon, lat],
        zoom: 18,
        pitch: 60,
        bearing: -17.6,
        antialias: true
    });

    map.on('load', () => {
        initThreeJS();
        addDisasterItems();
    });
}

function initThreeJS() {
    const canvas = map.getCanvas();
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.autoClear = false;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(10, 20, 10);
    scene.add(directional);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    player = new THREE.Mesh(geometry, material);
    player.position.set(0, 0.5, 0);
    scene.add(player);

    animate();
}

function addDisasterItems() {
    itemsList.forEach(name => {
        const geo = new THREE.SphereGeometry(0.5, 16, 16);
        const color = name === "Water" ? 0x0000ff :
                      name === "Food" ? 0xffff00 :
                      name === "Helmet" ? 0x00ffff : 0xff0000;
        const mat = new THREE.MeshBasicMaterial({ color });
        const item = new THREE.Mesh(geo, mat);

        item.position.set(Math.random() * 10 - 5, 0.5, Math.random() * 10 - 5);
        item.name = name;
        disasterItems.push(item);
        scene.add(item);
    });
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

document.addEventListener("keydown", e => {
    const speed = 0.5;
    switch (e.key) {
        case "w": player.position.z -= speed; break;
        case "s": player.position.z += speed; break;
        case "a": player.position.x -= speed; break;
        case "d": player.position.x += speed; break;
    }

    disasterItems.forEach((item, i) => {
        if (player.position.distanceTo(item.position) < 0.7) {
            score += 10;
            scoreText.textContent = "Score: " + score;
            disasterItems.splice(i, 1);
            scene.remove(item);
            speak(`Collected ${item.name}`);
        }
    });
});

function speak(text) {
    if ("speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utter);
    }
}
