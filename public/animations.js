// Modern Animation System for Kejun Ying's Website
// Premium micro-interactions and polished animations with particle effects

(function() {
    'use strict';

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Color theme - gold/bronze palette
    const COLORS = {
        primary: '#c9a959',
        secondary: '#8b7355',
        accent: '#d4b96a',
        light: 'rgba(201, 169, 89, 0.6)',
        dark: 'rgba(139, 115, 85, 0.4)'
    };

    // ==================== UTILITY FUNCTIONS ====================
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ==================== PARTICLE BACKGROUND SYSTEM ====================
    function createParticleCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        document.body.insertBefore(canvas, document.body.firstChild);
        
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;
        let mouseX = 0;
        let mouseY = 0;
        
        // Resize canvas
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', debounce(resizeCanvas, 100));
        
        // Particle class
        class Particle {
            constructor() {
                this.reset();
            }
            
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.pulseSpeed = Math.random() * 0.02 + 0.01;
                this.pulsePhase = Math.random() * Math.PI * 2;
                // Gold/bronze color variation
                const colorChoice = Math.random();
                if (colorChoice < 0.5) {
                    this.color = COLORS.primary;
                } else if (colorChoice < 0.8) {
                    this.color = COLORS.secondary;
                } else {
                    this.color = COLORS.accent;
                }
            }
            
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                
                // Gentle mouse interaction
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 150) {
                    const force = (150 - distance) / 150 * 0.02;
                    this.speedX -= dx * force * 0.01;
                    this.speedY -= dy * force * 0.01;
                }
                
                // Pulse effect
                this.pulsePhase += this.pulseSpeed;
                const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
                this.currentOpacity = this.opacity * pulse;
                
                // Wrap around edges
                if (this.x < -10) this.x = canvas.width + 10;
                if (this.x > canvas.width + 10) this.x = -10;
                if (this.y < -10) this.y = canvas.height + 10;
                if (this.y > canvas.height + 10) this.y = -10;
                
                // Dampen speed
                this.speedX *= 0.99;
                this.speedY *= 0.99;
                
                // Add slight random drift
                this.speedX += (Math.random() - 0.5) * 0.02;
                this.speedY += (Math.random() - 0.5) * 0.02;
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.currentOpacity;
                ctx.fill();
            }
        }
        
        // Create particles
        const particleCount = Math.min(60, Math.floor(window.innerWidth / 25));
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        // Draw connections between nearby particles
        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 120) {
                        const opacity = (1 - distance / 120) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = COLORS.primary;
                        ctx.globalAlpha = opacity;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }
        
        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            drawConnections();
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            ctx.globalAlpha = 1;
            animationId = requestAnimationFrame(animate);
        }
        
        // Track mouse position
        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        // Start animation
        if (!prefersReducedMotion) {
            animate();
        } else {
            // Static particles for reduced motion
            particles.forEach(particle => particle.draw());
            drawConnections();
        }
        
        // Pause when tab is not visible
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else if (!prefersReducedMotion) {
                animate();
            }
        });
    }

    // ==================== CURSOR GLOW EFFECT ====================
    function createCursorGlow() {
        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        document.body.appendChild(glow);
        
        let currentX = 0;
        let currentY = 0;
        let targetX = 0;
        let targetY = 0;
        
        document.addEventListener('mousemove', function(e) {
            targetX = e.clientX;
            targetY = e.clientY;
        });
        
        function updateGlow() {
            // Smooth follow
            currentX += (targetX - currentX) * 0.08;
            currentY += (targetY - currentY) * 0.08;
            
            glow.style.left = currentX + 'px';
            glow.style.top = currentY + 'px';
            
            requestAnimationFrame(updateGlow);
        }
        
        if (!prefersReducedMotion) {
            updateGlow();
        }
    }

    // ==================== SCROLL TO TOP BUTTON ====================
    function createScrollToTop() {
        const btn = document.createElement('button');
        btn.className = 'scroll-to-top';
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
        `;
        btn.setAttribute('aria-label', 'Scroll to top');
        btn.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(201, 169, 89, 0.9);
            color: #fff;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 15px rgba(201, 169, 89, 0.3);
            z-index: 1000;
        `;
        
        document.body.appendChild(btn);
        
        // Show/hide based on scroll position
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                if (window.scrollY > 400) {
                    btn.style.opacity = '1';
                    btn.style.visibility = 'visible';
                    btn.style.transform = 'translateY(0)';
                } else {
                    btn.style.opacity = '0';
                    btn.style.visibility = 'hidden';
                    btn.style.transform = 'translateY(10px)';
                }
            }, 50);
        }, { passive: true });
        
        // Click to scroll
        btn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Hover effect
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
            this.style.boxShadow = '0 6px 20px rgba(201, 169, 89, 0.4)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = window.scrollY > 400 ? 'translateY(0)' : 'translateY(10px)';
            this.style.boxShadow = '0 4px 15px rgba(201, 169, 89, 0.3)';
        });
    }

    // ==================== READING PROGRESS BAR ====================
    function createProgressBar() {
        const bar = document.createElement('div');
        bar.className = 'reading-progress';
        bar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #c9a959, #8b7355);
            z-index: 9999;
            transition: width 0.1s ease-out;
        `;
        document.body.appendChild(bar);
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            bar.style.width = Math.min(progress, 100) + '%';
        }, { passive: true });
    }

    document.addEventListener('DOMContentLoaded', function() {
        
        // Create UI elements
        createScrollToTop();
        createProgressBar();
        
        // Create particle background (works even with reduced motion, just static)
        createParticleCanvas();
        
        if (prefersReducedMotion) {
            // Still show content, just skip animations
            document.body.style.opacity = '1';
            return;
        }
        
        // Create cursor glow effect
        createCursorGlow();

        // ==================== INTERSECTION OBSERVER FOR SCROLL ANIMATIONS ====================
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const fadeInObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-visible');
                    fadeInObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Reveal observer for scroll animations
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Staggered reveal
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, index * 50);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

        // Observe news items for staggered fade-in
        const newsItems = document.querySelectorAll('.recent');
        newsItems.forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.05}s`;
            item.classList.add('fade-in-element');
            fadeInObserver.observe(item);
        });
        
        // Observe publication cards for reveal animation
        const pubCards = document.querySelectorAll('#doc h4');
        pubCards.forEach(card => {
            card.classList.add('reveal-on-scroll');
            revealObserver.observe(card);
        });

        // ==================== TYPING ANIMATION FOR QUOTE ====================
        const fancyQuote = document.querySelector('.fancy-quote');
        if (fancyQuote) {
            const originalText = fancyQuote.textContent.trim();
            fancyQuote.textContent = '';
            fancyQuote.classList.add('typing');
            
            let charIndex = 0;
            const typeSpeed = 45;
            
            function typeText() {
                if (charIndex < originalText.length) {
                    fancyQuote.textContent += originalText.charAt(charIndex);
                    charIndex++;
                    // Vary speed slightly for natural feel
                    const variance = Math.random() * 20 - 10;
                    setTimeout(typeText, typeSpeed + variance);
                } else {
                    setTimeout(() => {
                        fancyQuote.classList.remove('typing');
                    }, 2000);
                }
            }
            
            // Start typing after fade-in animations settle
            setTimeout(typeText, 700);
        }

        // ==================== MAGNETIC HOVER FOR SOCIAL ICONS ====================
        const socialIcons = document.querySelectorAll('.social-icons a');
        
        socialIcons.forEach(icon => {
            icon.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Subtle magnetic pull effect
                this.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.08)`;
            });
            
            icon.addEventListener('mouseleave', function() {
                this.style.transform = 'translate(0, 0) scale(1)';
            });
        });

        // ==================== LINK HOVER UNDERLINE ANIMATION ====================
        const contentLinks = document.querySelectorAll('.intro-text a, p a');
        
        contentLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.style.setProperty('--underline-width', '100%');
            });
            
            link.addEventListener('mouseleave', function() {
                this.style.setProperty('--underline-width', '0%');
            });
        });

        // ==================== SMOOTH SCROLL ====================
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // ==================== AVATAR HOVER EFFECT ====================
        const avatar = document.querySelector('.avatar-container img');
        if (avatar) {
            const container = avatar.parentElement;
            
            container.addEventListener('mouseenter', function() {
                avatar.style.transform = 'scale(1.08)';
                avatar.style.boxShadow = '0 16px 50px rgba(201, 169, 89, 0.35)';
            });
            
            container.addEventListener('mouseleave', function() {
                avatar.style.transform = 'scale(1)';
                avatar.style.boxShadow = 'none';
            });
        }

        // ==================== DATE BADGE HOVER EFFECTS ====================
        const dateBadges = document.querySelectorAll('.recent .date');
        dateBadges.forEach(badge => {
            badge.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
                this.style.background = 'rgba(201, 169, 89, 0.2)';
            });
            
            badge.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.background = '';
            });
        });

        // ==================== NAVIGATION LINK ANIMATIONS ====================
        const navLinks = document.querySelectorAll('.menu-container h3.list a.title, .article-nav-inner a.internal');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px) scale(1.02)';
            });
            
            link.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        // ==================== NEWS ITEM RIPPLE EFFECT ====================
        const newsItemsForRipple = document.querySelectorAll('.recent');
        newsItemsForRipple.forEach(item => {
            item.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(201, 169, 89, 0.2);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Add ripple animation CSS
        const rippleStyle = document.createElement('style');
        rippleStyle.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(rippleStyle);

        // ==================== JOB MARKET BANNER HOVER ====================
        const jobBanner = document.querySelector('.job-market-banner');
        if (jobBanner) {
            jobBanner.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 8px 30px rgba(201, 169, 89, 0.15)';
            });
            
            jobBanner.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '';
            });
        }

        // ==================== HEADING HOVER EFFECTS ====================
        const pageHeadings = document.querySelectorAll('h1:not(#doc h1), h2.article-title');
        pageHeadings.forEach(heading => {
            heading.style.transition = 'transform 0.3s ease, text-shadow 0.3s ease';
            heading.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(4px)';
            });
            
            heading.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0)';
            });
        });

        // ==================== YEAR HEADING PARTICLE BURST ====================
        const yearHeadings = document.querySelectorAll('#doc h1[id^="20"]');
        yearHeadings.forEach(heading => {
            heading.addEventListener('click', function(e) {
                createParticleBurst(e.clientX, e.clientY);
            });
        });
        
        function createParticleBurst(x, y) {
            const particles = [];
            const particleCount = 12;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    left: ${x}px;
                    top: ${y}px;
                    width: 6px;
                    height: 6px;
                    background: ${Math.random() > 0.5 ? COLORS.primary : COLORS.secondary};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                `;
                document.body.appendChild(particle);
                particles.push(particle);
                
                const angle = (i / particleCount) * Math.PI * 2;
                const velocity = 80 + Math.random() * 60;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;
                
                particle.animate([
                    { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                    { transform: `translate(${vx}px, ${vy}px) scale(0)`, opacity: 0 }
                ], {
                    duration: 600 + Math.random() * 200,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }).onfinish = () => particle.remove();
            }
        }

        // ==================== PUBLICATION CARD HOVER GLOW ====================
        const docH4s = document.querySelectorAll('#doc h4');
        docH4s.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.background = 'linear-gradient(135deg, rgba(201, 169, 89, 0.08) 0%, rgba(139, 115, 85, 0.04) 100%)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.background = '';
            });
        });

        // ==================== IFRAME LAZY ENHANCEMENT ====================
        const iframes = document.querySelectorAll('#doc iframe');
        iframes.forEach(iframe => {
            iframe.style.opacity = '0';
            iframe.style.transition = 'opacity 0.5s ease';
            
            iframe.addEventListener('load', function() {
                this.style.opacity = '1';
            });
            
            // Fallback if already loaded
            if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
                iframe.style.opacity = '1';
            }
        });

        // ==================== SMOOTH PAGE TRANSITIONS ====================
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.4s ease';
        
        window.addEventListener('load', function() {
            document.body.style.opacity = '1';
        });

        // ==================== STAGGERED NEWS ITEM ANIMATION ====================
        const staggeredItems = document.querySelectorAll('.recent');
        staggeredItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 100 + (index * 50));
        });

        // ==================== PARALLAX SUBTLE EFFECT ON SCROLL ====================
        let ticking = false;
        
        function updateParallax() {
            const scrollY = window.scrollY;
            const heroSection = document.querySelector('.hero-section');
            
            if (heroSection && scrollY < 400) {
                const opacity = Math.max(0.3, 1 - scrollY / 600);
                const translate = scrollY * 0.2;
                heroSection.style.opacity = opacity;
                heroSection.style.transform = `translateY(${translate}px)`;
            }
            
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });

        // ==================== PUBLICATIONS CAROUSEL ====================
        initPublicationsCarousel();

    });

    // Publications Carousel Initialization
    function initPublicationsCarousel() {
        const carousel = document.querySelector('.pub-carousel');
        if (!carousel) return;

        const track = carousel.querySelector('.pub-carousel-track');
        const cards = carousel.querySelectorAll('.pub-card');
        const dotsContainer = carousel.querySelector('.pub-dots');
        const prevBtn = carousel.querySelector('.pub-nav-prev');
        const nextBtn = carousel.querySelector('.pub-nav-next');
        
        if (!track || cards.length === 0) return;

        let currentIndex = 0;
        const totalCards = cards.length;

        // Calculate visible cards based on screen width
        function getVisibleCards() {
            const width = window.innerWidth;
            if (width >= 1400) return 3;
            if (width >= 900) return 2;
            return 1;
        }

        // Create dots
        if (dotsContainer) {
            cards.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = 'pub-dot' + (index === 0 ? ' active' : '');
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });
        }

        const dots = dotsContainer ? dotsContainer.querySelectorAll('.pub-dot') : [];

        function updateCarousel() {
            const visibleCards = getVisibleCards();
            const maxIndex = Math.max(0, totalCards - visibleCards);
            currentIndex = Math.min(currentIndex, maxIndex);
            
            // Calculate translation - simpler for mobile
            if (visibleCards === 1) {
                // Mobile: simple percentage-based translation
                track.style.transform = `translateX(-${currentIndex * 100}%)`;
            } else {
                // Desktop: account for gaps
                const cardWidthPercent = 100 / visibleCards;
                const gapCompensation = currentIndex * 1;
                track.style.transform = `translateX(calc(-${currentIndex * cardWidthPercent}% - ${gapCompensation}rem))`;
            }
            
            // Apply visual effects to cards
            cards.forEach((card, index) => {
                const cardInner = card.querySelector('.pub-card-inner');
                const distance = index - currentIndex;
                
                if (visibleCards === 1) {
                    // Mobile: simple show/hide, no 3D effects
                    cardInner.style.transform = 'none';
                    cardInner.style.opacity = distance === 0 ? 1 : 0.3;
                    cardInner.style.filter = 'none';
                } else {
                    // Desktop: Stage Manager style depth effect
                    const centerPos = (visibleCards - 1) / 2;
                    const relativePos = (index - currentIndex) - centerPos;
                    const absDistance = Math.abs(relativePos);
                    
                    let scale, translateZ, opacity;
                    
                    if (absDistance < 0.5) {
                        scale = 1;
                        translateZ = 20;
                        opacity = 1;
                    } else if (absDistance <= 1) {
                        scale = 0.95;
                        translateZ = 0;
                        opacity = 0.9;
                    } else {
                        scale = 0.88;
                        translateZ = -20;
                        opacity = 0.7;
                    }
                    
                    cardInner.style.transform = `translateZ(${translateZ}px) scale(${scale})`;
                    cardInner.style.opacity = opacity;
                    cardInner.style.filter = 'none';
                }
            });
            
            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });

            // Update buttons
            if (prevBtn) prevBtn.disabled = currentIndex === 0;
            if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
        }

        function goToSlide(index) {
            const visibleCards = getVisibleCards();
            const maxIndex = Math.max(0, totalCards - visibleCards);
            currentIndex = Math.max(0, Math.min(index, maxIndex));
            updateCarousel();
        }

        function nextSlide() {
            const visibleCards = getVisibleCards();
            const maxIndex = Math.max(0, totalCards - visibleCards);
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateCarousel();
            }
        }

        function prevSlide() {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        }

        // Event listeners
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        // Keyboard navigation
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        });

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextSlide();
                else prevSlide();
            }
        }, { passive: true });

        // Handle resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(updateCarousel, 100);
        });

        // Auto-play (every 3 seconds - cycles continuously)
        let autoPlayInterval;
        
        function startAutoPlay() {
            autoPlayInterval = setInterval(() => {
                const visibleCards = getVisibleCards();
                const maxIndex = Math.max(0, totalCards - visibleCards);
                if (currentIndex < maxIndex) {
                    nextSlide();
                } else {
                    // Smooth loop back to start
                    currentIndex = 0;
                    updateCarousel();
                }
            }, 3000);
        }

        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }

        // Pause on hover
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);

        // Start auto-play
        startAutoPlay();

        // Initial state
        updateCarousel();
    }

    // ==================== APPLE-STYLE POLISH ====================
    
    // Smooth scroll for all anchor links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Reading progress indicator
    function initReadingProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
        document.body.appendChild(progressBar);

        const bar = progressBar.querySelector('.reading-progress-bar');
        
        function updateProgress() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = `${progress}%`;
            
            // Show/hide based on scroll
            progressBar.style.opacity = scrollTop > 100 ? '1' : '0';
        }

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    // Back to top button
    function initBackToTop() {
        const btn = document.createElement('button');
        btn.className = 'back-to-top';
        btn.setAttribute('aria-label', 'Back to top');
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
        document.body.appendChild(btn);

        function updateVisibility() {
            btn.classList.toggle('visible', window.scrollY > 400);
        }

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', updateVisibility, { passive: true });
        updateVisibility();
    }

    // Enhanced scroll reveal with stagger
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.recent, .pub-card, #doc h2, #doc h4, #doc ul li');
        
        if (revealElements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Staggered delay based on index
                    const delay = Math.min(index * 50, 300);
                    entry.target.style.transitionDelay = `${delay}ms`;
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => {
            el.classList.add('reveal-on-scroll');
            observer.observe(el);
        });
    }

    // Parallax effect for hero section
    function initParallax() {
        const hero = document.querySelector('.hero-section');
        const avatar = document.querySelector('.avatar-container');
        
        if (!hero || !avatar || prefersReducedMotion) return;

        let ticking = false;

        function updateParallax() {
            const scrollY = window.scrollY;
            const maxScroll = 400;
            
            if (scrollY < maxScroll) {
                const progress = scrollY / maxScroll;
                const translateY = scrollY * 0.3;
                const scale = 1 - (progress * 0.1);
                const opacity = 1 - (progress * 0.5);
                
                avatar.style.transform = `translateY(${translateY}px) scale(${scale})`;
                avatar.style.opacity = opacity;
            }
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }

    // Magnetic hover effect for buttons
    function initMagneticHover() {
        const magneticElements = document.querySelectorAll('.menu-item, .pub-nav-btn, .back-to-top, .theme-toggle');
        
        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });
            
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }

    // Text reveal animation for headings
    function initTextReveal() {
        const headings = document.querySelectorAll('.hero-section .title, .job-market-banner .banner-title');
        
        headings.forEach(heading => {
            const text = heading.textContent;
            heading.innerHTML = '';
            heading.style.opacity = '1';
            
            [...text].forEach((char, i) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.cssText = `
                    display: inline-block;
                    opacity: 0;
                    transform: translateY(20px);
                    animation: textRevealChar 0.5s ease forwards;
                    animation-delay: ${i * 30}ms;
                `;
                heading.appendChild(span);
            });
        });
    }

    // Initialize all Apple-style enhancements
    function initApplePolish() {
        initSmoothScroll();
        initReadingProgress();
        initBackToTop();
        initScrollReveal();
        initParallax();
        // initMagneticHover(); // Disabled - can interfere with other transforms
        // initTextReveal(); // Disabled - can be too flashy
    }

    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApplePolish);
    } else {
        initApplePolish();
    }

})();
