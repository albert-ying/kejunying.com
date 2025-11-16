// Minimal Animation System + Particle Effects for Kejun Ying's Website
// Does not interfere with layout positioning

document.addEventListener('DOMContentLoaded', function() {
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        return; // Exit if user prefers reduced motion
    }

    // ==================== PARTICLE EFFECT SYSTEM ====================
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = -100;
    let mouseY = -100;
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Mouse interaction
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 150) {
                const angle = Math.atan2(dy, dx);
                const force = (150 - dist) / 150;
                this.vx -= Math.cos(angle) * force * 0.2;
                this.vy -= Math.sin(angle) * force * 0.2;
            }
            
            // Boundaries
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            
            // Damping
            this.vx *= 0.99;
            this.vy *= 0.99;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            // Use warm golden color for particles
            const isDark = document.body.classList.contains('dark-mode');
            const color = isDark ? '191, 167, 112' : '150, 130, 80';
            ctx.fillStyle = `rgba(${color}, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    // Create particles
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
    
    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120) {
                    const isDark = document.body.classList.contains('dark-mode');
                    const color = isDark ? '191, 167, 112' : '150, 130, 80';
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(${color}, ${(1 - dist / 120) * 0.15})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();

    // ==================== SUBTLE PAGE FADE-IN ====================
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.6s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    // ==================== HOVER EFFECTS (NON-INTRUSIVE) ====================
    
    // Social icons
    const socialIcons = document.querySelectorAll('.social-icons a');
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.3s ease';
            this.style.transform = 'scale(1.1)';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // News items highlight
    const newsItems = document.querySelectorAll('.recent');
    newsItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transition = 'opacity 0.2s ease';
            this.style.opacity = '0.7';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
        });
    });

    // ==================== TYPING ANIMATION FOR QUOTE ====================
    const fancyQuote = document.querySelector('.fancy-quote');
    if (fancyQuote) {
        const originalText = fancyQuote.textContent;
        fancyQuote.textContent = '';
        fancyQuote.classList.add('typing');
        
        let charIndex = 0;
        const typingSpeed = 30;
        
        function typeCharacter() {
            if (charIndex < originalText.length) {
                fancyQuote.textContent += originalText.charAt(charIndex);
                charIndex++;
                setTimeout(typeCharacter, typingSpeed);
            } else {
                setTimeout(() => {
                    fancyQuote.classList.remove('typing');
                }, 500);
            }
        }
        
        setTimeout(typeCharacter, 800);
    }

    // ==================== SMOOTH SCROLL ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

});
