// Minimal Animation System for Kejun Ying's Website
// Typing animation and subtle hover effects only

document.addEventListener('DOMContentLoaded', function() {
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        return; // Exit if user prefers reduced motion
    }

    // ==================== SUBTLE PAGE FADE-IN ====================
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.6s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    // ==================== TYPING ANIMATION FOR QUOTE ====================
    const fancyQuote = document.querySelector('.fancy-quote');
    if (fancyQuote) {
        const originalText = fancyQuote.textContent;
        fancyQuote.textContent = '';
        fancyQuote.classList.add('typing');
        
        let charIndex = 0;
        const typeSpeed = 50; // milliseconds per character
        
        function typeText() {
            if (charIndex < originalText.length) {
                fancyQuote.textContent += originalText.charAt(charIndex);
                charIndex++;
                setTimeout(typeText, typeSpeed);
            } else {
                // Remove cursor after typing completes
                setTimeout(() => {
                    fancyQuote.classList.remove('typing');
                }, 1500);
            }
        }
        
        // Start typing after a short delay
        setTimeout(typeText, 800);
    }

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
