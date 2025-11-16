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
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.radius = Math.random() * 3 + 1.5;
            this.opacity = Math.random() * 0.6 + 0.4;
            this.targetX = null;
            this.targetY = null;
        }
        
        update() {
            // If particle has a target, move towards it
            if (this.targetX !== null && this.targetY !== null) {
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                this.vx += dx * 0.02;
                this.vy += dy * 0.02;
                
                // Slow down when close to target
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 5) {
                    this.vx *= 0.8;
                    this.vy *= 0.8;
                }
            } else {
                // Normal floating behavior
                this.x += this.vx;
                this.y += this.vy;
                
                // Mouse interaction
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 200) {
                    const angle = Math.atan2(dy, dx);
                    const force = (200 - dist) / 200;
                    this.vx -= Math.cos(angle) * force * 0.3;
                    this.vy -= Math.sin(angle) * force * 0.3;
                }
                
                // Boundaries
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
                
                // Damping
                this.vx *= 0.98;
                this.vy *= 0.98;
            }
            
            this.x += this.vx;
            this.y += this.vy;
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
    for (let i = 0; i < 100; i++) {
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
                
                if (dist < 150) {
                    const isDark = document.body.classList.contains('dark-mode');
                    const color = isDark ? '191, 167, 112' : '150, 130, 80';
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(${color}, ${(1 - dist / 150) * 0.25})`;
                    ctx.lineWidth = 1;
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

    // ==================== TEXT PARTICLE EFFECT ====================
    // Apply to multiple elements with specific selectors (excluding buttons)
    const textEffectSelectors = [
        { selector: '.fancy-quote', fontSize: 34, fontFamily: 'playfair, serif', fontWeight: 'normal' }
    ];
    
    textEffectSelectors.forEach(config => {
        const elements = document.querySelectorAll(config.selector);
        elements.forEach(element => {
            // Skip buttons and interactive elements
            if (element.tagName === 'BUTTON' || element.closest('button') || element.closest('a')) {
                return;
            }
            createTextParticleEffect(element, config);
        });
    });
    
    function createTextParticleEffect(element, config) {
        const originalText = element.textContent.trim();
        if (!originalText) return;
        
        // Create wrapper to maintain layout
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.width = '100%'; // Allow full width
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
        
        // Create canvas for text particles
        const textCanvas = document.createElement('canvas');
        const textCtx = textCanvas.getContext('2d');
        textCanvas.style.position = 'absolute';
        textCanvas.style.top = '0';
        textCanvas.style.left = '0';
        textCanvas.style.pointerEvents = 'none';
        textCanvas.style.zIndex = '10';
        textCanvas.style.width = '100%'; // Full width to prevent clipping
        wrapper.appendChild(textCanvas);
        
        // Hide original text but keep layout
        element.style.visibility = 'hidden';
        
        let textParticles = [];
        let mouseTextX = -200;
        let mouseTextY = -200;
        
        // Text Particle class
        class TextParticle {
            constructor(x, y, canvasWidth, canvasHeight) {
                // Start from random position for opening animation
                this.x = Math.random() * canvasWidth;
                this.y = Math.random() * canvasHeight;
                this.baseX = x;
                this.baseY = y;
                this.density = (Math.random() * 15) + 3; // Reduced density for weaker repulsion
                this.size = 1.4; // Larger for better coverage and darker appearance
                this.animating = true;
                this.animationSpeed = 0.08; // Speed of convergence
            }
            
            draw() {
                const isDark = document.body.classList.contains('dark-mode');
                textCtx.fillStyle = isDark ? 'rgba(250, 224, 167, 1)' : 'rgba(99, 99, 99, 1)'; // Full opacity
                textCtx.beginPath();
                textCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                textCtx.closePath();
                textCtx.fill();
            }
            
            update() {
                // Opening animation: particles converge to their positions
                if (this.animating) {
                    let dx = this.baseX - this.x;
                    let dy = this.baseY - this.y;
                    this.x += dx * this.animationSpeed;
                    this.y += dy * this.animationSpeed;
                    
                    // Stop animating when close enough
                    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
                        this.animating = false;
                        this.x = this.baseX;
                        this.y = this.baseY;
                    }
                    return;
                }
                
                // Mouse repulsion effect (weaker than before)
                let dx = mouseTextX - this.x;
                let dy = mouseTextY - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = 100; // Reduced from 120
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density * 0.5; // Reduced force by 50%
                let directionY = forceDirectionY * force * this.density * 0.5;
                
                if (distance < maxDistance) {
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Return to base position
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx / 10;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy / 10;
                    }
                }
            }
        }
        
        // Initialize text particles
        function initTextParticles() {
            textParticles = [];
            
            // Set canvas size with large buffer to prevent any clipping
            const rect = element.getBoundingClientRect();
            const scale = 4; // 4x for high resolution
            
            // Use 2x multiplier on dimensions to ensure no clipping
            const canvasWidth = rect.width * 2 * scale;
            const canvasHeight = rect.height * 2 * scale;
            
            textCanvas.width = canvasWidth;
            textCanvas.height = canvasHeight;
            textCanvas.style.width = (rect.width * 2) + 'px';
            textCanvas.style.height = (rect.height * 2) + 'px';
            textCanvas.style.left = `-${rect.width * 0.5}px`;
            textCanvas.style.top = `-${rect.height * 0.5}px`;
            
            // Draw text on canvas to get pixel data
            textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
            textCtx.fillStyle = 'white';
            textCtx.font = `${config.fontWeight} ${config.fontSize * scale}px ${config.fontFamily}`;
            textCtx.textAlign = 'left';
            textCtx.textBaseline = 'top';
            
            // Center the text in the oversized canvas
            const offsetX = rect.width * 0.5 * scale;
            const offsetY = rect.height * 0.5 * scale;
            const lines = originalText.split('\n');
            const lineHeight = config.fontSize * scale * 1.2;
            lines.forEach((line, index) => {
                textCtx.fillText(line, offsetX, offsetY + index * lineHeight);
            });
            
            // Get pixel data
            const pixels = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height);
            textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
            
            // Create particles from pixels - ultra-high density sampling
            for (let y = 0; y < pixels.height; y += 1) {
                for (let x = 0; x < pixels.width; x += 1) {
                    const index = (y * 4 * pixels.width) + (x * 4);
                    if (pixels.data[index + 3] > 128) {
                        textParticles.push(new TextParticle(x, y, textCanvas.width, textCanvas.height));
                    }
                }
            }
        }
        
        // Mouse tracking for text particles
        const mouseMoveHandler = function(e) {
            const rect = textCanvas.getBoundingClientRect();
            const scaleX = textCanvas.width / rect.width;
            const scaleY = textCanvas.height / rect.height;
            mouseTextX = (e.clientX - rect.left) * scaleX;
            mouseTextY = (e.clientY - rect.top) * scaleY;
        };
        
        window.addEventListener('mousemove', mouseMoveHandler);
        
        // Animation loop for text particles
        function animateTextParticles() {
            textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
            for (let i = 0; i < textParticles.length; i++) {
                textParticles[i].draw();
                textParticles[i].update();
            }
            requestAnimationFrame(animateTextParticles);
        }
        
        // Start after a delay
        setTimeout(() => {
            initTextParticles();
            animateTextParticles();
        }, 800);
        
        // Reposition canvas on window resize
        const resizeHandler = () => {
            initTextParticles();
        };
        
        window.addEventListener('resize', resizeHandler);
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
