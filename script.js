// === AUDIOS ===
const audioFx = {
    spin: new Audio('https://raw.githubusercontent.com/manojkumar3535/wheel-of-fortune-spin/master/src/assets/audio/spin.mp3'), 
    correct: new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/74196/goodbell.mp3'),
    wrong: new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/74196/bad.mp3'),
    win: new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/74196/win.mp3')
};
audioFx.spin.volume = 0.2; audioFx.spin.loop = true;
audioFx.correct.volume = 0.3; audioFx.wrong.volume = 0.2; audioFx.win.volume = 0.3;

const wheelSlots = [
    { label: "1000", value: 1000, color: "#757575", type: "money" },
    { label: "PERDE<br>TUDO", value: 0, color: "#000000", type: "bankruptcy" },
    { label: "400", value: 400, color: "#ffcc00", type: "money" },
    { label: "200", value: 200, color: "#d30000", type: "money" },
    { label: "PASSA<br>A VEZ", value: 0, color: "#FFFFFF", type: "pass" },
    { label: "500", value: 500, color: "#003399", type: "money" },
    { label: "100", value: 100, color: "#cc00cc", type: "money" },
    { label: "300", value: 300, color: "#009933", type: "money" },
    { label: "PASSA<br>A VEZ", value: 0, color: "#FFFFFF", type: "pass" },
    { label: "1000", value: 1000, color: "#757575", type: "money" },
    { label: "500", value: 500, color: "#ff6600", type: "money" },
    { label: "600", value: 600, color: "#00cccc", type: "money" },
    { label: "200", value: 200, color: "#d30000", type: "money" },
    { label: "PASSA<br>A VEZ", value: 0, color: "#FFFFFF", type: "pass" },
    { label: "700", value: 700, color: "#ffcc00", type: "money" },
    { label: "400", value: 400, color: "#003399", type: "money" },
    { label: "100", value: 100, color: "#009933", type: "money" },
    { label: "800", value: 800, color: "#cc00cc", type: "money" },
    { label: "300", value: 300, color: "#ff6600", type: "money" },
    { label: "500", value: 500, color: "#00cccc", type: "money" },
    { label: "50", value: 50, color: "#ff0080", type: "money" }
];

const wordDatabase = {
    "ANIMAIS": ["ORNITORRINCO", "HIPOPOTAMO", "GIRAFA", "ELEFANTE", "CROCODILO", "GOLFINHO", "TARTARUGA", "AVESTRUZ", "CAMELO", "PINGUIM"],
    "FRUTAS": ["JABUTICABA", "ABACAXI", "LARANJA", "MELANCIA", "MORANGO", "UVA", "BANANA", "KIWI", "PESSEGO", "MARACUJA"],
    "PROFISSÃO": ["ENGENHEIRO", "MEDICO", "ADVOGADO", "PROFESSOR", "DENTISTA", "ARQUITETO", "JORNALISTA", "MOTORISTA", "ELETRICISTA", "PADEIRO"],
    "PAÍS": ["ARGENTINA", "BRASIL", "ALEMANHA", "AUSTRALIA", "CANADA", "JAPAO", "MEXICO", "PORTUGAL", "ESPANHA", "ITALIA"],
    "OBJETO": ["MICROONDAS", "GELADEIRA", "TELEVISAO", "COMPUTADOR", "CELULAR", "CADEIRA", "MESA", "LAMPADA", "ESPELHO", "RELOGIO"],
    "INSTRUMENTO": ["VIOLONCELO", "GUITARRA", "BATERIA", "FLAUTA", "PIANO", "SAXOFONE", "TROMPETE", "VIOLINO", "HARPA", "SANFONA"],
    "ESPORTE": ["BASQUETEBOL", "FUTEBOL", "VOLEI", "NATACAO", "JUDO", "TENIS", "GOLFE", "SURFE", "BOXE", "ATLETISMO"]
};

