class NavigationManager {
    constructor() {
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setActiveLink();
        this.handleScroll();
    }

    bindEvents() {
        const hamburger = document.getElementById('nav-hamburger');
        const navMenu = document.getElementById('nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            // Close menu when clicking on a link
            navMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link')) {
                    this.closeMobileMenu();
                }
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });
        }

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Handle scroll for navbar transparency
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }

    toggleMobileMenu() {
        const hamburger = document.getElementById('nav-hamburger');
        const navMenu = document.getElementById('nav-menu');

        if (!hamburger || !navMenu) return;

        this.isMenuOpen = !this.isMenuOpen;
        
        hamburger.classList.toggle('active', this.isMenuOpen);
        navMenu.classList.toggle('active', this.isMenuOpen);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }

    closeMobileMenu() {
        const hamburger = document.getElementById('nav-hamburger');
        const navMenu = document.getElementById('nav-menu');

        if (!hamburger || !navMenu) return;

        this.isMenuOpen = false;
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    setActiveLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            
            if (href === currentPath || 
                (currentPath.endsWith('/') && href === 'index.html') ||
                (currentPath === '/' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    handleScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        const scrolled = window.scrollY > 50;
        
        if (scrolled) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'var(--nav-bg)';
            navbar.style.boxShadow = '0 4px 6px -1px var(--nav-shadow)';
        }
    }
}

// Initialize navigation manager
document.addEventListener('DOMContentLoaded', () => {
    new NavigationManager();
});