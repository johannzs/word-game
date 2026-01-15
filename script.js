class WordGame {
    constructor() {
        this.wordLists = [];
        this.currentList = [];
        this.currentWordIndex = 0;
        this.currentHintIndex = 0;
        this.remainingWords = [];
        this.foundCount = 0;
        this.passedCount = 0;
        this.maxPasses = 5;
        this.wordsToFind = 5;
        this.lives = 3;
        this.unicornState = 0;
        this.timer = 30;
        this.timerInterval = null;
        this.gameActive = false;
        
        this.initializeTitleScreen();
        this.loadWords();
    }
    
    initializeTitleScreen() {
        this.titleScreen = document.getElementById('titleScreen');
        this.gameContainer = document.getElementById('gameContainer');
        
        const startBtn = document.getElementById('startGameBtn');
        startBtn.addEventListener('click', () => this.showGame());
    }
    
    showGame() {
        this.titleScreen.style.display = 'none';
        this.gameContainer.style.display = 'block';
        this.initializeElements();
        this.bindEvents();
        this.startNewGame();
    }
    
    async loadWords() {
        try {
            const response = await fetch('words.json');
            const data = await response.json();
            this.wordLists = data.wordLists;
        } catch (error) {
            console.error('Erreur de chargement des mots:', error);
        }
    }
    
    initializeElements() {
        this.elements = {
            currentHint: document.getElementById('currentHint'),
            hintCounter: document.getElementById('hintCounter'),
            changeHintBtn: document.getElementById('changeHintBtn'),
            wordInput: document.getElementById('wordInput'),
            validateBtn: document.getElementById('validateBtn'),
            passBtn: document.getElementById('passBtn'),
            message: document.getElementById('message'),
            hearts: document.getElementById('hearts'),
            timer: document.getElementById('timer'),
            characterState: document.getElementById('characterState'),
            foundCount: document.getElementById('foundCount'),
            gameOverModal: document.getElementById('gameOverModal'),
            gameOverTitle: document.getElementById('gameOverTitle'),
            gameOverMessage: document.getElementById('gameOverMessage'),
            restartBtn: document.getElementById('restartBtn')
        };
    }
    
    bindEvents() {
        this.elements.validateBtn.addEventListener('click', () => this.validateWord());
        this.elements.passBtn.addEventListener('click', () => this.passWord());
        this.elements.changeHintBtn.addEventListener('click', () => this.changeHint());
        this.elements.wordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.validateWord();
            }
        });
        this.elements.restartBtn.addEventListener('click', () => this.startNewGame());
    }
    
    startNewGame() {
        this.gameActive = true;
        this.lives = 3;
        this.unicornState = 0;
        this.timer = 30;
        this.foundCount = 0;
        this.passedCount = 0;
        
        this.selectRandomList();
        this.updateDisplay();
        this.updateLives();
        this.updateUnicorn();
        this.updatePassButton();
        this.startTimer();
        this.hideGameOver();
        this.clearMessage();
    }
    
    selectRandomList() {
        const randomIndex = Math.floor(Math.random() * this.wordLists.length);
        const selectedList = this.wordLists[randomIndex];
        this.currentList = [...selectedList.words];
        this.remainingWords = [...this.currentList];
        this.currentWordIndex = 0;
        this.currentHintIndex = 0;
        this.shuffleArray(this.remainingWords);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            this.timer--;
            this.elements.timer.textContent = this.timer;
            
            if (this.timer <= 0) {
                this.loseLife('Temps écoulé !');
                this.resetTimer();
            }
        }, 1000);
    }
    
    resetTimer() {
        this.timer = 30;
        this.elements.timer.textContent = this.timer;
    }
    
    changeHint() {
        if (!this.gameActive || this.remainingWords.length === 0) return;
        
        const currentWordObj = this.remainingWords[this.currentWordIndex];
        const totalHints = currentWordObj.hints.length;
        
        this.currentHintIndex = (this.currentHintIndex + 1) % totalHints;
        this.updateHintDisplay();
    }
    
    updateHintDisplay() {
        if (this.remainingWords.length === 0) return;
        
        const currentWordObj = this.remainingWords[this.currentWordIndex];
        const hint = currentWordObj.hints[this.currentHintIndex];
        const totalHints = currentWordObj.hints.length;
        
        this.elements.currentHint.textContent = hint;
        this.elements.hintCounter.textContent = `Indice ${this.currentHintIndex + 1}/${totalHints}`;
    }
    
    validateWord() {
        if (!this.gameActive) return;
        
        const input = this.elements.wordInput.value.trim().toLowerCase();
        this.elements.wordInput.value = '';
        
        if (!input) {
            this.showMessage('Veuillez entrer un mot', 'info');
            return;
        }
        
        const currentWordObj = this.remainingWords[this.currentWordIndex];
        
        if (input === currentWordObj.word) {
            this.handleCorrectWord();
        } else {
            this.handleWrongWord();
        }
    }
    
    handleCorrectWord() {
        const foundWord = this.remainingWords[this.currentWordIndex].word;
        this.showMessage(`Correct ! Le mot était "${foundWord}" 🎉`, 'success');
        this.remainingWords.splice(this.currentWordIndex, 1);
        this.foundCount++;
        this.resetTimer();
        this.currentHintIndex = 0;
        
        if (this.foundCount >= this.wordsToFind) {
            this.winGame();
            return;
        }
        
        if (this.remainingWords.length === 0) {
            this.loseGame();
            return;
        }
        
        if (this.currentWordIndex >= this.remainingWords.length) {
            this.currentWordIndex = 0;
        }
        
        this.updateDisplay();
    }
    
    handleWrongWord() {
        this.loseLife('Mauvais mot ! ❌');
    }
    
    passWord() {
        if (!this.gameActive || this.remainingWords.length === 0) return;
        if (this.passedCount >= this.maxPasses) {
            this.showMessage('Plus de passes disponibles !', 'error');
            return;
        }
        
        this.remainingWords.splice(this.currentWordIndex, 1);
        this.passedCount++;
        
        this.showMessage(`Mot passé (${this.passedCount}/${this.maxPasses})`, 'info');
        this.resetTimer();
        this.currentHintIndex = 0;
        this.updatePassButton();
        
        if (this.remainingWords.length === 0) {
            this.loseGame();
            return;
        }
        
        if (this.currentWordIndex >= this.remainingWords.length) {
            this.currentWordIndex = 0;
        }
        
        this.updateDisplay();
    }
    
    updatePassButton() {
        const remaining = this.maxPasses - this.passedCount;
        this.elements.passBtn.textContent = `PASSER (${remaining})`;
        if (remaining <= 0) {
            this.elements.passBtn.disabled = true;
        } else {
            this.elements.passBtn.disabled = false;
        }
    }
    
    loseLife(reason) {
        this.lives--;
        this.unicornState++;
        this.showMessage(reason, 'error');
        this.updateLives();
        this.updateUnicorn();
        this.resetTimer();
        
        if (this.lives <= 0) {
            this.loseGame();
        }
    }
    
    updateUnicorn() {
        this.elements.characterState.innerHTML = this.getUnicornHTML(this.unicornState);
    }
    
    getUnicornHTML(state) {
        const baseClass = `unicorn-container state-${state}`;
        return `<div class="${baseClass}"></div>`;
    }
    
    updateDisplay() {
        if (this.remainingWords.length > 0) {
            this.updateHintDisplay();
        } else {
            this.elements.currentHint.textContent = 'FINI';
            this.elements.hintCounter.textContent = '';
        }
        
        this.elements.foundCount.textContent = this.foundCount;
    }
    
    updateLives() {
        const hearts = this.elements.hearts.querySelectorAll('.heart');
        hearts.forEach((heart, index) => {
            if (index >= this.lives) {
                heart.classList.add('lost');
            } else {
                heart.classList.remove('lost');
            }
        });
    }
    
    showMessage(text, type) {
        this.elements.message.textContent = text;
        this.elements.message.className = `message ${type}`;
        
        setTimeout(() => {
            this.clearMessage();
        }, 3000);
    }
    
    clearMessage() {
        this.elements.message.textContent = '';
        this.elements.message.className = 'message';
    }
    
    winGame() {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        
        this.elements.gameOverTitle.textContent = '🦄 Victoire !';
        this.elements.gameOverMessage.textContent = `Félicitations ! Vous avez trouvé ${this.wordsToFind} mots et sauvé la licorne !`;
        this.showGameOver();
    }
    
    loseGame() {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        this.unicornState = 5;
        this.updateUnicorn();
        
        this.elements.gameOverTitle.textContent = '💔 Défaite !';
        this.elements.gameOverMessage.textContent = 'La licorne s\'est décomposée... Réessayez !';
        this.showGameOver();
    }
    
    showGameOver() {
        this.elements.gameOverModal.classList.add('show');
    }
    
    hideGameOver() {
        this.elements.gameOverModal.classList.remove('show');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WordGame();
});
