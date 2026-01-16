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
        this.missingShards = [];
        
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
            bubbleTimer: document.querySelector('.bubble-timer'),
            characterState: document.getElementById('characterState'),
            foundCount: document.getElementById('foundCount'),
            gameOverModal: document.getElementById('gameOverModal'),
            gameOverTitle: document.getElementById('gameOverTitle'),
            gameOverMessage: document.getElementById('gameOverMessage'),
            restartBtn: document.getElementById('restartBtn'),
            toast: document.getElementById('toast'),
            inputBox: document.querySelector('.input-box')
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
        this.missingShards = [];
        
        
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
                this.showBubbleResult('Mauvaise réponse', 'error');
                this.loseLife();
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
            this.showToast('Veuillez entrer un mot', 'error');
            this.shakeInput();
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
        this.showBubbleResult('Bonne réponse', 'success');
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
        this.showBubbleResult('Mauvaise réponse', 'error');
        this.loseLife();
    }
    
    passWord() {
        if (!this.gameActive || this.remainingWords.length === 0) return;
        if (this.passedCount >= this.maxPasses) {
            this.showToast('Plus de passes disponibles !', 'error');
            return;
        }
        
        this.remainingWords.splice(this.currentWordIndex, 1);
        this.passedCount++;
        
        const remaining = this.maxPasses - this.passedCount;
        if (remaining > 0) {
            this.showToast('Mot passé', 'info');
        }
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
            this.showToast('Plus de passes disponibles !', 'error');
        } else {
            this.elements.passBtn.disabled = false;
        }
    }
    
    loseLife() {
        this.lives--;
        this.unicornState++;
        this.updateLives();
        this.triggerShatterEffect();
        this.resetTimer();
        
        if (this.lives <= 0) {
            this.loseGame();
        }
    }
    
    showBubbleResult(text, type) {
        this.elements.bubbleTimer.textContent = text;
        this.elements.bubbleTimer.className = `bubble-timer bubble-${type}`;
        
        setTimeout(() => {
            this.elements.bubbleTimer.innerHTML = `il te reste <span id="timer">${this.timer}</span> sec`;
            this.elements.bubbleTimer.className = 'bubble-timer';
            this.elements.timer = document.getElementById('timer');
        }, 1500);
    }
    
    updateUnicorn() {
        this.elements.characterState.innerHTML = this.getUnicornHTML();
        this.drawUnicornCanvas();
    }
    
    getUnicornHTML() {
        return `<div class="unicorn-container state-0"><canvas id="unicornCanvas" width="120" height="120"></canvas></div>`;
    }
    
    drawUnicornCanvas() {
        const canvas = document.getElementById('unicornCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const gridSize = 4;
        const canvasSize = 120;
        const shardWidth = canvasSize / gridSize;
        const shardHeight = canvasSize / gridSize;
        
        if (!this.unicornImage) {
            this.unicornImage = new Image();
            this.unicornImage.src = 'images/licorne-pixel.png';
            this.unicornImage.onload = () => this.drawUnicornCanvas();
            return;
        }
        
        if (!this.unicornImage.complete) return;
        
        const imgWidth = this.unicornImage.naturalWidth;
        const imgHeight = this.unicornImage.naturalHeight;
        const srcShardWidth = imgWidth / gridSize;
        const srcShardHeight = imgHeight / gridSize;
        
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const isMissing = this.missingShards.some(s => s.row === row && s.col === col);
                if (!isMissing) {
                    const srcX = col * srcShardWidth;
                    const srcY = row * srcShardHeight;
                    const destX = col * shardWidth;
                    const destY = row * shardHeight;
                    ctx.drawImage(
                        this.unicornImage,
                        srcX, srcY, srcShardWidth, srcShardHeight,
                        destX, destY, shardWidth, shardHeight
                    );
                }
            }
        }
    }
    
    triggerShatterEffect() {
        const container = this.elements.characterState.querySelector('.unicorn-container');
        if (!container) return;
        
        container.classList.add('cracked');
        
        const shatterContainer = document.createElement('div');
        shatterContainer.className = 'shatter-container';
        container.appendChild(shatterContainer);
        
        const gridSize = 4;
        const shardWidth = 120 / gridSize;
        const shardHeight = 120 / gridSize;
        
        const shardsToRemove = 4 + this.unicornState;
        const availablePositions = [];
        
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const alreadyMissing = this.missingShards.some(s => s.row === row && s.col === col);
                if (!alreadyMissing) {
                    availablePositions.push({ row, col });
                }
            }
        }
        
        for (let i = availablePositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
        }
        
        const selectedPositions = availablePositions.slice(0, Math.min(shardsToRemove, availablePositions.length));
        
        selectedPositions.forEach(pos => {
            this.missingShards.push(pos);
        });
        
        this.drawUnicornCanvas();
        
        selectedPositions.forEach((pos, index) => {
            const shard = document.createElement('div');
            shard.className = 'shard';
            
            const x = pos.col * shardWidth;
            const y = pos.row * shardHeight;
            
            shard.style.width = `${shardWidth}px`;
            shard.style.height = `${shardHeight}px`;
            shard.style.left = `${x}px`;
            shard.style.top = `${y}px`;
            shard.style.backgroundSize = '120px 120px';
            shard.style.backgroundPosition = `-${x}px -${y}px`;
            
            const fallX = (Math.random() - 0.5) * 100;
            const fallY = 50 + Math.random() * 80;
            const fallRotate = (Math.random() - 0.5) * 180;
            
            shard.style.setProperty('--fall-x', `${fallX}px`);
            shard.style.setProperty('--fall-y', `${fallY}px`);
            shard.style.setProperty('--fall-rotate', `${fallRotate}deg`);
            
            shatterContainer.appendChild(shard);
            
            setTimeout(() => {
                shard.classList.add('falling');
            }, index * 30);
        });
        
        setTimeout(() => {
            shatterContainer.remove();
            container.classList.remove('cracked');
        }, 1000);
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
    
    showToast(text, type) {
        this.elements.toast.innerHTML = `<div class="toast-progress"></div><span>${text}</span>`;
        this.elements.toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            this.elements.toast.className = 'toast';
        }, 2500);
    }
    
    shakeInput() {
        this.elements.inputBox.classList.add('shake');
        setTimeout(() => {
            this.elements.inputBox.classList.remove('shake');
        }, 500);
    }
    
    winGame() {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        
        window.location.href = 'victory.html';
    }
    
    loseGame() {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        this.triggerFinalShatter();
        
        this.elements.gameOverTitle.textContent = '💔 Défaite !';
        this.elements.gameOverMessage.textContent = 'La licorne s\'est décomposée... Réessayez !';
        setTimeout(() => this.showGameOver(), 1000);
    }
    
    triggerFinalShatter() {
        const container = this.elements.characterState.querySelector('.unicorn-container');
        if (!container) return;
        
        const shatterContainer = document.createElement('div');
        shatterContainer.className = 'shatter-container';
        container.appendChild(shatterContainer);
        
        const gridSize = 4;
        const shardWidth = 120 / gridSize;
        const shardHeight = 120 / gridSize;
        
        const remainingPositions = [];
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const alreadyMissing = this.missingShards.some(s => s.row === row && s.col === col);
                if (!alreadyMissing) {
                    remainingPositions.push({ row, col });
                }
            }
        }
        
        remainingPositions.forEach(pos => {
            this.missingShards.push(pos);
        });
        
        this.drawUnicornCanvas();
        
        remainingPositions.forEach((pos, index) => {
            const shard = document.createElement('div');
            shard.className = 'shard';
            
            const x = pos.col * shardWidth;
            const y = pos.row * shardHeight;
            
            shard.style.width = `${shardWidth}px`;
            shard.style.height = `${shardHeight}px`;
            shard.style.left = `${x}px`;
            shard.style.top = `${y}px`;
            shard.style.backgroundSize = '120px 120px';
            shard.style.backgroundPosition = `-${x}px -${y}px`;
            
            const fallX = (Math.random() - 0.5) * 150;
            const fallY = 80 + Math.random() * 100;
            const fallRotate = (Math.random() - 0.5) * 360;
            
            shard.style.setProperty('--fall-x', `${fallX}px`);
            shard.style.setProperty('--fall-y', `${fallY}px`);
            shard.style.setProperty('--fall-rotate', `${fallRotate}deg`);
            
            shatterContainer.appendChild(shard);
            
            setTimeout(() => {
                shard.classList.add('falling');
            }, index * 20);
        });
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
