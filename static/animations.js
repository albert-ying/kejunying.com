// Modern Animation System for Kejun Ying's Website
// Premium micro-interactions and polished animations

(function() {
    'use strict';

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
        const pageHeadings = document.querySelectorAll('h1, h2.article-title');
        pageHeadings.forEach(heading => {
            heading.style.transition = 'transform 0.3s ease, text-shadow 0.3s ease';
            heading.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(4px)';
            });
            
            heading.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0)';
            });
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

    });
})();
