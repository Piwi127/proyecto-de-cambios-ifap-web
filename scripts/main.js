// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed header
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation link highlighting
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.pageYOffset + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const correspondingNavLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (correspondingNavLink) {
                    correspondingNavLink.classList.add('active');
                }
            }
        });
    }

    // Update active nav link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink(); // Call once on page load

    // Header background on scroll
    function updateHeaderBackground() {
        const header = document.querySelector('.header');
        if (window.pageYOffset > 50) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    }

    window.addEventListener('scroll', updateHeaderBackground);

    // Contact form handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const nombre = formData.get('nombre');
            const email = formData.get('email');
            const mensaje = formData.get('mensaje');

            // Basic validation
            if (!nombre || !email || !mensaje) {
                showNotification('Por favor, completa todos los campos.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showNotification('Por favor, ingresa un email válido.', 'error');
                return;
            }

            // Simulate form submission
            showNotification('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
            this.reset();
        });
    }

    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add notification to page
        document.body.appendChild(notification);

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '9999',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxWidth: '400px',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        // Set colors based on type
        if (type === 'success') {
            notification.style.background = '#10b981';
            notification.style.color = 'white';
        } else if (type === 'error') {
            notification.style.background = '#ef4444';
            notification.style.color = 'white';
        } else {
            notification.style.background = '#3b82f6';
            notification.style.color = 'white';
        }

        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto hide after 5 seconds
        const autoHideTimer = setTimeout(() => {
            hideNotification(notification);
        }, 5000);

        // Close button functionality
        const closeButton = notification.querySelector('.notification-close');
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: inherit;
            font-size: 20px;
            cursor: pointer;
            margin-left: 10px;
            padding: 0;
        `;
        
        closeButton.addEventListener('click', () => {
            clearTimeout(autoHideTimer);
            hideNotification(notification);
        });
    }

    function hideNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // Animate elements on scroll
    function animateOnScroll() {
        const elements = document.querySelectorAll('.program-card, .about-text, .contact-item');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('fade-in-up');
            }
        });
    }

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Call once on page load

    // Statistics counter animation
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const speed = 200; // Animation speed

        counters.forEach(counter => {
            const target = parseInt(counter.textContent.replace(/\D/g, ''));
            const increment = target / speed;
            let current = 0;

            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.ceil(current) + '+';
                    setTimeout(updateCounter, 1);
                } else {
                    counter.textContent = target + '+';
                }
            };

            // Check if counter is in viewport
            const counterTop = counter.getBoundingClientRect().top;
            if (counterTop < window.innerHeight - 100) {
                updateCounter();
            }
        });
    }

    // Trigger counter animation on scroll
    let counterAnimated = false;
    function checkCounterAnimation() {
        const statsSection = document.querySelector('.stats');
        if (statsSection && !counterAnimated) {
            const sectionTop = statsSection.getBoundingClientRect().top;
            if (sectionTop < window.innerHeight - 100) {
                animateCounters();
                counterAnimated = true;
            }
        }
    }

    window.addEventListener('scroll', checkCounterAnimation);
    checkCounterAnimation(); // Call once on page load

    // Program cards hover effect
    const programCards = document.querySelectorAll('.program-card');
    programCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Parallax effect for hero section
    function parallaxEffect() {
        const hero = document.querySelector('.hero');
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        
        if (hero) {
            hero.style.transform = `translateY(${parallax}px)`;
        }
    }

    window.addEventListener('scroll', parallaxEffect);

    // Lazy loading for images (if any are added later)
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            });
        }
    }

    lazyLoadImages();

    // Accessibility improvements
    function improveAccessibility() {
        // Add keyboard navigation for mobile menu
        navToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });

        // Add focus management for modal-like behaviors
        document.addEventListener('keydown', function(e) {
            // Close mobile menu with Escape key
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navToggle.focus();
            }
        });

        // Ensure links are keyboard accessible
        const allLinks = document.querySelectorAll('a, button');
        allLinks.forEach(link => {
            if (!link.hasAttribute('tabindex')) {
                link.setAttribute('tabindex', '0');
            }
        });
    }

    improveAccessibility();

    // Performance optimization - debounce scroll events
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

    // Apply debouncing to scroll events
    const debouncedScroll = debounce(() => {
        updateActiveNavLink();
        updateHeaderBackground();
        animateOnScroll();
        checkCounterAnimation();
        parallaxEffect();
    }, 10);

    window.addEventListener('scroll', debouncedScroll);

    console.log('IFAP Web - Sistema inicializado correctamente');
});

// Service Worker registration for PWA functionality (future enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // This can be uncommented when a service worker is added
        // navigator.serviceWorker.register('/sw.js')
        //     .then((registration) => {
        //         console.log('SW registered: ', registration);
        //     })
        //     .catch((registrationError) => {
        //         console.log('SW registration failed: ', registrationError);
        //     });
    });
}