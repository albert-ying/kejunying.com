// Modern Animation System for Kejun Ying's Website
// Refined micro-interactions and subtle animations

(function() {
    'use strict';

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('DOMContentLoaded', function() {
        
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
