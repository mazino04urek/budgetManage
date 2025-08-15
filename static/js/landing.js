class LandingManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.animateOnScroll();
        this.initCounters();
    }

    bindEvents() {
        // Demo button
        const demoBtn = document.getElementById('demo-btn');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                this.showDemo();
            });
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            this.handleParallax();
        });
    }

    showDemo() {
        // Create demo modal
        const modal = document.createElement('div');
        modal.className = 'demo-modal';
        modal.innerHTML = `
            <div class="demo-overlay"></div>
            <div class="demo-content glass-card">
                <div class="demo-header">
                    <h3>Product Demo</h3>
                    <button class="close-demo">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="demo-video">
                    <div class="video-placeholder">
                        <i class="fas fa-play-circle"></i>
                        <p>Interactive demo coming soon!</p>
                        <p class="demo-description">
                            Experience Budget Buddy's intuitive interface, smart analytics, 
                            and AI-powered insights in action.
                        </p>
                    </div>
                </div>
                <div class="demo-actions">
                    <a href="login.html" class="demo-btn primary">
                        <i class="fas fa-arrow-right"></i>
                        Try It Now
                    </a>
                    <button class="demo-btn secondary close-demo">
                        Maybe Later
                    </button>
                </div>
            </div>
        `;

        // Style the modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const overlay = modal.querySelector('.demo-overlay');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
        `;

        const content = modal.querySelector('.demo-content');
        content.style.cssText = `
            position: relative;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(modal);

        // Show modal with animation
        setTimeout(() => {
            modal.style.opacity = '1';
            content.style.transform = 'scale(1)';
        }, 10);

        // Close modal events
        const closeButtons = modal.querySelectorAll('.close-demo');
        const closeModal = () => {
            modal.style.opacity = '0';
            content.style.transform = 'scale(0.9)';
            setTimeout(() => modal.remove(), 300);
        };

        closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
        overlay.addEventListener('click', closeModal);

        // Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    animateOnScroll() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe feature cards
        document.querySelectorAll('.feature-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `all 0.6s ease ${index * 0.1}s`;
            observer.observe(card);
        });

        // Observe CTA section
        const ctaSection = document.querySelector('.cta-content');
        if (ctaSection) {
            ctaSection.style.opacity = '0';
            ctaSection.style.transform = 'translateY(30px)';
            ctaSection.style.transition = 'all 0.6s ease';
            observer.observe(ctaSection);
        }
    }

    initCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const observerOptions = {
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const text = element.textContent;
        const number = parseInt(text.replace(/[^\d]/g, ''));
        const suffix = text.replace(/[\d]/g, '');
        const duration = 2000;
        const increment = number / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= number) {
                current = number;
                clearInterval(timer);
            }
            
            let displayValue = Math.floor(current);
            if (displayValue >= 1000) {
                displayValue = (displayValue / 1000).toFixed(1) + 'K';
            }
            
            element.textContent = displayValue + suffix.replace('K', '');
        }, 16);
    }

    handleParallax() {
        const scrolled = window.pageYOffset;
        const heroVisual = document.querySelector('.hero-visual');
        
        if (heroVisual) {
            const rate = scrolled * -0.5;
            heroVisual.style.transform = `translateY(${rate}px)`;
        }

        // Update navbar background
        const navbar = document.querySelector('.landing-nav');
        if (navbar) {
            if (scrolled > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            } else {
                navbar.style.background = 'var(--nav-bg)';
                navbar.style.boxShadow = '0 4px 6px -1px var(--nav-shadow)';
            }
        }
    }
}

// Initialize landing manager
document.addEventListener('DOMContentLoaded', () => {
    new LandingManager();
});