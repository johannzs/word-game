class Confetti {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ff9ff3', '#54a0ff', '#5f27cd'];
        this.gravity = 0.12;
        this.drag = 0.985;
        this.terminalVelocity = 2.5;
        this.running = true;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.launchConfetti();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticle(x, y, velocityX, velocityY) {
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const size = Math.random() * 10 + 5;
        
        return {
            x: x,
            y: y,
            width: size,
            height: size * 0.6,
            color: color,
            velocityX: velocityX,
            velocityY: velocityY,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            oscillationSpeed: Math.random() * 0.5 + 0.5,
            oscillationDistance: Math.random() * 40 + 20,
            oscillationPhase: Math.random() * Math.PI * 2,
            time: 0,
            opacity: 1,
            shape: Math.random() > 0.5 ? 'rect' : 'circle'
        };
    }
    
    launchConfetti() {
        const centerX = this.canvas.width / 2;
        const bottomY = this.canvas.height;
        
        for (let i = 0; i < 150; i++) {
            setTimeout(() => {
                const angle = (Math.random() * 60 + 60) * (Math.PI / 180);
                const velocity = Math.random() * 15 + 10;
                const side = Math.random() > 0.5 ? 1 : -1;
                
                const velocityX = Math.cos(angle) * velocity * side;
                const velocityY = -Math.sin(angle) * velocity;
                
                const startX = centerX + (Math.random() - 0.5) * 200;
                const startY = bottomY + 50;
                
                this.particles.push(this.createParticle(startX, startY, velocityX, velocityY));
            }, i * 10);
        }
        
        setTimeout(() => this.launchBurst(), 500);
        setTimeout(() => this.launchBurst(), 1500);
        setTimeout(() => this.launchBurst(), 3000);
    }
    
    launchBurst() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 3;
        
        for (let i = 0; i < 80; i++) {
            const angle = (Math.random() * 360) * (Math.PI / 180);
            const velocity = Math.random() * 8 + 4;
            
            const velocityX = Math.cos(angle) * velocity;
            const velocityY = Math.sin(angle) * velocity - 3;
            
            const startX = centerX + (Math.random() - 0.5) * 100;
            const startY = centerY + (Math.random() - 0.5) * 100;
            
            this.particles.push(this.createParticle(startX, startY, velocityX, velocityY));
        }
    }
    
    updateParticle(particle, deltaTime) {
        particle.time += deltaTime;
        
        particle.velocityY += this.gravity;
        
        particle.velocityX *= this.drag;
        particle.velocityY *= this.drag;
        
        if (particle.velocityY > this.terminalVelocity) {
            particle.velocityY = this.terminalVelocity;
        }
        
        const oscillation = Math.sin(particle.time * particle.oscillationSpeed + particle.oscillationPhase) * particle.oscillationDistance * 0.02;
        particle.x += particle.velocityX + oscillation;
        particle.y += particle.velocityY;
        
        particle.rotation += particle.rotationSpeed;
        
        if (particle.y > this.canvas.height + 50) {
            particle.opacity -= 0.02;
        }
        
        return particle.opacity > 0;
    }
    
    drawParticle(particle) {
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation * Math.PI / 180);
        this.ctx.globalAlpha = particle.opacity;
        this.ctx.fillStyle = particle.color;
        
        if (particle.shape === 'rect') {
            this.ctx.fillRect(-particle.width / 2, -particle.height / 2, particle.width, particle.height);
        } else {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, particle.width / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    animate() {
        if (!this.running) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles = this.particles.filter(particle => {
            const alive = this.updateParticle(particle, 0.016);
            if (alive) {
                this.drawParticle(particle);
            }
            return alive;
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('confettiCanvas');
    new Confetti(canvas);
});