// ORDEM DE PRIORIDADE DO BOT
const botPriorityList = ['A','E','O','S','R','N','D','M','I','U','T','C','L','P','V','G','Q','H','F','B','Z','J','X','K','W','Y'];

let isMuted = false;
const btnMute = document.getElementById('btn-mute-global');

let currentPuzzle = {}; 
let guessedLetters = [];
let usedWords = []; // Rastreador de palavras usadas
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
    if(isMuted) { audioFx.spin.pause(); audioFx.spin.currentTime = 0; }
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

async function prepareGame(mode) {
    numPlayers = (mode === 3) ? 2 : mode;
    isBotGame = (mode === 3);
    
    let p1Name = "JOGADOR 1";
    let p2Name = "JOGADOR 2";

    const { value: name1 } = await Swal.fire({ 
        ...swalCommon, title: 'Jogador 1', input: 'text', inputPlaceholder: 'Nome',
        didOpen: () => { const i = Swal.getInput(); i.oninput = () => i.value = i.value.toUpperCase(); }
    });
    if (name1) p1Name = name1.toUpperCase().substring(0, 10);

    if (isBotGame) {
        p2Name = "SILVIO (BOT)";
    } else if (numPlayers === 2) {
        const { value: name2 } = await Swal.fire({ 
            ...swalCommon, title: 'Jogador 2', input: 'text', inputPlaceholder: 'Nome',
            didOpen: () => { const i = Swal.getInput(); i.oninput = () => i.value = i.value.toUpperCase(); }
        });
        if (name2) p2Name = name2.toUpperCase().substring(0, 10);
    }

    players[0] = { name: p1Name, roundScore: 0, totalScore: 0 };
    players[1] = { name: p2Name, roundScore: 0, totalScore: 0 };
    currentPlayerIndex = 0; currentRound = 1; isFinalRound = false; isTieBreaker = false;
    usedWords = [];

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
                tempWords.push(word);
            }
            pool.splice(randomIndex, 1);
        }

        if (tempWords.length > 0) {
            selectedWords = tempWords;
            validPuzzle = true;
        }
    }

    if (!validPuzzle) {
        selectedCat = categories[Math.floor(Math.random() * categories.length)];
        selectedWords = [wordDatabase[selectedCat][0]];
    }

    selectedWords.forEach(w => usedWords.push(w));
    return { category: selectedCat, words: selectedWords };
}

