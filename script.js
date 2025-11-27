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

let isMuted = false;
const btnMute = document.getElementById('btn-mute-global');

let currentPuzzle = {}; 
let guessedLetters = [];
let wrongLetters = [];
let currentRotation = 0;
let numPlayers = 1;
let currentPlayerIndex = 0;
let players = [ { name: "Jogador 1", roundScore: 0, totalScore: 0 }, { name: "Jogador 2", roundScore: 0, totalScore: 0 } ];
let currentRound = 1;
const maxRounds = 3;
let roundValue = 0;
let hasSpun = false;
let spMisses = 0;
const spMaxMisses = 3;
let isFinalRound = false;
let isTieBreaker = false;
let tieBreakerState = { p1Val: 0, p2Val: 0, turns: 0 };
let finalistPlayer = null;

// ELEMENTOS DOM
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const btn1Player = document.getElementById('btn-1-player');
const btn2Players = document.getElementById('btn-2-players');
const boardEl = document.getElementById('puzzle-board');
const categoryEl = document.getElementById('category-text');
const inputEl = document.getElementById('letter-input');
const btnGuess = document.getElementById('btn-guess');
const btnSolve = document.getElementById('btn-solve');
const wrongLettersEl = document.getElementById('wrong-letters-list');
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
    if (!sliderCanSpin || inputEl.disabled === false) return; 
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
        // Correção de erro de Audio (Try/Catch)
        audioFx[key].play().catch(e => console.warn("Audio play blocked", e));
    }
}
btnMute.addEventListener('click', toggleMute);

btn1Player.addEventListener('click', () => prepareGame(1));
btn2Players.addEventListener('click', () => prepareGame(2));

inputEl.addEventListener('input', function() {
    this.value = this.value.toUpperCase();
});

async function prepareGame(mode) {
    numPlayers = mode;
    let p1Name = "JOGADOR 1";
    let p2Name = "JOGADOR 2";

    const { value: name1 } = await Swal.fire({ 
        ...swalCommon, title: 'Jogador 1', input: 'text', inputPlaceholder: 'Nome',
        didOpen: () => { const i = Swal.getInput(); i.oninput = () => i.value = i.value.toUpperCase(); }
    });
    if (name1) p1Name = name1.toUpperCase().substring(0, 10);

    if (numPlayers === 2) {
        const { value: name2 } = await Swal.fire({ 
            ...swalCommon, title: 'Jogador 2', input: 'text', inputPlaceholder: 'Nome',
            didOpen: () => { const i = Swal.getInput(); i.oninput = () => i.value = i.value.toUpperCase(); }
        });
        if (name2) p2Name = name2.toUpperCase().substring(0, 10);
    }

    players[0] = { name: p1Name, roundScore: 0, totalScore: 0 };
    players[1] = { name: p2Name, roundScore: 0, totalScore: 0 };
    currentPlayerIndex = 0; currentRound = 1; isFinalRound = false; isTieBreaker = false;

    p1NameEl.innerText = players[0].name;
    p2NameEl.innerText = players[1].name;

    if (numPlayers === 1) {
        p2Card.style.display = 'none'; spLivesContainer.style.display = 'block';
    } else {
        p2Card.style.display = 'block'; spLivesContainer.style.display = 'none';
    }

    startScreen.classList.remove('active-screen'); startScreen.classList.add('hidden-screen');
    gameScreen.classList.remove('hidden-screen'); gameScreen.classList.add('active-screen');
    
    drawWheel(); // Garante que a roleta seja desenhada
    startRound();
}

function generatePuzzle(forceSingle = false) {
    const categories = Object.keys(wordDatabase);
    const cat = categories[Math.floor(Math.random() * categories.length)];
    let count = forceSingle ? 1 : Math.floor(Math.random() * 3) + 1;
    const pool = [...wordDatabase[cat]]; 
    const selectedWords = [];
    
    for(let i=0; i<count; i++) {
        if(pool.length === 0) break;
        const randomIndex = Math.floor(Math.random() * pool.length);
        selectedWords.push(pool[randomIndex]);
        pool.splice(randomIndex, 1);
    }
    return { category: cat, words: selectedWords };
}

