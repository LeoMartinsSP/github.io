// === AUDIOS ===
// Caminhos locais (pasta sounds/)
const audioFx = {
    spin: new Audio('sounds/spin.mp3'), 
    correct: new Audio('sounds/correct.mp3'),
    wrong: new Audio('sounds/wrong.mp3'),
    win: new Audio('sounds/win.mp3'),
    bg: new Audio('sounds/musica.mp3'),   // Música de fundo principal
    final: new Audio('sounds/final.mp3')  // Música da final
};

// Configurações de Volume e Loop
audioFx.spin.volume = 0.2; 
audioFx.spin.loop = true;

audioFx.correct.volume = 0.2; 
audioFx.wrong.volume = 0.1; 
audioFx.win.volume = 0.2;

// Configuração das Músicas de Fundo
audioFx.bg.volume = 0.05; // Volume bem baixo (5%)
audioFx.bg.loop = true;   // Loop infinito

audioFx.final.volume = 0.08; // Volume baixo, mas um pouco mais destacado (8%)
audioFx.final.loop = true;

// Hack para navegadores: O áudio só pode começar após uma interação do usuário.
// Adicionamos um listener no corpo da página para iniciar a música no primeiro clique.
let musicStarted = false;
document.body.addEventListener('click', () => {
    if (!musicStarted && !isMuted) {
        audioFx.bg.play().catch(e => console.log("Aguardando interação para áudio..."));
        musicStarted = true;
    }
}, { once: true }); // Executa apenas uma vez

const wheelSlots = [
    { label: "PERDE<br>TUDO", value: 0, color: "#000000", type: "bankruptcy" },
    { label: "1000", value: 1000, color: "#757575", type: "money" },
    { label: "400", value: 400, color: "#ffcc00", type: "money" },
    { label: "200", value: 200, color: "#d30000", type: "money" },
    { label: "500", value: 500, color: "#003399", type: "money" },
    { label: "PASSA<br>A VEZ", value: 0, color: "#FFFFFF", type: "pass" },
    { label: "100", value: 100, color: "#cc00cc", type: "money" },
    { label: "300", value: 300, color: "#009933", type: "money" },
    { label: "50", value: 50, color: "#ff0080", type: "money" },
    { label: "1000", value: 1000, color: "#757575", type: "money" },
    { label: "500", value: 500, color: "#ff6600", type: "money" },
    { label: "600", value: 600, color: "#00cccc", type: "money" },
    { label: "200", value: 200, color: "#d30000", type: "money" },
    { label: "700", value: 700, color: "#ffcc00", type: "money" },
    { label: "PASSA<br>A VEZ", value: 0, color: "#FFFFFF", type: "pass" },
    { label: "400", value: 400, color: "#003399", type: "money" },
    { label: "100", value: 100, color: "#009933", type: "money" },
    { label: "800", value: 800, color: "#cc00cc", type: "money" },
    { label: "300", value: 300, color: "#ff6600", type: "money" },
    { label: "500", value: 500, color: "#00cccc", type: "money" },
    { label: "50", value: 50, color: "#ff0080", type: "money" }
];

