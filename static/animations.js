// Modern Animation System for Kejun Ying's Website
// Maintains minimal aesthetic while adding subtle, modern interactions

document.addEventListener('DOMContentLoaded', function() {
    
    // ==================== FADE IN ON LOAD ====================
    const fadeInElements = document.querySelectorAll('body > *');
    fadeInElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // ==================== TYPING ANIMATION FOR QUOTE ====================
    const fancyQuote = document.querySelector('.fancy-quote');
    if (fancyQuote) {
        const quoteText = fancyQuote.textContent;
        fancyQuote.textContent = '';
        fancyQuote.style.opacity = '1';
        
        let charIndex = 0;
        const typingSpeed = 40; // milliseconds per character
        
        function typeCharacter() {
            if (charIndex < quoteText.length) {
                fancyQuote.textContent += quoteText.charAt(charIndex);
                charIndex++;
                setTimeout(typeCharacter, typingSpeed);
            }
        }
        
        // Start typing after initial page load animations
        setTimeout(typeCharacter, 800);
    }

    // ==================== SCROLL-TRIGGERED ANIMATIONS ====================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated-in');
            }
        });
    }, observerOptions);

    // Animate news items
    const newsItems = document.querySelectorAll('.recent');
    newsItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.classList.add('animate-on-scroll');
        observer.observe(item);
        
        // Stagger the animation
        item.style.transitionDelay = `${index * 0.05}s`;
    });

    // Animate social icons
    const socialIcons = document.querySelectorAll('.social-icons a');
    socialIcons.forEach((icon, index) => {
        icon.style.opacity = '0';
        icon.style.transform = 'scale(0.8)';
        icon.classList.add('animate-on-scroll');
        observer.observe(icon);
        icon.style.transitionDelay = `${index * 0.1}s`;
    });

    // ==================== ENHANCED HOVER EFFECTS ====================
    
    // Menu items with magnetic effect
    const menuItems = document.querySelectorAll('.menu-container h3 a');
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', function(e) {
            this.style.transition = 'transform 0.3s ease';
            this.style.transform = 'translateX(5px)';
        });
        
        item.addEventListener('mouseleave', function(e) {
            this.style.transform = 'translateX(0)';
        });
    });

    // Social icons with bounce effect
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function(e) {
            this.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            this.style.transform = 'scale(1.2) rotate(5deg)';
        });
        
        icon.addEventListener('mouseleave', function(e) {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });

    // News items highlight effect
    newsItems.forEach(item => {
        item.addEventListener('mouseenter', function(e) {
            this.style.transition = 'padding-left 0.3s ease, background-color 0.3s ease';
            this.style.paddingLeft = '10px';
            if (document.body.classList.contains('dark-mode')) {
                this.style.backgroundColor = 'rgba(250, 224, 167, 0.05)';
            } else {
                this.style.backgroundColor = 'rgba(99, 99, 99, 0.03)';
            }
        });
        
        item.addEventListener('mouseleave', function(e) {
            this.style.paddingLeft = '0px';
            this.style.backgroundColor = 'transparent';
        });
    });

    // ==================== PARALLAX EFFECT FOR AVATAR ====================
    const sidenoteImages = document.querySelectorAll('.sidenote img');
    let ticking = false;
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                sidenoteImages.forEach(img => {
                    const scrolled = window.pageYOffset;
                    const rate = scrolled * 0.3;
                    img.style.transform = `translateY(${rate}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    });

    // ==================== SMOOTH SCROLL FOR INTERNAL LINKS ====================
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

    // ==================== ANIMATED GRADIENT BACKGROUND (SUBTLE) ====================
    // Only if user prefers reduced motion is NOT set
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const body = document.body;
        let hue = 0;
        
        function animateBackground() {
            hue += 0.1;
            if (body.classList.contains('dark-mode')) {
                // Very subtle gradient shift for dark mode
                body.style.background = `linear-gradient(135deg, 
                    hsl(${35 + Math.sin(hue * 0.01) * 5}, 18%, 17%) 0%, 
                    hsl(${35 + Math.sin(hue * 0.01) * 5}, 18%, 17%) 100%)`;
            }
            requestAnimationFrame(animateBackground);
        }
        
        // Start subtle background animation
        // animateBackground(); // Uncomment if you want the gradient animation
    }

    // ==================== CURSOR TRAIL EFFECT (VERY SUBTLE) ====================
    const cursorTrail = [];
    const trailLength = 6;
    
    for (let i = 0; i < trailLength; i++) {
        const dot = document.createElement('div');
        dot.className = 'cursor-dot';
        document.body.appendChild(dot);
        cursorTrail.push(dot);
    }

    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursorTrail() {
        let x = mouseX;
        let y = mouseY;
        
        cursorTrail.forEach((dot, index) => {
            const nextDot = cursorTrail[index + 1] || cursorTrail[0];
            
            dot.style.left = x + 'px';
            dot.style.top = y + 'px';
            dot.style.transform = `scale(${(trailLength - index) / trailLength})`;
            
            const rect = dot.getBoundingClientRect();
            x += (rect.left - x) * 0.4;
            y += (rect.top - y) * 0.4;
        });
        
        requestAnimationFrame(animateCursorTrail);
    }
    
    animateCursorTrail();

    // ==================== TITLE ANIMATION ====================
    const titleElement = document.querySelector('h1.title');
    if (titleElement) {
        titleElement.style.opacity = '0';
        titleElement.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            titleElement.style.transition = 'opacity 1s ease, transform 1s ease';
            titleElement.style.opacity = '1';
            titleElement.style.transform = 'translateY(0)';
        }, 300);
    }

    // ==================== JOB MARKET BANNER PULSE ====================
    const jobMarketBanner = document.querySelector('div[style*="background-color: #f0f8ff"]');
    if (jobMarketBanner) {
        setInterval(() => {
            jobMarketBanner.style.transition = 'box-shadow 1s ease';
            jobMarketBanner.style.boxShadow = '0 4px 20px rgba(74, 144, 226, 0.2)';
            setTimeout(() => {
                jobMarketBanner.style.boxShadow = '0 2px 10px rgba(74, 144, 226, 0.1)';
            }, 1000);
        }, 3000);
    }

});

// Respect user preferences
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--animation-duration', '0s');
}
