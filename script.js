document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('date-display').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    loadData(); 
    changeQuote();
});

// --- Motivation Quotes ---
const quotes = [
    "The secret of getting ahead is getting started.",
    "It always seems impossible until it's done.",
    "Don't watch the clock; do what it does. Keep going.",
    "Focus on being productive instead of busy.",
    "Great things are done by a series of small things brought together.",
    "You don't have to be great to start, but you have to start to be great.",
    "Little by little, a little becomes a lot.",
    "Push yourself, because no one else is going to do it for you.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "The future depends on what you do today.",
    "Dream big. Start small. Act now.",
    "Action is the foundational key to all success.",
    "Discipline is choosing between what you want now and what you want most.",
    "Starve your distractions, feed your focus.",
    "Make today your masterpiece.",
    "Work hard in silence, let your success be your noise.",
    "A year from now you may wish you had started today.",
    "Don't stop when you're tired. Stop when you're done.",
    "The only bad study session is the one that didn't happen.",
    "Your limitation—it's only your imagination."
];

function changeQuote() {
    let randomIndex = Math.floor(Math.random() * quotes.length);
    document.getElementById("motivationalQuote").innerText = '"' + quotes[randomIndex] + '"';
}

// --- Save & Load ---
function saveData() {
    const stats = { xp, tasksDone, focusMinutes };
    localStorage.setItem('nexusStats', JSON.stringify(stats));

    const tasks = [];
    document.querySelectorAll('#taskList li').forEach(li => {
        tasks.push({
            text: li.querySelector('.task-text').innerText,
            priority: li.className.split(' ').find(c => c.startsWith('priority-')),
            tagValue: li.querySelector('.task-tag-badge').classList[1],
            tagText: li.querySelector('.task-tag-badge').innerText,
            completed: li.classList.contains('completed')
        });
    });
    localStorage.setItem('nexusTasks', JSON.stringify(tasks));
    localStorage.setItem('nexusTheme', document.body.className);
}

function loadData() {
    const savedStats = JSON.parse(localStorage.getItem('nexusStats'));
    if (savedStats) {
        xp = savedStats.xp || 0; tasksDone = savedStats.tasksDone || 0; focusMinutes = savedStats.focusMinutes || 0;
        updateStatsUI();
    }
    const savedTheme = localStorage.getItem('nexusTheme');
    if (savedTheme) {
        document.body.className = savedTheme;
        document.getElementById('bgSelector').value = savedTheme;
    }
    const savedTasks = JSON.parse(localStorage.getItem('nexusTasks'));
    if (savedTasks) {
        savedTasks.reverse().forEach(task => {
            let list = document.getElementById("taskList");
            let li = document.createElement("li");
            li.className = task.priority;
            if (task.completed) li.classList.add('completed');
            let checkClass = task.completed ? "fa-solid fa-circle-check" : "fa-regular fa-circle";
            li.innerHTML = `
                <div class="task-content">
                    <i class="${checkClass} check-btn" onclick="toggleTask(this)"></i>
                    <span class="task-tag-badge ${task.tagValue}">${task.tagText}</span>
                    <span class="task-text">${task.text}</span>
                </div>
                <button class="delete-btn" onclick="this.parentElement.remove(); playClickSound(); saveData();"><i class="fa-solid fa-xmark"></i></button>
            `;
            list.insertBefore(li, list.firstChild);
        });
    }
}

function changeBackground() {
    let selectedBg = document.getElementById("bgSelector").value;
    document.body.className = selectedBg;
    saveData();
}

// --- UI Sounds (Click & Alarme) ---
function playClickSound() {
    let click = document.getElementById("uiClick");
    if (click) { click.currentTime = 0; click.play().catch(e => {}); }
}

function playRingSound() {
    let ring = document.getElementById("uiRing");
    if (ring) { ring.currentTime = 0; ring.play().catch(e => {}); }
}

// --- XP Stats ---
let xp = 0; let tasksDone = 0; let focusMinutes = 0;
function updateStatsUI() {
    document.getElementById("xpCount").innerText = xp;
    document.getElementById("tasksDone").innerText = tasksDone;
    document.getElementById("focusTime").innerText = focusMinutes;
}
function updateStats() { updateStatsUI(); saveData(); }

// --- Timer ---
let timerMode = 'countdown'; 
let timerLimit = 25 * 60; 
let timeCurrent = 25 * 60; 
let timerId = null;
let isTimerRunning = false;

function setMode(type, minutes, btnElement) {
    playClickSound(); 
    timerMode = type;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
    
    if (type === 'countdown') {
        timerLimit = minutes * 60; timeCurrent = timerLimit;
        document.getElementById("timerStatus").innerText = "COUNTDOWN READY";
    } else if (type === 'countup') {
        timeCurrent = 0;
        document.getElementById("timerStatus").innerText = "FLOW STATE READY";
    }
    resetTimerState(); updateDisplay();
}

function customTimerMode(btnElement) {
    playClickSound();
    let custom = prompt("Enter focus time in minutes:", "45");
    if (custom && !isNaN(custom)) {
        setMode('countdown', parseInt(custom), btnElement);
        btnElement.innerHTML = `<i class="fa-solid fa-sliders"></i> ${custom}m`;
    }
}

function updateDisplay() {
    let m = Math.floor(timeCurrent / 60);
    let s = timeCurrent % 60;
    document.getElementById("timerDisplay").innerText = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
}