function startRound() {
    currentPuzzle = generatePuzzle(false);
    guessedLetters = []; wrongLetters = [];
    players[0].roundScore = 0; players[1].roundScore = 0;
    spMisses = 0;
    
    if (numPlayers === 1) updateLivesUI();

    roundValue = 0; hasSpun = false;
    updateScoreUI();
    categoryEl.innerText = currentPuzzle.category;
    btnSolve.style.display = 'none';
    
    let msg = numPlayers === 1 ? "Sua vez!" : `Vez de ${players[currentPlayerIndex].name}.`;
    wheelResultEl.innerText = msg;

    setupBoard(); updateWrongLetters();
    disableInput(true); 
    sliderCanSpin = true; 
    inputEl.value = '';
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

function disableInput(disabled) {
    inputEl.disabled = disabled; btnGuess.disabled = disabled;
    if (!disabled && window.innerWidth > 768) inputEl.focus();
}

function switchTurn() {
    if (numPlayers === 1) return; 
    currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
    updateScoreUI(); hasSpun = false; disableInput(true); sliderCanSpin = true; roundValue = 0;
    
    Swal.fire({
        ...swalCommon,
        title: `VEZ DE ${players[currentPlayerIndex].name}`,
        timer: 2200, showConfirmButton: false, toast: true, position: 'bottom',
        background: '#003399',
        customClass: { popup: 'game-toast' }
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

function revealLetters(letter) {
    const targets = document.querySelectorAll(`.letter-box.hidden[data-letter="${letter}"]`);
    if (targets.length > 0) playSound('correct');
    targets.forEach(el => { el.classList.remove('hidden'); el.classList.add('reveal'); el.innerText = letter; });
    checkWinCondition();
}

function checkEmptySlots() {
    if (isFinalRound) return;
    const hidden = document.querySelectorAll('.letter-box.hidden');
    const count = hidden.length;
    if (count > 0 && count <= 3) btnSolve.style.display = 'inline-block';
    else btnSolve.style.display = 'none';
}

function updateWrongLetters() {
    wrongLettersEl.innerHTML = '';
    wrongLetters.forEach((letter, index) => {
        const span = document.createElement('span');
        span.classList.add('wrong-letter-item');
        span.innerText = letter;
        wrongLettersEl.appendChild(span);
        
        if (index < wrongLetters.length - 1) {
            const sep = document.createElement('span');
            sep.classList.add('separator');
            sep.innerText = '-';
            wrongLettersEl.appendChild(sep);
        }
    });
}

function handleGuess() {
    if (!hasSpun) { 
        Swal.fire({
            ...swalCommon, title:'Puxe a alavanca!', icon:'warning',
            timer: 2000, showConfirmButton: false, toast: true, position: 'bottom',
            customClass: { popup: 'game-toast' }
        }); 
        return; 
    }

    let letter = inputEl.value.toUpperCase().trim();
    if (!letter || !/[A-Z]/.test(letter)) { inputEl.focus(); return; }
    
    if (guessedLetters.includes(letter) || wrongLetters.includes(letter)) {
        Swal.fire({ 
            toast:true, title:'Letra repetida', icon:'info', timer:2500, position:'bottom', 
            showConfirmButton:false, background: '#002266', color: '#fff',
            customClass: { popup: 'game-toast' }
        });
        inputEl.value = ''; return;
    }

    inputEl.value = ''; guessedLetters.push(letter);

    const allWordsString = currentPuzzle.words.join('');
    
    if (allWordsString.includes(letter)) {
        const count = allWordsString.split(letter).length - 1;
        const earned = roundValue * count;
        players[currentPlayerIndex].roundScore += earned;
        updateScoreUI(); revealLetters(letter); checkEmptySlots();
        
        hasSpun = false; disableInput(true); sliderCanSpin = true;
        wheelResultEl.innerText = "Acertou! Gire novamente.";
    } else {
        playSound('wrong');
        wrongLetters.push(letter);
        updateWrongLetters();
        
        if (numPlayers === 1) {
            spMisses++;
            updateLivesUI();
            if (spMisses >= spMaxMisses) { 
                disableInput(true); 
                sliderCanSpin = false;
                Swal.fire({
                    ...swalCommon, icon: 'error', title: 'PERDEU!', text: 'Suas chances acabaram.',
                    background: '#800000',
                    timer: 3000, showConfirmButton: false, toast: true, position: 'bottom',
                    customClass: { popup: 'game-toast' }
                }).then(() => {
                    players[0].roundScore = 0;
                    updateScoreUI();
                    advanceRound();
                });
                return;
            }
        }
        
        Swal.fire({
            icon: 'error', title: 'Não tem!', timer: 2500, showConfirmButton: false,
            toast: true, position: 'bottom', background: '#b30000', color: '#fff',
            customClass: { popup: 'game-toast' }
        }).then(() => {
            if (numPlayers === 2) switchTurn();
            else { hasSpun = false; disableInput(true); sliderCanSpin = true; wheelResultEl.innerText = "Tente novamente."; }
        });
    }
}

async function handleSolve() {
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
        customClass: {
            container: 'final-popup-container',
            popup: 'final-popup-right compact-popup'
        },
        backdrop: false,
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
            
            if(!allFilled) {
                Swal.showValidationMessage('Preencha todas as palavras!');
                return false;
            }
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
                if(userAnswers[i] !== correctAnswers[i]) {
                    allCorrect = false; break;
                }
            }
        }

        if (allCorrect) {
            const allText = currentPuzzle.words.join('');
            const allLetters = allText.split('').filter(l => l !== ' ');
            allLetters.forEach(l => { if(!guessedLetters.includes(l)) { guessedLetters.push(l); revealLetters(l); } });
        } else {
            playSound('wrong');
            Swal.fire({ 
                ...swalCommon, icon: 'error', title: 'ERRADO!', text: `Resposta incorreta.`, background: '#800000',
                timer: 3000, showConfirmButton: false, toast: true, position: 'bottom',
                customClass: { popup: 'game-toast' }
            })
            .then(() => {
                players[currentPlayerIndex].roundScore = 0; updateScoreUI();
                if (numPlayers === 2) switchTurn();
                else Swal.fire({
                    ...swalCommon, title: 'Perdeu a rodada.', icon: 'error',
                    timer: 2000, showConfirmButton: false, toast: true, position: 'bottom',
                    customClass: { popup: 'game-toast' }
                }).then(() => advanceRound());
            });
        }
    }
}

function checkWinCondition() {
    if (isFinalRound) return;
    const allText = currentPuzzle.words.join('');
    const uniqueLetters = [...new Set(allText.split(''))];
    const allGuessed = uniqueLetters.every(l => guessedLetters.includes(l));

    if (allGuessed) {
        playSound('win');
        players[currentPlayerIndex].totalScore += players[currentPlayerIndex].roundScore;
        updateScoreUI();

        setTimeout(() => {
            Swal.fire({
                ...swalCommon, title: 'RODADA VENCIDA!',
                html: `Ganhou: R$ ${players[currentPlayerIndex].roundScore.toLocaleString('pt-BR')}`,
                icon: 'success', confirmButtonText: 'Próxima',
                customClass: { popup: 'game-toast' }
            }).then(() => advanceRound());
        }, 1000);
    }
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
    Swal.fire({ 
        ...swalCommon, title: 'EMPATE!', text: 'Quem tirar o maior valor vence.',
        customClass: { popup: 'game-toast' }
    })
    .then(() => { updateScoreUI(); wheelResultEl.innerText = `${players[0].name}, gire!`; sliderCanSpin = true; });
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
            updateScoreUI(); wheelResultEl.innerText = `${players[1].name}, sua vez!`; sliderCanSpin = true;
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

function finishGame() {
    playSound('win');
    let winner = players[0];
    if (numPlayers === 2 && players[1].totalScore > players[0].totalScore) winner = players[1];

    Swal.fire({
        ...swalCommon, title: 'FIM DE JOGO!',
        html: `Vencedor: ${winner.name}<br>Total: R$ ${winner.totalScore.toLocaleString('pt-BR')}`,
        icon: 'info', confirmButtonText: 'Menu Principal'
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
    setupBoard(); updateWrongLetters();
    
    sliderCanSpin = false; 
    inputEl.style.display = 'none'; btnGuess.style.display = 'none'; btnSolve.style.display = 'none';
    wheelResultEl.innerText = "RODADA FINAL! Valendo o Dobro!";
    
    await Swal.fire({ ...swalCommon, title: 'FINAL!', html: `Parabéns <b>${winner.name}</b>!<br>Escolha <b>4 Consoantes</b> e <b>1 Vogal</b>.` });
    
    promptFinalLetters();
}

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
                if(!guessedLetters.includes(letter)) { guessedLetters.push(letter); revealLetters(letter); }
            }
        }, delay * (index + 1));
    });
    setTimeout(() => { promptFinalAnswer(); }, delay * (chosenLetters.length + 2));
}

