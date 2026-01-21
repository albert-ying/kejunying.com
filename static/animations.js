// Modern Animation System for Kejun Ying's Website
// Refined micro-interactions and subtle animations

(function() {
    'use strict';

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
        
        if (prefersReducedMotion) {
            // Still show content, just skip animations
            document.body.style.opacity = '1';
            return;
        }

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

        // Observe news items for staggered fade-in
        const newsItems = document.querySelectorAll('.recent');
        newsItems.forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.05}s`;
            item.classList.add('fade-in-element');
            fadeInObserver.observe(item);
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

        // ==================== AVATAR TILT EFFECT ====================
        const avatar = document.querySelector('.avatar-container img');
        if (avatar) {
            const container = avatar.parentElement;
            
            container.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                
                avatar.style.transform = `
                    perspective(500px)
                    rotateY(${x * 10}deg)
                    rotateX(${-y * 10}deg)
                    scale(1.05)
                `;
            });
            
            container.addEventListener('mouseleave', function() {
                avatar.style.transform = 'perspective(500px) rotateY(0) rotateX(0) scale(1)';
            });
        }

        // ==================== PARALLAX SUBTLE EFFECT ON SCROLL ====================
        let ticking = false;
        
        function updateParallax() {
            const scrollY = window.scrollY;
            const heroSection = document.querySelector('.hero-section');
            
            if (heroSection && scrollY < 400) {
                const opacity = Math.max(0, 1 - scrollY / 400);
                const translate = scrollY * 0.3;
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

    });
})();