function toggleTimer() {
    let startBtn = document.getElementById("startBtn");
    let statusText = document.getElementById("timerStatus");
    
    playClickSound(); // Click mli tstarti awla tpause
    
    if (isTimerRunning) {
        clearInterval(timerId);
        startBtn.innerHTML = '<i class="fa-solid fa-play"></i> RESUME';
        startBtn.classList.remove("running");
        statusText.innerText = "SYSTEM PAUSED";
        isTimerRunning = false;
    } else {
        changeQuote(); 
        
        statusText.innerText = timerMode === 'countup' ? "FLOW STATE ACTIVE" : "DEEP FOCUS ACTIVE";
        
        timerId = setInterval(function() {
            if (timerMode === 'countdown') {
                if (timeCurrent > 0) timeCurrent--;
                else completeSession();
            } else if (timerMode === 'countup') {
                timeCurrent++;
                if (timeCurrent % 60 === 0) { focusMinutes++; xp += 2; updateStats(); }
            }
            updateDisplay();
        }, 1000);
        
        startBtn.innerHTML = '<i class="fa-solid fa-pause"></i> PAUSE FOCUS';
        startBtn.classList.add("running");
        isTimerRunning = true;
    }
}

function completeSession() {
    clearInterval(timerId);
    playRingSound(); // Alarme mli ysali lwe9t
    changeQuote(); 
    xp += Math.floor(timerLimit / 60) * 2;
    focusMinutes += Math.floor(timerLimit / 60);
    updateStats();
    alert("Target Reached! Excellent work.");
    resetTimer();
}

function resetTimerState() {
    isTimerRunning = false;
    let startBtn = document.getElementById("startBtn");
    startBtn.innerHTML = '<i class="fa-solid fa-play"></i> INITIATE FOCUS';
    startBtn.classList.remove("running");
}

function resetTimer() {
    playClickSound();
    clearInterval(timerId);
    timeCurrent = timerMode === 'countdown' ? timerLimit : 0;
    document.getElementById("timerStatus").innerText = "SYSTEM RESET";
    resetTimerState(); updateDisplay();
}

// --- Audio Player ---
let activeAudio = null;
let isSoundPlaying = false;

function changeAmbientSound() {
    if (activeAudio) { activeAudio.pause(); }
    let selected = document.getElementById("ambientSound").value;
    
    if (selected !== "none") {
        activeAudio = document.getElementById(selected);
        activeAudio.volume = document.getElementById("volumeControl").value;
        activeAudio.play().then(() => {
            isSoundPlaying = true; updateSoundBtn();
        }).catch(err => { isSoundPlaying = false; updateSoundBtn(); });
    } else {
        activeAudio = null; isSoundPlaying = false; updateSoundBtn();
    }
}

function toggleSound() {
    playClickSound();
    let selected = document.getElementById("ambientSound").value;
    if (selected === "none") { alert("Please select a sound first."); return; }
    
    if (!activeAudio || activeAudio.id !== selected) {
        activeAudio = document.getElementById(selected);
        activeAudio.volume = document.getElementById("volumeControl").value;
    }

    if (isSoundPlaying) { activeAudio.pause(); isSoundPlaying = false; } 
    else {
        activeAudio.play().then(() => { isSoundPlaying = true; }).catch(e => {
            alert("Mochkil: Fichier mp3 ma t9rach.");
        });
    }
    updateSoundBtn();
}

function updateSoundBtn() {
    let btn = document.getElementById("soundToggleBtn");
    if (isSoundPlaying) {
        btn.innerHTML = '<i class="fa-solid fa-pause"></i>'; btn.style.background = "#ef4444"; 
    } else {
        btn.innerHTML = '<i class="fa-solid fa-play"></i>'; btn.style.background = ""; 
    }
}

function changeVolume() { if (activeAudio) activeAudio.volume = document.getElementById("volumeControl").value; }

// --- Tasks ---
function addTask() {
    let input = document.getElementById("taskInput");
    let priority = document.getElementById("taskPriority").value;
    let tagValue = document.getElementById("taskTag").value;
    let tagText = document.getElementById("taskTag").options[document.getElementById("taskTag").selectedIndex].text;
    let text = input.value.trim();

    if (text !== "") {
        playClickSound();
        let list = document.getElementById("taskList");
        let li = document.createElement("li");
        li.className = `priority-${priority}`;

        li.innerHTML = `
            <div class="task-content">
                <i class="fa-regular fa-circle check-btn" onclick="toggleTask(this)"></i>
                <span class="task-tag-badge ${tagValue}">${tagText}</span>
                <span class="task-text">${text}</span>
            </div>
            <button class="delete-btn" onclick="this.parentElement.remove(); playClickSound(); saveData();"><i class="fa-solid fa-xmark"></i></button>
        `;
        list.insertBefore(li, list.firstChild);
        input.value = ""; saveData(); 
    }
}

function toggleTask(icon) {
    playClickSound();
    let li = icon.parentElement.parentElement;
    li.classList.toggle("completed");
    
    if (li.classList.contains("completed")) {
        icon.className = "fa-solid fa-circle-check check-btn"; 
        xp += 15; tasksDone++; changeQuote(); 
    } else {
        icon.className = "fa-regular fa-circle check-btn"; 
        xp -= 15; tasksDone--; 
    }
    updateStats(); 
}

document.getElementById("taskInput").addEventListener("keypress", function(e) { if (e.key === "Enter") addTask(); });