async function promptFinalAnswer() {
    const result = await Swal.fire({
        ...swalCommon, 
        title: 'QUAL A PALAVRA?', input: 'text',
        inputPlaceholder: 'Digite a resposta', 
        backdrop: false, 
        showDenyButton: true, denyButtonText: 'Não sei',
        customClass: { container: 'final-popup-container', popup: 'final-popup-right' },
        didOpen: () => {
             const input = Swal.getInput();
             input.oninput = () => input.value = input.value.toUpperCase();
        },
        inputValidator: (value) => { if (!value) return 'Escreva algo!'; }
    });

    if (result.isConfirmed) {
        const userGuess = result.value.toUpperCase().trim().replace(/\s+/g, '');
        const secretWord = currentPuzzle.words.join('').toUpperCase();
        
        const allText = currentPuzzle.words.join('');
        const allLetters = allText.split('').filter(l => l !== ' ');
        allLetters.forEach(l => {
             const targets = document.querySelectorAll(`.letter-box.hidden[data-letter="${l}"]`);
             targets.forEach(el => { el.classList.remove('hidden'); el.innerText = l; });
        });

        const revealed = document.querySelectorAll('.letter-box.reveal').length;
        const bonus = revealed * 1000;

        if (userGuess === secretWord) {
            playSound('win');
            const finalPrize = (finalistPlayer.totalScore * 2) + bonus;
            Swal.fire({
                ...swalCommon, title: 'PARABÉNS!',
                html: `Palavra: <b>${secretWord}</b><br>Prêmio: <h1 style="color:gold;">R$ ${finalPrize.toLocaleString('pt-BR')}</h1>`,
                confirmButtonText: 'Jogar Novamente'
            }).then(() => location.reload());
        } else triggerFinalLoss(bonus, secretWord);
    } else if (result.isDenied) {
        const revealed = document.querySelectorAll('.letter-box.reveal').length;
        const bonus = revealed * 1000;
        const secretWord = currentPuzzle.words.join('').toUpperCase();
        triggerFinalLoss(bonus, secretWord);
    }
}