// === UTILITÁRIOS ===
function removeAccents(str) {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

// === BANCO DE PALAVRAS ===
let wordDatabase = {
    "ANIMAIS": ["ORNITORRINCO", "HIPOPOTAMO", "GIRAFA", "ELEFANTE", "CROCODILO", "GOLFINHO", "TARTARUGA", "AVESTRUZ", "CAMELO", "PINGUIM"],
    "FRUTAS": ["JABUTICABA", "ABACAXI", "LARANJA", "MELANCIA", "MORANGO", "UVA", "BANANA", "KIWI", "PESSEGO", "MARACUJA"],
    "PROFISSÃO": ["ENGENHEIRO", "MEDICO", "ADVOGADO", "PROFESSOR", "DENTISTA", "ARQUITETO", "JORNALISTA", "MOTORISTA", "ELETRICISTA", "PADEIRO"],
    "PAÍS": ["ARGENTINA", "BRASIL", "ALEMANHA", "AUSTRALIA", "CANADA", "JAPAO", "MEXICO", "PORTUGAL", "ESPANHA", "ITALIA"],
    "OBJETO": ["MICROONDAS", "GELADEIRA", "TELEVISAO", "COMPUTADOR", "CELULAR", "CADEIRA", "MESA", "LAMPADA", "ESPELHO", "RELOGIO"],
    "INSTRUMENTO": ["VIOLONCELO", "GUITARRA", "BATERIA", "FLAUTA", "PIANO", "SAXOFONE", "TROMPETE", "VIOLINO", "HARPA", "SANFONA"],
    "ESPORTE": ["BASQUETEBOL", "FUTEBOL", "VOLEI", "NATACAO", "JUDO", "TENIS", "GOLFE", "SURFE", "BOXE", "ATLETISMO"]
};

async function loadWords() {
    try {
        const response = await fetch('words.json');
        if (response.ok) {
            const jsonWords = await response.json();
            wordDatabase = jsonWords; 
            console.log("Banco de palavras atualizado via JSON!");
        }
    } catch (error) {
        console.warn("Modo Offline/Local: Usando lista de palavras interna.");
    }
}
loadWords();

// VARIAVEIS GLOBAIS
const STORAGE_PLAYER_KEY = 'rodaaroda_current_player_name';
let globalPlayerName = localStorage.getItem(STORAGE_PLAYER_KEY) || "JOGADOR 1";
const botPriorityList = ['A','E','O','S','R','N','D','M','I','U','T','C','L','P','V','G','Q','H','F','B','Z','J','X','K','W','Y'];

let isMuted = false;
const btnMute = document.getElementById('btn-mute-global');

let currentPuzzle = {}; 
let guessedLetters = [];
let usedWords = []; 
let usedCategories = []; 
let currentRotation = 0;
let numPlayers = 1;
let isBotGame = false; 
let currentPlayerIndex = 0;
let players = [ { name: "Jogador 1", roundScore: 0, totalScore: 0 }, { name: "Jogador 2", roundScore: 0, totalScore: 0 } ];
let currentRound = 1;
const maxRounds = 3;
let roundValue = 0;
let hasSpun = false;
let spMisses = 0;
const spMaxMisses = 5;
let isFinalRound = false;
let isTieBreaker = false;
let tieBreakerState = { p1Val: 0, p2Val: 0, turns: 0 };
let finalistPlayer = null;
let isProcessingGuess = false; 

// ELEMENTOS DOM
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const btn1Player = document.getElementById('btn-1-player');
const btn2Players = document.getElementById('btn-2-players');
const btnVsBot = document.getElementById('btn-vs-bot'); 
const boardEl = document.getElementById('puzzle-board');
const categoryEl = document.getElementById('category-text');
const btnSolve = document.getElementById('btn-solve');
const keyboardContainer = document.getElementById('keyboard-container');

const roundDisplayEl = document.getElementById('round-display');
const wheelEl = document.getElementById('wheel');
const wheelResultEl = document.getElementById('wheel-result');
const p1Card = document.getElementById('p1-card');
const p2Card = document.getElementById('p2-card');
const p1NameEl = document.getElementById('p1-name');
const p2NameEl = document.getElementById('p2-name');
const p1RoundEl = document.getElementById('p1-round');
const p2RoundEl = document.getElementById('p2-round');
const p1TotalEl = document.getElementById('p1-total');
const p2TotalEl = document.getElementById('p2-total');
const spLivesContainer = document.getElementById('sp-lives-container');
const spLivesDisplay = document.getElementById('sp-lives-display');

const sliderContainer = document.getElementById('slider-container');
const sliderHandle = document.getElementById('slider-handle');

const mainLayoutArea = document.getElementById('main-layout-area');

const swalCommon = {
    background: '#002266', 
    color: '#ffffff',      
    confirmButtonColor: '#009933',
    cancelButtonColor: '#d33'
};

// === FUNÇÃO DA ROLETA ===
function drawWheel() {
    wheelEl.innerHTML = '';
    const segmentAngle = 360 / wheelSlots.length; 
    let gradientString = 'conic-gradient(';
    wheelSlots.forEach((slot, index) => {
        const startAngle = index * segmentAngle;
        const endAngle = (index + 1) * segmentAngle;
        gradientString += `${slot.color} ${startAngle}deg ${endAngle}deg, `;
    });
    gradientString = gradientString.slice(0, -2) + ')';
    wheelEl.style.background = gradientString;

    wheelSlots.forEach((slot, index) => {
        const textContainer = document.createElement('div');
        textContainer.classList.add('wheel-text-container');
        const rotation = (index * segmentAngle) + (segmentAngle / 2);
        textContainer.style.transform = `rotate(${rotation}deg)`;
        
        const textSpan = document.createElement('div');
        textSpan.classList.add('wheel-text', 'vertical-mode');

        if (slot.type === 'money') {
            textSpan.innerHTML = slot.label.split('').join('<br>'); 
            textSpan.classList.add('money-text'); 
        } else textSpan.innerHTML = slot.label;
        
        if (slot.color === '#FFFFFF') textSpan.classList.add('dark-text');
        else textSpan.style.color = 'white'; 

        textContainer.appendChild(textSpan);
        wheelEl.appendChild(textContainer);
    });
    currentRotation = segmentAngle / 2; 
    wheelEl.style.transform = `rotate(-${currentRotation}deg)`;
}

// === GERAÇÃO DO TECLADO ===
function generateKeyboard() {
    keyboardContainer.innerHTML = '';
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    alphabet.split('').forEach(letter => {
        const btn = document.createElement('button');
        btn.classList.add('key-btn');
        btn.innerText = letter;
        btn.id = `key-${letter}`;
        btn.onclick = () => handleGuess(letter);
        keyboardContainer.appendChild(btn);
    });
}
generateKeyboard();

// === LÓGICA DO SLIDER ===
let isDraggingSlider = false;
let sliderStartY = 0;
let sliderCurrentY = 0;
let sliderHeight = 0;
let sliderCanSpin = true; 

function initSlider() {
    sliderHandle.addEventListener('mousedown', startDrag);
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('mousemove', drag);
    sliderHandle.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('touchend', endDrag);
    window.addEventListener('touchmove', drag, { passive: false });
}

function startDrag(e) {
    if (!sliderCanSpin || isFinalRound || (isBotGame && currentPlayerIndex === 1)) return; 
    isDraggingSlider = true;
    sliderHandle.classList.add('dragging');
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    sliderStartY = clientY;
    const track = document.querySelector('.slider-track');
    sliderHeight = track.clientHeight - sliderHandle.clientHeight;
}

function drag(e) {
    if (!isDraggingSlider) return;
    e.preventDefault(); 
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    let delta = sliderStartY - clientY; 
    if (delta < 0) delta = 0;
    if (delta > sliderHeight) delta = sliderHeight;
    sliderHandle.style.bottom = `${delta + 5}px`; 
    sliderCurrentY = delta;
}

function endDrag(e) {
    if (!isDraggingSlider) return;
    isDraggingSlider = false;
    sliderHandle.classList.remove('dragging');
    const power = sliderCurrentY / sliderHeight;
    sliderHandle.style.bottom = '5px';
    if (power > 0.2) {
        spinWheel(power);
    }
}

initSlider();

// === RESTO DO JOGO ===

function toggleMute() {
    isMuted = !isMuted;
    btnMute.innerText = isMuted ? '🔇' : '🔊';
    
    // Controle Geral de Mudo
    if(isMuted) { 
        audioFx.bg.pause();
        audioFx.final.pause();
        audioFx.spin.pause(); 
    } else {
        // Se desmutar, volta a tocar a música correta
        if (isFinalRound) audioFx.final.play().catch(()=>{});
        else audioFx.bg.play().catch(()=>{});
    }
}

function playSound(key) { 
    if(!isMuted && audioFx[key]) {
        audioFx[key].play().catch(e => console.warn("Audio play blocked", e));
    }
}
btnMute.addEventListener('click', toggleMute);

btn1Player.addEventListener('click', () => prepareGame(1));
btn2Players.addEventListener('click', () => prepareGame(2));
btnVsBot.addEventListener('click', () => prepareGame(3));

// === GERENCIAMENTO DE PERFIL ===
const profileNameEl = document.getElementById('current-player-name');
const btnEditProfile = document.getElementById('btn-edit-profile');

function initPlayerProfile() {
    profileNameEl.innerText = globalPlayerName;
}

async function editPlayerName() {
    const { value: newName } = await Swal.fire({
        ...swalCommon,
        title: 'Trocar Nome',
        input: 'text',
        inputValue: globalPlayerName,
        inputPlaceholder: 'Digite seu nome',
        inputAttributes: { autocapitalize: 'characters' },
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        didOpen: () => { 
            const i = Swal.getInput(); 
            i.oninput = () => i.value = i.value.toUpperCase(); 
            setTimeout(() => i.focus(), 100); 
        },
        inputValidator: (value) => {
            if (!value) return 'O nome não pode ser vazio!';
        }
    });

    if (newName) {
        globalPlayerName = newName.toUpperCase().substring(0, 12); 
        localStorage.setItem(STORAGE_PLAYER_KEY, globalPlayerName);
        profileNameEl.innerText = globalPlayerName;
        
        Swal.fire({
            ...swalCommon,
            icon: 'success',
            title: 'Nome Atualizado!',
            timer: 1000,
            showConfirmButton: false,
            toast: true, position: 'top'
        });
    }
}

initPlayerProfile();
btnEditProfile.addEventListener('click', editPlayerName);

async function prepareGame(mode) {
    numPlayers = (mode === 3) ? 2 : mode;
    isBotGame = (mode === 3);
    
    // Tenta iniciar a música se ainda não começou
    if(!isMuted) audioFx.bg.play().catch(()=>{});

    let p1Name = globalPlayerName; 
    let p2Name = "JOGADOR 2";

    if (isBotGame) {
        p2Name = "SILVIO (BOT)";
    } else if (numPlayers === 2) {
        const { value: name2 } = await Swal.fire({ 
            ...swalCommon, 
            title: 'Nome do Jogador 2',
            input: 'text', 
            inputPlaceholder: 'Nome do adversário',
            inputAttributes: { autocapitalize: 'characters' }, 
            didOpen: () => { 
                const i = Swal.getInput(); 
                i.oninput = () => i.value = i.value.toUpperCase(); 
                setTimeout(() => i.focus(), 100); 
            }
        });
        if (name2) p2Name = name2.toUpperCase().substring(0, 10);
    }

    players[0] = { name: p1Name, roundScore: 0, totalScore: 0 };
    players[1] = { name: p2Name, roundScore: 0, totalScore: 0 };
    currentPlayerIndex = 0; currentRound = 1; isFinalRound = false; isTieBreaker = false;
    usedWords = [];
    usedCategories = []; 

    p1NameEl.innerText = players[0].name;
    p2NameEl.innerText = players[1].name;

    if (numPlayers === 1) {
        p2Card.style.display = 'none'; spLivesContainer.style.display = 'block';
    } else {
        p2Card.style.display = 'block'; spLivesContainer.style.display = 'none';
    }

    startScreen.classList.remove('active-screen'); startScreen.classList.add('hidden-screen');
    gameScreen.classList.remove('hidden-screen'); gameScreen.classList.add('active-screen');
    
    drawWheel(); 
    startRound();
}

function generatePuzzle(forceSingle = false) {
    const categories = Object.keys(wordDatabase);
    let validPuzzle = false;
    let selectedCat = "";
    let selectedWords = [];

    let attempts = 0;
    while (!validPuzzle && attempts < 50) {
        attempts++;
        selectedCat = categories[Math.floor(Math.random() * categories.length)];
        
        if (usedCategories.includes(selectedCat)) {
            if (usedCategories.length >= categories.length) {
                usedCategories = []; 
            } else {
                continue; 
            }
        }
        
        let count = forceSingle ? 1 : Math.floor(Math.random() * 3) + 1;
        const pool = [...wordDatabase[selectedCat]];
        
        let tempWords = [];
        for(let i=0; i<count; i++) {
            if(pool.length === 0) break;
            const randomIndex = Math.floor(Math.random() * pool.length);
            const word = pool[randomIndex];
            
            let isValid = !usedWords.includes(word);
            
            if (isFinalRound) {
                if (word.length <= 6) isValid = false;
            }

            if (isValid) {
                tempWords.push(removeAccents(word));
            }
            pool.splice(randomIndex, 1);
        }

        if (tempWords.length > 0) {
            selectedWords = tempWords;
            validPuzzle = true;
            usedCategories.push(selectedCat); 
        }
    }

    if (!validPuzzle) {
        selectedCat = categories[Math.floor(Math.random() * categories.length)];
        selectedWords = [removeAccents(wordDatabase[selectedCat][0])];
    }

    selectedWords.forEach(w => usedWords.push(w));
    return { category: selectedCat, words: selectedWords };
}

function startRound() {
    currentPuzzle = generatePuzzle(false);
    guessedLetters = [];
    players[0].roundScore = 0; players[1].roundScore = 0;
    spMisses = 0;
    isProcessingGuess = false; 
    
    if (numPlayers === 1) updateLivesUI();

    roundValue = 0; hasSpun = false;
    updateScoreUI();
    categoryEl.innerText = currentPuzzle.category;
    
    btnSolve.style.display = 'none';
    
    let msg = "";
    if(numPlayers === 1) msg = "Sua vez!";
    else if(isBotGame && currentPlayerIndex === 1) msg = "Vez do Silvio...";
    else msg = `Vez de ${players[currentPlayerIndex].name}.`;
    
    wheelResultEl.innerText = msg;

    setupBoard();
    resetKeyboard(); 
    disableKeyboard(true); 
    sliderCanSpin = true; 

    setTimeout(() => {
        Swal.fire({
            ...swalCommon,
            text: `${players[currentPlayerIndex].name}, é a sua vez de jogar!`,
            timer: 4000, showConfirmButton: false, toast: true, 
            position: 'bottom',
            background: '#002266', color: '#fff',
            customClass: { popup: 'game-toast' }
        });
    }, 500);

    if(isBotGame && currentPlayerIndex === 1) {
        botTurnRoutine();
    } else {
        toggleInputLock(false); 
    }
}

function resetKeyboard() {
    const keys = document.querySelectorAll('.key-btn');
    keys.forEach(k => {
        k.className = 'key-btn';
    });
}

function updateScoreUI() {
    p1RoundEl.innerText = `${players[0].roundScore.toLocaleString('pt-BR')}`;
    p1TotalEl.innerText = `${players[0].totalScore.toLocaleString('pt-BR')}`;
    if (numPlayers === 2) {
        p2RoundEl.innerText = `${players[1].roundScore.toLocaleString('pt-BR')}`;
        p2TotalEl.innerText = `${players[1].totalScore.toLocaleString('pt-BR')}`;
    }
    
    if(isFinalRound) roundDisplayEl.innerText = "FINAL";
    else if (isTieBreaker) roundDisplayEl.innerText = "DESEMPATE";
    else roundDisplayEl.innerText = `Rodada ${currentRound} / ${maxRounds}`;

    if (numPlayers === 2 && !isFinalRound) {
        if (currentPlayerIndex === 0) { p1Card.classList.add('active'); p2Card.classList.remove('active'); }
        else { p1Card.classList.remove('active'); p2Card.classList.add('active'); }
    } else { p1Card.classList.add('active'); }
}

function updateLivesUI() {
    const livesLeft = Math.max(0, spMaxMisses - spMisses);
    spLivesDisplay.innerText = '❤️'.repeat(livesLeft) + '💔'.repeat(spMaxMisses - livesLeft);
}

function disableKeyboard(disabled) {
    if(disabled) keyboardContainer.classList.add('disabled-grid');
    else keyboardContainer.classList.remove('disabled-grid');
}

function toggleInputLock(locked) {
    if(locked) mainLayoutArea.classList.add('ui-locked');
    else mainLayoutArea.classList.remove('ui-locked');
}

function isSuddenDeath() {
    if(isFinalRound) return false;
    const hidden = document.querySelectorAll('.letter-box.hidden').length;
    return hidden > 0 && hidden <= 3;
}

// === BOT LOGIC (INTELIGÊNCIA AVANÇADA) ===
function botTurnRoutine() {
    if(isFinalRound) return; 
    toggleInputLock(true); 
    setTimeout(() => {
        const randomPower = 0.5 + Math.random() * 0.4;
        spinWheel(randomPower); 
    }, 1500);
}

function botCheckSuddenDeathAndAct() {
    if(isSuddenDeath()) {
        const willSolve = Math.random() < 0.9; 
        if(willSolve) {
            simulateBotSolving();
        } else {
             setTimeout(() => {
                const count = currentPuzzle.words.length;
                const msg = count > 1 ? "Silvio não sabe quais são as palavras..." : "Silvio não sabe qual é a palavra...";
                
                Swal.fire({
                    ...swalCommon, title: msg,
                    text: 'Ele passou a vez!',
                    timer: 2000, showConfirmButton: false,
                    toast: true, position: 'bottom', background: '#800000'
                }).then(() => switchTurn());
            }, 1000);
        }
    } else {
        botMakeDecision(); 
    }
}

// Helper para analisar o estado atual das palavras
function getPuzzleState() {
    return currentPuzzle.words.map(word => {
        const letters = word.split('');
        const missing = letters.filter(l => !guessedLetters.includes(l));
        return {
            word: word,
            missingCount: missing.length,
            missingLetters: [...new Set(missing)] 
        };
    });
}

function botMakeDecision() {
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    
    let candidate = null;
    let candidateIndex = -1;

    for(let i = 0; i < botPriorityList.length; i++) {
        if(!guessedLetters.includes(botPriorityList[i])) {
            candidate = botPriorityList[i];
            candidateIndex = i;
            break;
        }
    }

    if(!candidate) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const available = alphabet.filter(l => !guessedLetters.includes(l));
        if(available.length > 0) candidate = available[Math.floor(Math.random() * available.length)];
    }

    if(!candidate) return; 

    const allText = currentPuzzle.words.join('');
    const isCorrect = allText.includes(candidate);
    let finalChoice = candidate;

    if(!isCorrect) {
        const puzzleState = getPuzzleState();
        let swapped = false;

        const wordsMissingOne = puzzleState.filter(w => w.missingCount === 1);
        if (wordsMissingOne.length > 0) {
            if (Math.random() < 0.80) {
                const targetWord = wordsMissingOne[Math.floor(Math.random() * wordsMissingOne.length)];
                finalChoice = targetWord.missingLetters[0];
                swapped = true;
            }
        }

        if (!swapped) {
            const wordsMissingTwo = puzzleState.filter(w => w.missingCount === 2);
            if (wordsMissingTwo.length > 0) {
                if (Math.random() < 0.60) {
                    const targetWord = wordsMissingTwo[Math.floor(Math.random() * wordsMissingTwo.length)];
                    const possibleLetters = targetWord.missingLetters;
                    if(possibleLetters.length > 0) {
                        finalChoice = possibleLetters[Math.floor(Math.random() * possibleLetters.length)];
                        swapped = true;
                    }
                }
            }
        }

        if (!swapped) {
            const isConsonant = !vowels.includes(candidate);
            if(isConsonant) {
                const availableVowel = vowels.find(v => !guessedLetters.includes(v));
                if(availableVowel) {
                    finalChoice = availableVowel;
                } else {
                    if(Math.random() >= 0.5) {
                        for(let j = candidateIndex + 1; j < botPriorityList.length; j++) {
                            if(!guessedLetters.includes(botPriorityList[j])) {
                                finalChoice = botPriorityList[j];
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    setTimeout(() => { handleGuess(finalChoice); }, 1500);
}

function simulateBotSolving() {
    let inputsHtml = '<div style="display:flex; flex-direction:column; gap:5px;">';
    currentPuzzle.words.forEach((word, index) => {
        inputsHtml += `<input id="solve-word-${index}" class="swal2-input fix-swal-input-word" placeholder="PALAVRA ${index+1}" value="" disabled>`;
    });
    inputsHtml += '</div>';

    Swal.fire({
        ...swalCommon,
        title: `Silvio está respondendo...`,
        html: inputsHtml,
        showConfirmButton: false, allowOutsideClick: false,
        didOpen: () => {
            let wordIndex = 0;
            let charIndex = 0;
            const words = currentPuzzle.words;

            function typeNextChar() {
                if(wordIndex >= words.length) {
                    setTimeout(() => {
                        Swal.close();
                        const allText = currentPuzzle.words.join('');
                        const allLetters = allText.split('').filter(l => l !== ' ');
                        
                        allLetters.forEach(l => { 
                            if(!guessedLetters.includes(l)) { 
                                guessedLetters.push(l); 
                                revealLetters(l, false); 
                            } 
                        });
                        
                        if(roundValue > 0 && hasSpun) {
                            players[currentPlayerIndex].roundScore += roundValue;
                            updateScoreUI();
                        }
                        
                        checkWinCondition();
                    }, 1000);
                    return;
                }
                const currentWord = words[wordIndex];
                const inputEl = document.getElementById(`solve-word-${wordIndex}`);
                if(charIndex < currentWord.length) {
                    inputEl.value += currentWord[charIndex];
                    charIndex++;
                    setTimeout(typeNextChar, 150);
                } else {
                    wordIndex++;
                    charIndex = 0;
                    setTimeout(typeNextChar, 300);
                }
            }
            setTimeout(typeNextChar, 500);
        }
    });
}
// =================

function switchTurn() {
    if (numPlayers === 1) return; 
    currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
    updateScoreUI(); hasSpun = false; disableKeyboard(true); sliderCanSpin = true; roundValue = 0;
    isProcessingGuess = false; // Libera processamento para o próximo turno
    
    Swal.fire({
        ...swalCommon,
        title: `VEZ DE ${players[currentPlayerIndex].name}`,
        timer: 3500, showConfirmButton: false, toast: true, position: 'bottom',
        background: '#003399',
        customClass: { popup: 'game-toast' }
    }).then(() => {
        if(isBotGame && currentPlayerIndex === 1) {
            botTurnRoutine();
        } else {
            toggleInputLock(false);
        }
    });
}

function setupBoard() {
    boardEl.innerHTML = '';
    currentPuzzle.words.forEach(word => {
        const row = document.createElement('div');
        row.classList.add('word-row');
        const wordSplit = word.split('');
        wordSplit.forEach(letter => {
            const letterDiv = document.createElement('div');
            letterDiv.classList.add('letter-box', 'hidden');
            letterDiv.setAttribute('data-letter', letter);
            row.appendChild(letterDiv);
        });
        boardEl.appendChild(row);
    });
}

function revealLetters(letter, doCheck = true) {
    const targets = document.querySelectorAll(`.letter-box.hidden[data-letter="${letter}"]`);
    if (targets.length > 0) playSound('correct');
    targets.forEach(el => { el.classList.remove('hidden'); el.classList.add('reveal'); el.innerText = letter; });
    
    const btn = document.getElementById(`key-${letter}`);
    if (btn) btn.classList.add('correct');

    if(doCheck) checkWinCondition();
}

function checkSuddenDeathTransition() {
    if (isFinalRound) return;
    
    if (isSuddenDeath()) {
        disableKeyboard(true); 
        btnSolve.style.display = 'none'; 

        Swal.fire({
            ...swalCommon, 
            icon: 'info', title: 'FALTAM POUCAS LETRAS!',
            text: 'Você deve responder a palavra agora.',
            timer: 3500, showConfirmButton: false
        }).then(() => {
            if(isBotGame && currentPlayerIndex === 1) {
                const willSolve = Math.random() < 0.9;
                if(willSolve) simulateBotSolving();
                else switchTurn();
            } else {
                handleSolve(); 
            }
        });
        return true;
    }
    return false;
}

function handleGuess(letter) {
    if (isFinalRound) return; 
    if (isProcessingGuess) return; 
    if (!(isBotGame && currentPlayerIndex === 1) && keyboardContainer.classList.contains('disabled-grid')) return;

    if (!hasSpun && !(isBotGame && currentPlayerIndex === 1)) { 
        Swal.fire({ ...swalCommon, title:'Puxe a alavanca!', icon:'warning', timer: 1500, showConfirmButton: false, toast: true, position: 'bottom', customClass: { popup: 'game-toast' } }); 
        return; 
    }
    
    if (guessedLetters.includes(letter)) return; 

    isProcessingGuess = true; 
    disableKeyboard(true); 

    guessedLetters.push(letter);
    const btn = document.getElementById(`key-${letter}`);
    const allWordsString = currentPuzzle.words.join('');
    
    if (allWordsString.includes(letter)) {
        if(btn) btn.classList.add('correct');
        const count = allWordsString.split(letter).length - 1;
        const earned = roundValue * count;
        players[currentPlayerIndex].roundScore += earned;
        updateScoreUI(); 
        revealLetters(letter, false); 
        
        Swal.fire({
            ...swalCommon,
            title: `Tem ${count} letra${count > 1 ? 's' : ''} ${letter}`,
            icon: 'success',
            toast: true, position: 'bottom', 
            timer: 3000, 
            showConfirmButton: false,
            customClass: { popup: 'game-toast' }
        });

        setTimeout(() => {
            isProcessingGuess = false; 
            const isSudden = checkSuddenDeathTransition();
            if(!isSudden) {
                const won = checkWinCondition();
                if(!won) {
                    hasSpun = false; 
                    if(isBotGame && currentPlayerIndex === 1) {
                         wheelResultEl.innerText = "Silvio acertou! Ele gira de novo.";
                         botTurnRoutine(); 
                    } else {
                        disableKeyboard(true); 
                        sliderCanSpin = true;
                        wheelResultEl.innerText = "Acertou! Gire novamente.";
                    }
                }
            }
        }, 800); 

    } else {
        if(btn) btn.classList.add('wrong');
        playSound('wrong');
        
        if (numPlayers === 1) {
            spMisses++;
            updateLivesUI();
            if (spMisses >= spMaxMisses) { 
                disableKeyboard(true); sliderCanSpin = false;
                Swal.fire({
                    ...swalCommon, icon: 'error', title: 'PERDEU!', text: 'Suas chances acabaram.', background: '#800000', timer: 3000, showConfirmButton: false
                }).then(() => {
                    players[0].roundScore = 0; updateScoreUI(); advanceRound();
                });
                return;
            }
        }
        
        Swal.fire({ 
            icon: 'error', 
            title: `Não tem "${letter}"!`, 
            timer: 3500, 
            showConfirmButton: false, 
            toast: true, 
            position: 'bottom', 
            background: '#b30000', 
            color: '#ffffff', 
            customClass: { popup: 'game-toast' } 
        })
        .then(() => {
            if (numPlayers === 2) switchTurn();
            else { 
                hasSpun = false; 
                disableKeyboard(true); 
                sliderCanSpin = true; 
                wheelResultEl.innerText = "Tente novamente."; 
                isProcessingGuess = false; 
            }
        });
    }
}

async function handleSolve() {
    if(isBotGame && currentPlayerIndex === 1) return; 

    let inputsHtml = '<div style="display:flex; flex-direction:column; gap:5px;">';
    currentPuzzle.words.forEach((word, index) => {
        const letters = word.split('');
        const isRevealed = letters.every(l => guessedLetters.includes(l));
        const val = isRevealed ? word : '';
        inputsHtml += `<input id="solve-word-${index}" class="swal2-input fix-swal-input-word" placeholder="PALAVRA ${index+1}" value="${val}" autocomplete="off" autocapitalize="characters">`;
    });
    inputsHtml += '</div>';

    const { value: formValues } = await Swal.fire({
        ...swalCommon,
        title: `Responder`,
        html: inputsHtml,
        showCancelButton: true,
        confirmButtonText: 'Responder',
        cancelButtonText: 'Cancelar', 
        allowOutsideClick: false,
        customClass: { container: 'solve-popup-container', popup: 'compact-popup' },
        didOpen: () => {
             currentPuzzle.words.forEach((_, index) => {
                 const el = document.getElementById(`solve-word-${index}`);
                 if(el) el.oninput = () => el.value = el.value.toUpperCase();
             });
             setTimeout(() => {
                 const first = document.getElementById('solve-word-0');
                 if(first) first.focus();
             }, 100);
        },
        preConfirm: () => {
            const answers = [];
            let allFilled = true;
            currentPuzzle.words.forEach((_, index) => {
                const val = document.getElementById(`solve-word-${index}`).value;
                if(!val) allFilled = false;
                answers.push(removeAccents(val.trim()));
            });
            if(!allFilled) { Swal.showValidationMessage('Preencha todas as palavras!'); return false; }
            return answers;
        }
    });

    if (formValues) {
        const userAnswers = formValues; 
        const correctAnswers = currentPuzzle.words;
        let allCorrect = true;
        if(userAnswers.length !== correctAnswers.length) allCorrect = false;
        else {
            for(let i=0; i<correctAnswers.length; i++) {
                if(userAnswers[i] !== correctAnswers[i]) { allCorrect = false; break; }
            }
        }

        if (allCorrect) {
            const allText = currentPuzzle.words.join('');
            const allLetters = allText.split('').filter(l => l !== ' ');
            
            allLetters.forEach(l => { 
                if(!guessedLetters.includes(l)) { 
                    guessedLetters.push(l); 
                    revealLetters(l, false); 
                } 
            });
            
            if(roundValue > 0 && hasSpun) {
                players[currentPlayerIndex].roundScore += roundValue;
                updateScoreUI();
            }
            checkWinCondition();
        } else {
            playSound('wrong');
            if(numPlayers === 1) {
                players[currentPlayerIndex].roundScore = 0; 
                updateScoreUI();
            }

            Swal.fire({ 
                ...swalCommon, icon: 'error', title: 'ERRADO!', text: `Resposta incorreta.`, background: '#800000',
                timer: 3000, showConfirmButton: false, toast: true, position: 'bottom', customClass: { popup: 'game-toast' }
            })
            .then(() => {
                if (numPlayers === 2) switchTurn();
                else Swal.fire({ ...swalCommon, title: 'Perdeu a rodada.', icon: 'error', timer: 2000, showConfirmButton: false }).then(() => advanceRound());
            });
        }
    } else {
         Swal.fire({ 
            ...swalCommon, title: 'Passou a vez!', icon: 'info',
            timer: 2500, showConfirmButton: false, toast: true, position: 'bottom', customClass: { popup: 'game-toast' }
        })
        .then(() => {
            if (numPlayers === 2) switchTurn();
        });
    }
}

function checkWinCondition() {
    if (isFinalRound) return false;
    const allText = currentPuzzle.words.join('');
    const uniqueLetters = [...new Set(allText.split(''))];
    const allGuessed = uniqueLetters.every(l => guessedLetters.includes(l));

    if (allGuessed) {
        playSound('win');
        players[currentPlayerIndex].totalScore += players[currentPlayerIndex].roundScore;
        updateScoreUI();
        setTimeout(() => {
            Swal.fire({
                ...swalCommon, 
                title: `RODADA VENCIDA POR ${players[currentPlayerIndex].name}!`,
                html: `Ganhou: R$ ${players[currentPlayerIndex].roundScore.toLocaleString('pt-BR')}`,
                icon: 'success', confirmButtonText: 'Próxima'
            }).then(() => advanceRound());
        }, 1000);
        return true;
    }
    return false;
}

function checkEndGame() {
    if (numPlayers === 1) {
        if(players[0].totalScore > 0) startFinalRound(players[0]);
        else finishGame(false);
        return;
    }
    if (players[0].totalScore > players[1].totalScore) startFinalRound(players[0]);
    else if (players[1].totalScore > players[0].totalScore) startFinalRound(players[1]);
    else initTieBreaker();
}

function initTieBreaker() {
    isTieBreaker = true; tieBreakerState = { p1Val: 0, p2Val: 0, turns: 0 }; currentPlayerIndex = 0;
    
    let msg = 'Quem tirar o maior valor vence.';
    if(isBotGame) msg = 'Desempate contra o Silvio!';

    Swal.fire({ ...swalCommon, title: 'EMPATE!', text: msg, customClass: { popup: 'game-toast' } })
    .then(() => { 
        updateScoreUI(); 
        if(isBotGame && currentPlayerIndex === 1) {
            wheelResultEl.innerText = "Silvio gira...";
            botTurnRoutine();
        } else {
            toggleInputLock(false);
            wheelResultEl.innerText = `${players[0].name}, gire!`; 
            sliderCanSpin = true; 
        }
    });
}

function spinTieBreaker(resultSlot) {
    let val = resultSlot.value;
    Swal.fire({ 
        ...swalCommon, title: `Tirou ${resultSlot.label}`, icon: 'info', timer: 2500, showConfirmButton: false,
        toast: true, position: 'bottom', customClass: { popup: 'game-toast' }
    })
    .then(() => {
        if (tieBreakerState.turns === 0) {
            tieBreakerState.p1Val = val; tieBreakerState.turns = 1; currentPlayerIndex = 1;
            updateScoreUI(); 
            if(isBotGame) {
                wheelResultEl.innerText = "Vez do Silvio...";
                botTurnRoutine();
            } else {
                toggleInputLock(false);
                wheelResultEl.innerText = `${players[1].name}, sua vez!`; 
                sliderCanSpin = true;
            }
        } else {
            tieBreakerState.p2Val = val;
            if (tieBreakerState.p1Val > tieBreakerState.p2Val) startFinalRound(players[0]);
            else if (tieBreakerState.p2Val > tieBreakerState.p1Val) startFinalRound(players[1]);
            else Swal.fire({ ...swalCommon, title: 'EMPATE DE NOVO!' }).then(() => initTieBreaker());
        }
    });
}

function advanceRound() {
    if (currentRound < maxRounds) { currentRound++; startRound(); } else checkEndGame();
}

function finishGame(win = true) {
    playSound('win');
    
    // Restaura música normal se acabar
    if(!isMuted) {
        audioFx.final.pause();
        audioFx.bg.play().catch(()=>{});
    }

    let winnerIndex = 0;
    if (numPlayers === 2 && players[1].totalScore > players[0].totalScore) winnerIndex = 1;

    if (numPlayers === 1) {
        updatePlayerStats(players[0].name, players[0].totalScore, win);
    } else {
        players.forEach((p, idx) => {
            const isWinner = (idx === winnerIndex && win);
            updatePlayerStats(p.name, p.totalScore, isWinner);
        });
    }

    if(!win) {
         Swal.fire({ ...swalCommon, title: 'FIM DE JOGO!', icon:'error', html: `Não foi dessa vez.`, confirmButtonText: 'Menu Principal' }).then(() => location.reload());
        return;
    }

    let htmlContent = '<div style="text-align:left; margin-top:10px; display:inline-block;">';
    players.forEach((p, idx) => {
        if(numPlayers === 1 && idx === 1) return;
        
        const isWinner = (idx === winnerIndex);
        const style = isWinner ? 'color:#00ff00; font-weight:bold;' : 'color:white;';
        const icon = isWinner ? '🏆' : '👤';
        
        htmlContent += `
            <div style="${style}; font-size:1.1rem; margin-bottom:5px; border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:5px;">
                ${icon} ${p.name}: R$ ${p.totalScore.toLocaleString('pt-BR')}
            </div>`;
    });
    htmlContent += '</div>';

    Swal.fire({ 
        ...swalCommon, 
        title: 'FIM DE JOGO!', 
        html: htmlContent, 
        icon: 'info', 
        confirmButtonText: 'Menu Principal' 
    }).then(() => location.reload());
}

async function startFinalRound(winner) {
    isFinalRound = true; isTieBreaker = false; finalistPlayer = winner;
    currentPlayerIndex = (winner === players[0]) ? 0 : 1;
    
    // Troca a música para a final
    if(!isMuted) {
        audioFx.bg.pause();
        audioFx.bg.currentTime = 0;
        audioFx.final.play().catch(()=>{});
    }

    updateScoreUI();
    p2Card.style.display = 'none'; p1Card.style.display = 'none'; spLivesContainer.style.display = 'none';
    
    const wrapper = document.querySelector('.players-wrapper');
    wrapper.innerHTML = `
        <div class="player-card active" style="width:100%; text-align:center; border-color:gold;">
            <div class="p-name" style="color:#ffcc00; font-size:1.1rem;">FINALISTA: ${winner.name}</div>
            <div class="p-total" style="font-size:1.1rem; color:white;">R$ ${winner.totalScore.toLocaleString('pt-BR')}</div>
        </div>
    `;

    currentPuzzle = generatePuzzle(true);
    guessedLetters = [];
    
    categoryEl.innerText = currentPuzzle.category;
    setupBoard(); 
    resetKeyboard(); 
    disableKeyboard(true);
    sliderCanSpin = false; 
    btnSolve.style.display = 'none';
    wheelResultEl.innerText = "RODADA FINAL! Valendo o Dobro!";
    
    if(isBotGame && currentPlayerIndex === 1) {
        toggleInputLock(true);
        await Swal.fire({ ...swalCommon, title: 'FINAL!', html: `O Silvio venceu!<br>Ele vai tentar acertar a palavra.` });
        simulateBotFinalLetterSelection();
    } else {
        toggleInputLock(false);
        await Swal.fire({ ...swalCommon, title: 'FINAL!', html: `Parabéns <b>${winner.name}</b>!<br>Escolha <b>4 Consoantes</b> e <b>1 Vogal</b>.` });
        promptFinalLetters();
    }
}

function simulateBotFinalLetterSelection() {
    Swal.fire({
        ...swalCommon,
        title: 'Silvio está escolhendo...',
        html: `
            <div style="font-size:0.9rem; margin-bottom:5px">4 Consoantes + 1 Vogal:</div>
            <div class="final-inputs-wrapper" style="display:flex; justify-content:center; gap:5px;">
                <input id="bot-c1" class="swal2-input fix-swal-input" disabled>
                <input id="bot-c2" class="swal2-input fix-swal-input" disabled>
                <input id="bot-c3" class="swal2-input fix-swal-input" disabled>
                <input id="bot-c4" class="swal2-input fix-swal-input" disabled>
                <span style="align-self:center; font-weight:bold">-</span>
                <input id="bot-v1" class="swal2-input fix-swal-input" disabled>
            </div>
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
        customClass: { container: 'final-popup-container', popup: 'final-popup-right' },
        didOpen: () => {
            const choices = ['R', 'S', 'C', 'N', 'A']; 
            const inputsIds = ['bot-c1', 'bot-c2', 'bot-c3', 'bot-c4', 'bot-v1'];
            
            let index = 0;
            const interval = setInterval(() => {
                if (index < choices.length) {
                    document.getElementById(inputsIds[index]).value = choices[index];
                    index++;
                } else {
                    clearInterval(interval);
                    setTimeout(() => {
                        Swal.close();
                        botFinalRoundLogic(); 
                    }, 1000);
                }
            }, 600); 
        }
    });
}

function botFinalRoundLogic() {
    const botFinalChoice = ['R','S','C','N','A'];
    
    setTimeout(() => {
        revealFinalLetters(botFinalChoice);
    }, 500);

    setTimeout(() => {
        botFinalGuessLogic();
    }, 6000); 
}

function botFinalGuessLogic() {
    const hiddenCount = document.querySelectorAll('.letter-box.hidden').length;
    let winChance = 0.1; 

    if (hiddenCount <= 3) winChance = 0.9;
    else if (hiddenCount === 4) winChance = 0.6;
    else if (hiddenCount === 5) winChance = 0.3;

    const willWin = Math.random() < winChance;
    const secretWord = currentPuzzle.words.join('').toUpperCase();

    if (willWin) {
        Swal.fire({
            ...swalCommon,
            title: `Silvio está respondendo...`,
            html: `<div style="display:flex; justify-content:center;"><input id="bot-final-solve" class="swal2-input fix-swal-input-word" value="" disabled></div>`,
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
                let charIndex = 0;
                const inputEl = document.getElementById('bot-final-solve');
                function typeChar() {
                    if (charIndex < secretWord.length) {
                        inputEl.value += secretWord[charIndex];
                        charIndex++;
                        setTimeout(typeChar, 150);
                    } else {
                        setTimeout(() => {
                            Swal.close();
                            finalWinEffects(secretWord);
                        }, 1000);
                    }
                }
                setTimeout(typeChar, 500);
            }
        });
    } else {
        Swal.fire({
            ...swalCommon, 
            title: 'O SILVIO NÃO SABE!', 
            text: "Ele não conseguiu adivinhar a palavra.", 
            timer: 3500, 
            showConfirmButton: false,
            background: '#800000'
        }).then(() => {
            const revealed = document.querySelectorAll('.letter-box.reveal').length;
            const bonus = revealed * 1000;
            triggerFinalLoss(bonus, secretWord);
        });
    }
}

async function promptFinalLetters() {
    const { value: formValues } = await Swal.fire({
        ...swalCommon,
        title: 'Digite 5 Letras',
        html: `
            <div style="font-size:0.9rem; margin-bottom:5px">4 Consoantes + 1 Vogal:</div>
            <div class="final-inputs-wrapper" style="display:flex; justify-content:center; gap:5px;">
                <input id="c1" class="swal2-input fix-swal-input" maxlength="1" style="text-transform:uppercase;" autocapitalize="characters">
                <input id="c2" class="swal2-input fix-swal-input" maxlength="1" style="text-transform:uppercase;" autocapitalize="characters">
                <input id="c3" class="swal2-input fix-swal-input" maxlength="1" style="text-transform:uppercase;" autocapitalize="characters">
                <input id="c4" class="swal2-input fix-swal-input" maxlength="1" style="text-transform:uppercase;" autocapitalize="characters">
                <span style="align-self:center; font-weight:bold">-</span>
                <input id="v1" class="swal2-input fix-swal-input" maxlength="1" style="text-transform:uppercase;" autocapitalize="characters">
            </div>
        `,
        backdrop: false,
        customClass: { container: 'final-popup-container', popup: 'final-popup-right' },
        didOpen: () => {
            const inputs = ['c1','c2','c3','c4','v1'];
            // Lógica de Validação e Auto-Tab
            inputs.forEach((id, index) => {
                const el = document.getElementById(id);
                el.addEventListener('input', (e) => {
                    let val = e.target.value.toUpperCase();
                    const isVowel = (id === 'v1');
                    
                    const pattern = isVowel ? /[AEIOU]/ : /[B-DF-HJ-NP-TV-Z]/;
                    
                    if(!pattern.test(val)) {
                        e.target.value = ''; 
                        return;
                    }
                    
                    e.target.value = val;
                    if(val.length === 1 && index < inputs.length - 1) {
                         document.getElementById(inputs[index+1]).focus();
                    }
                });
            });

            setTimeout(() => {
                document.getElementById('c1').focus();
            }, 100);
        },
        preConfirm: () => {
            const inputs = ['c1','c2','c3','c4','v1'].map(id => document.getElementById(id).value.toUpperCase());
            const [c1, c2, c3, c4, v1] = inputs;
            const consonants = [c1, c2, c3, c4];
            if (consonants.some(c => !c)) { Swal.showValidationMessage('Preencha as Consoantes'); return false; }
            if (!v1) { Swal.showValidationMessage('Preencha a Vogal'); return false; }
            const all = [...consonants, v1];
            if (new Set(all).size !== all.length) { Swal.showValidationMessage('Não repita letras'); return false; }
            return all;
        }
    });
    if (formValues) revealFinalLetters(formValues);
}

function revealFinalLetters(chosenLetters) {
    let delay = 800;
    chosenLetters.forEach((letter, index) => {
        setTimeout(() => {
            const allText = currentPuzzle.words.join('');
            if (allText.includes(letter)) {
                if(!guessedLetters.includes(letter)) { guessedLetters.push(letter); revealLetters(letter, false); }
            }
        }, delay * (index + 1));
    });
    
    if(!(isBotGame && currentPlayerIndex === 1)) {
        setTimeout(() => { promptFinalAnswer(); }, delay * (chosenLetters.length + 2));
    }
}

async function promptFinalAnswer() {
    const result = await Swal.fire({
        ...swalCommon, 
        title: 'QUAL A PALAVRA?', input: 'text', inputPlaceholder: 'Digite a resposta', 
        backdrop: false, showDenyButton: true, denyButtonText: 'Não sei',
        // Adicionado autocapitalize
        inputAttributes: { autocapitalize: 'characters' },
        customClass: { container: 'final-popup-container', popup: 'final-popup-right compact-popup' },
        didOpen: () => { 
            const input = Swal.getInput(); 
            input.oninput = () => input.value = input.value.toUpperCase(); 
            // Foco automático
            setTimeout(() => input.focus(), 100);
        },
        inputValidator: (value) => { if (!value) return 'Escreva algo!'; }
    });

    if (result.isConfirmed) {
        // NORMALIZA O INPUT DO USUARIO (REMOVE ACENTOS E Ç)
        const userGuess = removeAccents(result.value.trim().replace(/\s+/g, ''));
        const secretWord = currentPuzzle.words.join('').toUpperCase();
        if (userGuess === secretWord) finalWinEffects(secretWord);
        else {
             const revealed = document.querySelectorAll('.letter-box.reveal').length;
             const bonus = revealed * 1000;
             triggerFinalLoss(bonus, secretWord);
        }
    } else if (result.isDenied) {
        const revealed = document.querySelectorAll('.letter-box.reveal').length;
        const bonus = revealed * 1000;
        const secretWord = currentPuzzle.words.join('').toUpperCase();
        triggerFinalLoss(bonus, secretWord);
    }
}

function finalWinEffects(secretWord) {
    const allText = currentPuzzle.words.join('');
    const allLetters = allText.split('').filter(l => l !== ' ');
    allLetters.forEach(l => {
         const targets = document.querySelectorAll(`.letter-box.hidden[data-letter="${l}"]`);
         targets.forEach(el => { el.classList.remove('hidden'); el.innerText = l; });
    });
    const revealed = document.querySelectorAll('.letter-box.reveal').length;
    const bonus = revealed * 1000;
    playSound('win');
    
    // Volta música normal
    if(!isMuted) {
        audioFx.final.pause();
        audioFx.bg.play().catch(()=>{});
    }

    const finalPrize = (finalistPlayer.totalScore * 2) + bonus;

    // --- RANKING SAVING ---
    updatePlayerStats(finalistPlayer.name, finalPrize, true); 
    if(numPlayers === 2) {
        const loser = players.find(p => p !== finalistPlayer);
        if(loser) updatePlayerStats(loser.name, loser.totalScore, false);
    }

    Swal.fire({
        ...swalCommon, title: 'PARABÉNS!', html: `Palavra: <b>${secretWord}</b><br>Prêmio: <h1 style="color:gold;">R$ ${finalPrize.toLocaleString('pt-BR')}</h1>`, confirmButtonText: 'Jogar Novamente'
    }).then(() => location.reload());
}

function triggerFinalLoss(bonus, secretWord) {
    playSound('wrong');
    const allLetters = secretWord.split('').filter(l => l !== ' ');
    allLetters.forEach(l => {
         const targets = document.querySelectorAll(`.letter-box.hidden[data-letter="${l}"]`);
         targets.forEach(el => { el.classList.remove('hidden'); el.innerText = l; });
    });

    // Volta música normal
    if(!isMuted) {
        audioFx.final.pause();
        audioFx.bg.play().catch(()=>{});
    }

    // --- RANKING SAVING ---
    const consolationPrize = finalistPlayer.totalScore + bonus;
    updatePlayerStats(finalistPlayer.name, consolationPrize, false);

    if(numPlayers === 2) {
        const loser = players.find(p => p !== finalistPlayer);
        if(loser) updatePlayerStats(loser.name, loser.totalScore, false);
    }

    // EXIBINDO O TOTAL
    Swal.fire({
        ...swalCommon, 
        title: 'QUE PENA!', 
        icon: 'error', 
        html: `A palavra era: <b>${secretWord}</b><br>
               Bônus das letras: R$ ${bonus.toLocaleString('pt-BR')}<br>
               <h3 style="margin-top:5px; color:#ffcc00">Total Ganho: R$ ${consolationPrize.toLocaleString('pt-BR')}</h3>`, 
        confirmButtonText: 'Jogar Novamente', 
        background: '#800000'
    }).then(() => location.reload());
}

// === FUNÇÕES DA ROLETA ===

function spinWheel(power = 0.5) {
    sliderCanSpin = false;
    disableKeyboard(true);
    
    Swal.fire({
        ...swalCommon, title: 'Girando...', toast: true, position: 'bottom', 
        showConfirmButton: false, timer: 5000, background: '#002266',
        customClass: { popup: 'game-toast' }
    });

    if(!isMuted) { audioFx.spin.currentTime = 0; audioFx.spin.play(); }

    const winningIndex = Math.floor(Math.random() * wheelSlots.length);
    const segmentAngle = 360 / wheelSlots.length;
    const targetBaseAngle = (winningIndex * segmentAngle) + (segmentAngle / 2);
    
    const extraSpins = 3 + Math.floor(power * 3); 
    const fullSpins = 360 * extraSpins; 
    
    const currentMod = currentRotation % 360;
    let distance = targetBaseAngle - currentMod;
    if (distance < 0) distance += 360;
    const spinAmount = fullSpins + distance;
    
    currentRotation += spinAmount;
    wheelEl.style.transform = `rotate(-${currentRotation}deg)`;

    setTimeout(() => {
        if(!isMuted) { audioFx.spin.pause(); audioFx.spin.currentTime = 0; }
        if(isTieBreaker) {
            const offset = segmentAngle / 2;
            const actualRotation = currentRotation % 360;
            let wIndex = Math.round((actualRotation - offset) / segmentAngle);
            if (wIndex < 0) wIndex = wheelSlots.length - 1;
            if (wIndex >= wheelSlots.length) wIndex = 0;
            spinTieBreaker(wheelSlots[wIndex]);
        } else calculateResult(currentRotation);
    }, 4000);
}

function calculateResult(rotation) {
    const segmentAngle = 360 / wheelSlots.length;
    const offset = segmentAngle / 2; 
    const actualRotation = rotation % 360;
    let winningIndex = Math.round((actualRotation - offset) / segmentAngle);
    if (winningIndex < 0) winningIndex = wheelSlots.length - 1;
    if (winningIndex >= wheelSlots.length) winningIndex = 0;
    
    const resultSlot = wheelSlots[winningIndex];

    if (resultSlot.type === 'bankruptcy' || resultSlot.type === 'pass') {
        playSound('wrong');
        
        const alertTitle = resultSlot.type === 'bankruptcy' ? 'PERDEU TUDO' : 'PASSOU A VEZ';

        Swal.fire({
            ...swalCommon, 
            icon: 'error', 
            title: alertTitle, 
            timer: 3000, 
            showConfirmButton: false, 
            position: 'center',
            toast: false, 
            backdrop: true, 
            background: '#800000',
            customClass: { popup: 'game-toast small-central-alert' } 
        }).then(() => {
            if(resultSlot.type === 'bankruptcy') { players[currentPlayerIndex].roundScore = 0; updateScoreUI(); }
            if (numPlayers === 2) switchTurn();
            else { 
                hasSpun = false; 
                sliderCanSpin = true; 
                wheelResultEl.innerText = "Gire novamente."; 
                toggleInputLock(false);
            }
        });
    } else {
        roundValue = resultSlot.value;
        hasSpun = true; 
        
        if(isBotGame && currentPlayerIndex === 1) {
            wheelResultEl.innerText = `Silvio tirou R$ ${roundValue}...`;
            botCheckSuddenDeathAndAct(); 
        } else {
            if(isSuddenDeath()) {
                disableKeyboard(true); 
                Swal.fire({
                    ...swalCommon, title: `Valendo R$ ${roundValue}`,
                    text: 'Faltam poucas letras! Responda agora.',
                    icon: 'warning',
                    timer: 3500, showConfirmButton: false
                }).then(() => {
                    handleSolve();
                });
            } else {
                disableKeyboard(false);
                toggleInputLock(false); 
                Swal.fire({
                    ...swalCommon, title: `Valendo R$ ${roundValue}`, text: 'Escolha uma letra!',
                    toast: true, position: 'bottom', timer: 3500, showConfirmButton: false,
                    customClass: { popup: 'game-toast' }
                });
                wheelResultEl.innerText = `Valendo R$ ${roundValue}. Escolha uma letra!`;
            }
        }
    }
}

btnSolve.addEventListener('click', handleSolve);
document.getElementById('btn-exit').addEventListener('click', () => {
    Swal.fire({ ...swalCommon, title: 'Sair?', showCancelButton: true, confirmButtonText: 'Sim', cancelButtonText: 'Não' })
    .then((r) => { if (r.isConfirmed) location.reload(); });
});

// FUNÇÕES DE DEBUG
document.getElementById('btn-debug-win').addEventListener('click', debugWinRound);
document.getElementById('btn-debug-final').addEventListener('click', debugGoFinal);

function debugWinRound() {
    Swal.close(); 
    handleSolve(); 
}

function debugGoFinal() {
    Swal.close(); 
    currentRound = maxRounds; 
    if(players[0].totalScore === 0) players[0].totalScore = 1000;
    startFinalRound(players[0]);
}

// === SISTEMA DE RANKING (LOCALSTORAGE) ===
const RANKING_KEY = 'rodaaroda_ranking_data';

function getRankingData() {
    const data = localStorage.getItem(RANKING_KEY);
    return data ? JSON.parse(data) : [];
}

function saveRankingData(data) {
    localStorage.setItem(RANKING_KEY, JSON.stringify(data));
}

function updatePlayerStats(name, moneyWon, isWin) {
    // Ignora se for o "Jogador 2" genérico ou Bot
    if (name === "JOGADOR 1" || name === "JOGADOR 2") return; 

    let ranking = getRankingData();
    let player = ranking.find(p => p.name === name);

    if (!player) {
        player = { name: name, matches: 0, wins: 0, money: 0 };
        ranking.push(player);
    }

    player.matches += 1;
    if (isWin) player.wins += 1;
    player.money += moneyWon;

    saveRankingData(ranking);
}

function showRankingScreen() {
    const ranking = getRankingData();
    
    // Ordena: Quem tem mais dinheiro primeiro. Critério de desempate: vitórias.
    ranking.sort((a, b) => {
        if (b.money !== a.money) return b.money - a.money;
        return b.wins - a.wins;
    });

    if (ranking.length === 0) {
        Swal.fire({ ...swalCommon, title: 'RANKING VAZIO', text: 'Jogue para aparecer aqui!', icon: 'info' });
        return;
    }

    let htmlTable = `
        <div style="max-height: 300px; overflow-y: auto;">
        <table class="ranking-table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Partidas</th>
                    <th>Vitórias</th>
                    <th>R$ Total</th>
                </tr>
            </thead>
            <tbody>
    `;

    ranking.forEach(p => {
        htmlTable += `
            <tr>
                <td>${p.name}</td>
                <td>${p.matches}</td>
                <td>${p.wins}</td>
                <td>R$ ${p.matches > 0 ? p.money.toLocaleString('pt-BR') : 0}</td>
            </tr>
        `;
    });

    htmlTable += `</tbody></table></div>`;
    
    htmlTable += `<div style="margin-top:10px; text-align:right;"><small onclick="resetRanking()" style="cursor:pointer; color:#999; text-decoration:underline;">Limpar Ranking</small></div>`;

    Swal.fire({
        ...swalCommon,
        title: '🏆 SALA DA FAMA',
        html: htmlTable,
        width: 600
    });
}

window.resetRanking = function() {
    if(confirm("Tem certeza que deseja apagar todo o histórico?")) {
        localStorage.removeItem(RANKING_KEY);
        Swal.close();
        Swal.fire("Apagado!", "", "success");
    }
};

document.getElementById('btn-ranking').addEventListener('click', showRankingScreen);