function startRound() {
    currentPuzzle = generatePuzzle(false);
    guessedLetters = [];
    players[0].roundScore = 0; players[1].roundScore = 0;
    spMisses = 0;
    isProcessingGuess = false; // Reset no início
    
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

    // Alerta de Início de Rodada
    setTimeout(() => {
        Swal.fire({
            ...swalCommon,
            text: `${players[currentPlayerIndex].name}, é a sua vez de jogar!`,
            timer: 2000, showConfirmButton: false, toast: true, 
            position: 'bottom', // ALTERADO PARA BOTTOM PARA O CSS FUNCIONAR E SUBIR O ALERTA
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
                Swal.fire({
                    ...swalCommon, title: 'Silvio não sabe a resposta...',
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
        // Encontra letras que ainda não foram adivinhadas nesta palavra
        const letters = word.split('');
        const missing = letters.filter(l => !guessedLetters.includes(l));
        return {
            word: word,
            missingCount: missing.length,
            missingLetters: [...new Set(missing)] // Letras únicas que faltam para adivinhar
        };
    });
}

function botMakeDecision() {
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    
    // 1. Identificar a "Candidata Natural" (Ordem de prioridade normal)
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
        // Fallback extremo
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const available = alphabet.filter(l => !guessedLetters.includes(l));
        if(available.length > 0) candidate = available[Math.floor(Math.random() * available.length)];
    }

    if(!candidate) return; // Nada a fazer

    const allText = currentPuzzle.words.join('');
    const isCorrect = allText.includes(candidate);
    let finalChoice = candidate;

    // Se a escolha "Natural" do Bot for ERRADA, aplicamos a inteligência artificial
    if(!isCorrect) {
        
        // Analisa o tabuleiro
        const puzzleState = getPuzzleState();
        let swapped = false;

        // --- REGRA 1: PALAVRA FALTANDO 1 LETRA (80% de chance de acerto) ---
        const wordsMissingOne = puzzleState.filter(w => w.missingCount === 1);
        
        if (wordsMissingOne.length > 0) {
            // Rola o dado (0 a 1)
            if (Math.random() < 0.80) {
                // Pega uma das palavras que falta 1 letra
                const targetWord = wordsMissingOne[Math.floor(Math.random() * wordsMissingOne.length)];
                // Pega a letra que falta (como missingCount é 1, missingLetters[0] é a letra)
                finalChoice = targetWord.missingLetters[0];
                swapped = true;
            }
        }

        // --- REGRA 2: PALAVRA FALTANDO 2 LETRAS (60% de chance de acerto) ---
        // Só executa se não trocou na regra anterior
        if (!swapped) {
            const wordsMissingTwo = puzzleState.filter(w => w.missingCount === 2);
            
            if (wordsMissingTwo.length > 0) {
                // Rola o dado (0 a 1)
                if (Math.random() < 0.60) {
                    // Pega uma das palavras que faltam 2 letras
                    const targetWord = wordsMissingTwo[Math.floor(Math.random() * wordsMissingTwo.length)];
                    // Escolhe aleatoriamente uma das letras que faltam
                    const possibleLetters = targetWord.missingLetters;
                    if(possibleLetters.length > 0) {
                        finalChoice = possibleLetters[Math.floor(Math.random() * possibleLetters.length)];
                        swapped = true;
                    }
                }
            }
        }

        // --- FALLBACK: LÓGICA ANTIGA (Tentar Vogal ou Chutar Errado) ---
        if (!swapped) {
            const isConsonant = !vowels.includes(candidate);
            if(isConsonant) {
                const availableVowel = vowels.find(v => !guessedLetters.includes(v));
                if(availableVowel) {
                    finalChoice = availableVowel;
                } else {
                    // 50% manter erro original, 50% pular para a próxima da lista
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
        timer: 2000, showConfirmButton: false, toast: true, position: 'bottom',
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
            timer: 2500, showConfirmButton: false
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
    
    // --- SEGURANÇA CONTRA CLIQUE RÁPIDO E ERRO DO BOT ---
    if (isProcessingGuess) return; // Bloqueia se já estiver processando algo

    // Se NÃO for a vez do bot, obedece o bloqueio visual do teclado.
    // O bot precisa conseguir jogar mesmo com o teclado travado para o humano.
    if (!(isBotGame && currentPlayerIndex === 1) && keyboardContainer.classList.contains('disabled-grid')) {
        return;
    }

    if (!hasSpun && !(isBotGame && currentPlayerIndex === 1)) { 
        Swal.fire({ ...swalCommon, title:'Puxe a alavanca!', icon:'warning', timer: 2000, showConfirmButton: false, toast: true, position: 'bottom', customClass: { popup: 'game-toast' } }); 
        return; 
    }
    
    if (guessedLetters.includes(letter)) return; 

    // TRAVA IMEDIATA
    isProcessingGuess = true; 
    disableKeyboard(true); // Trava visualmente e logicamente para o humano

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
        
        // --- TOAST DE FEEDBACK DE QUANTIDADE ---
        Swal.fire({
            ...swalCommon,
            title: `Tem ${count} letra${count > 1 ? 's' : ''} ${letter}`,
            icon: 'success',
            toast: true, position: 'bottom', timer: 2000, showConfirmButton: false,
            customClass: { popup: 'game-toast' }
        });

        // --- DELAY AUMENTADO PARA 3s PARA VER A LETRA ---
        setTimeout(() => {
            isProcessingGuess = false; // Destrava lógica interna
            const isSudden = checkSuddenDeathTransition();
            if(!isSudden) {
                const won = checkWinCondition();
                if(!won) {
                    hasSpun = false; 
                    if(isBotGame && currentPlayerIndex === 1) {
                         wheelResultEl.innerText = "Silvio acertou! Ele gira de novo.";
                         botTurnRoutine(); 
                    } else {
                        disableKeyboard(true); sliderCanSpin = true;
                        wheelResultEl.innerText = "Acertou! Gire novamente.";
                    }
                }
            }
        }, 3000); 

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
                isProcessingGuess = false; // Destrava
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
        inputsHtml += `<input id="solve-word-${index}" class="swal2-input fix-swal-input-word" placeholder="PALAVRA ${index+1}" value="${val}" autocomplete="off">`;
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
        // ADICIONADO AQUI: CLASSE 'solve-popup-container'
        customClass: { container: 'solve-popup-container', popup: 'compact-popup' },
        didOpen: () => {
             currentPuzzle.words.forEach((_, index) => {
                 const el = document.getElementById(`solve-word-${index}`);
                 if(el) el.oninput = () => el.value = el.value.toUpperCase();
             });
        },
        preConfirm: () => {
            const answers = [];
            let allFilled = true;
            currentPuzzle.words.forEach((_, index) => {
                const val = document.getElementById(`solve-word-${index}`).value;
                if(!val) allFilled = false;
                answers.push(val.toUpperCase().trim());
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
            timer: 2000, showConfirmButton: false, toast: true, position: 'bottom', customClass: { popup: 'game-toast' }
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
    
    // Identifica vencedor principal (para troféu)
    let winnerIndex = 0;
    if (numPlayers === 2 && players[1].totalScore > players[0].totalScore) winnerIndex = 1;

    if(!win) {
         Swal.fire({ ...swalCommon, title: 'FIM DE JOGO!', icon:'error', html: `Não foi dessa vez.`, confirmButtonText: 'Menu Principal' }).then(() => location.reload());
        return;
    }

    // Constrói HTML da lista de jogadores
    let htmlContent = '<div style="text-align:left; margin-top:10px; display:inline-block;">';
    players.forEach((p, idx) => {
        if(numPlayers === 1 && idx === 1) return; // Pula P2 se for 1 jogador
        
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

// === LÓGICA DO BOT PARA PREENCHER POPUP DE LETRAS ===
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
    
    // Revela as letras escolhidas
    setTimeout(() => {
        revealFinalLetters(botFinalChoice);
    }, 500);

    // Após revelar, decide se ganha ou perde
    setTimeout(() => {
        botFinalGuessLogic();
    }, 6000); 
}

function botFinalGuessLogic() {
    const hiddenCount = document.querySelectorAll('.letter-box.hidden').length;
    let winChance = 0.1; // Padrão: 10%

    if (hiddenCount <= 3) winChance = 0.9;
    else if (hiddenCount === 4) winChance = 0.6;
    else if (hiddenCount === 5) winChance = 0.3;

    const willWin = Math.random() < winChance;
    const secretWord = currentPuzzle.words.join('').toUpperCase();

    if (willWin) {
        // Se for ganhar, mostra digitando
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
        // Se for perder, apenas diz que não sabe
        Swal.fire({
            ...swalCommon, 
            title: 'O SILVIO NÃO SABE!', 
            text: "Ele não conseguiu adivinhar a palavra.", 
            timer: 3000, 
            showConfirmButton: false,
            background: '#800000'
        }).then(() => {
            const revealed = document.querySelectorAll('.letter-box.reveal').length;
            const bonus = revealed * 1000;
            triggerFinalLoss(bonus, secretWord);
        });
    }
}

// === FUNÇÕES DA RODADA FINAL QUE FALTARAM ANTES ===

async function promptFinalLetters() {
    const { value: formValues } = await Swal.fire({
        ...swalCommon,
        title: 'Digite 5 Letras',
        html: `
            <div style="font-size:0.9rem; margin-bottom:5px">4 Consoantes + 1 Vogal:</div>
            <div class="final-inputs-wrapper" style="display:flex; justify-content:center; gap:5px;">
                <input id="c1" class="swal2-input fix-swal-input" maxlength="1" style="text-transform:uppercase;">
                <input id="c2" class="swal2-input fix-swal-input" maxlength="1" style="text-transform:uppercase;">
                <input id="c3" class="swal2-input fix-swal-input" maxlength="1" style="text-transform:uppercase;">
                <input id="c4" class="swal2-input fix-swal-input" maxlength="1" style="text-transform:uppercase;">
                <span style="align-self:center; font-weight:bold">-</span>
                <input id="v1" class="swal2-input fix-swal-input" maxlength="1" style="text-transform:uppercase;">
            </div>
        `,
        backdrop: false,
        customClass: { container: 'final-popup-container', popup: 'final-popup-right' },
        didOpen: () => {
            const inputs = document.querySelectorAll('.fix-swal-input');
            inputs.forEach(input => { input.oninput = () => input.value = input.value.toUpperCase(); });
        },
        preConfirm: () => {
            const inputs = ['c1','c2','c3','c4','v1'].map(id => document.getElementById(id).value.toUpperCase());
            const [c1, c2, c3, c4, v1] = inputs;
            const consonants = [c1, c2, c3, c4];
            if (consonants.some(c => !c || !/[B-DF-HJ-NP-TV-Z]/.test(c))) { Swal.showValidationMessage('4 Consoantes inválidas'); return false; }
            if (!v1 || !/[AEIOU]/.test(v1)) { Swal.showValidationMessage('1 Vogal inválida'); return false; }
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
    
    // Se for humano, espera pra pedir resposta. Se for bot, a lógica é tratada em botFinalRoundLogic
    if(!(isBotGame && currentPlayerIndex === 1)) {
        setTimeout(() => { promptFinalAnswer(); }, delay * (chosenLetters.length + 2));
    }
}

async function promptFinalAnswer() {
    const result = await Swal.fire({
        ...swalCommon, 
        title: 'QUAL A PALAVRA?', input: 'text', inputPlaceholder: 'Digite a resposta', 
        backdrop: false, showDenyButton: true, denyButtonText: 'Não sei',
        customClass: { container: 'final-popup-container', popup: 'final-popup-right compact-popup' },
        didOpen: () => { const input = Swal.getInput(); input.oninput = () => input.value = input.value.toUpperCase(); },
        inputValidator: (value) => { if (!value) return 'Escreva algo!'; }
    });

    if (result.isConfirmed) {
        const userGuess = result.value.toUpperCase().trim().replace(/\s+/g, '');
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
    const finalPrize = (finalistPlayer.totalScore * 2) + bonus;
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
    Swal.fire({
        ...swalCommon, title: 'QUE PENA!', icon: 'error', html: `A palavra era: <b>${secretWord}</b><br>Bônus das letras: R$ ${bonus.toLocaleString('pt-BR')}`, confirmButtonText: 'Jogar Novamente', background: '#800000'
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
            timer: 2500, 
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
                    timer: 2500, showConfirmButton: false
                }).then(() => {
                    handleSolve();
                });
            } else {
                disableKeyboard(false);
                toggleInputLock(false); 
                Swal.fire({
                    ...swalCommon, title: `Valendo R$ ${roundValue}`, text: 'Escolha uma letra!',
                    toast: true, position: 'bottom', timer: 3000, showConfirmButton: false,
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
    Swal.close(); // Fecha qualquer alerta aberto
    // Força a abertura do popup de resposta (mesmo comportamento do botão RESPONDER)
    handleSolve(); 
}

function debugGoFinal() {
    Swal.close(); // Fecha qualquer alerta aberto
    currentRound = maxRounds; // Força última rodada
    // Se quiser dar score pro P1 pra garantir que ele vá
    if(players[0].totalScore === 0) players[0].totalScore = 1000;
    
    startFinalRound(players[0]);
}