function triggerFinalLoss(bonus, secretWord) {
    playSound('wrong');
    const allLetters = secretWord.split('').filter(l => l !== ' ');
    allLetters.forEach(l => {
         const targets = document.querySelectorAll(`.letter-box.hidden[data-letter="${l}"]`);
         targets.forEach(el => { el.classList.remove('hidden'); el.innerText = l; });
    });

    Swal.fire({
        ...swalCommon, title: 'QUE PENA!', icon: 'error',
        html: `A palavra era: <b>${secretWord}</b><br>Bônus das letras: R$ ${bonus.toLocaleString('pt-BR')}`,
        confirmButtonText: 'Jogar Novamente', background: '#800000'
    }).then(() => location.reload());
}

function spinWheel(power = 0.5) {
    sliderCanSpin = false;
    disableInput(true);
    
    // Alerta de Girando - Bottom
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
        Swal.fire({
            ...swalCommon, icon: 'error', title: resultSlot.label.replace('<br>',' '), 
            timer: 2500, showConfirmButton: false, backdrop: false, position: 'bottom', background: '#800000',
            customClass: { popup: 'game-toast' }
        }).then(() => {
            if(resultSlot.type === 'bankruptcy') { players[currentPlayerIndex].roundScore = 0; updateScoreUI(); }
            if (numPlayers === 2) switchTurn();
            else { 
                hasSpun = false; 
                // CORREÇÃO CRÍTICA: Removido btnSpin
                sliderCanSpin = true; 
                wheelResultEl.innerText = "Gire novamente."; 
            }
        });
    } else {
        roundValue = resultSlot.value;
        hasSpun = true; disableInput(false);
        
        // Alerta de Valor - Bottom
        Swal.fire({
            ...swalCommon, title: `Valendo R$ ${roundValue}`, text: 'Escolha uma letra!',
            toast: true, position: 'bottom', timer: 3000, showConfirmButton: false,
            customClass: { popup: 'game-toast' }
        });
        wheelResultEl.innerText = `Valendo R$ ${roundValue}. Chute uma letra!`;
    }
}

inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleGuess(); });
btnGuess.addEventListener('click', handleGuess);
btnSolve.addEventListener('click', handleSolve);
document.getElementById('btn-exit').addEventListener('click', () => {
    Swal.fire({ ...swalCommon, title: 'Sair?', showCancelButton: true, confirmButtonText: 'Sim', cancelButtonText: 'Não' })
    .then((r) => { if (r.isConfirmed) location.reload(); });
});
