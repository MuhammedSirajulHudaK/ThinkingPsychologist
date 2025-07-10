// Mobile Navigation
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileMenuToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
}

// Smooth scrolling for navigation links
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

// Form submission handling
const demoForm = document.querySelector('.demo-form');
if (demoForm) {
    demoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = demoForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.textContent = 'Scheduling...';
        submitButton.disabled = true;
        
        // Get form data
        const formData = new FormData(demoForm);
        const data = Object.fromEntries(formData);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success message
            showNotification('Demo scheduled successfully! We\'ll contact you soon.', 'success');
            demoForm.reset();
            
        } catch (error) {
            showNotification('Failed to schedule demo. Please try again.', 'error');
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);
    
    // Close button handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
        removeNotification(notification);
    });
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
}

function removeNotification(notification) {
    notification.classList.add('hide');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            
            // Special animations for specific elements
            if (entry.target.classList.contains('typing-indicator')) {
                animateTypingIndicator(entry.target);
            }
            
            if (entry.target.classList.contains('security-alert')) {
                animateSecurityAlert(entry.target);
            }
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .resource-card, .security-features li, .ai-chat, .testimonial').forEach(el => {
    observer.observe(el);
});

// Code editor typing animation
function animateCodeTyping() {
    const codeLines = document.querySelectorAll('.code-line');
    if (codeLines.length === 0) return;
    
    codeLines.forEach((line, index) => {
        line.style.opacity = '0';
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.animation = 'typeWriter 0.5s steps(40) forwards';
        }, index * 1000);
    });
}

// Typing indicator animation
function animateTypingIndicator(element) {
    const spans = element.querySelectorAll('span');
    spans.forEach((span, index) => {
        span.style.animationDelay = `${index * 0.2}s`;
    });
}

// Security alert animation
function animateSecurityAlert(element) {
    element.style.animation = 'pulse 2s infinite';
}

// Navbar scroll effect
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        navbar.style.transform = 'translateY(0)';
    }
    
    // Add shadow when scrolled
    if (scrollTop > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScrollTop = scrollTop;
});

// Hero section particles effect (optional enhancement)
function createParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    hero.appendChild(particlesContainer);
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Button click effects
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// AI chat simulation
function simulateAIChat() {
    const aiChat = document.querySelector('.ai-chat');
    if (!aiChat) return;
    
    const messages = [
        { type: 'ai', text: 'I can help you optimize this algorithm. Have you considered using a hash map for O(1) lookups?' },
        { type: 'user', text: 'That\'s a great suggestion! Let me implement that approach.' },
        { type: 'ai', text: 'Perfect! This will reduce the time complexity from O(n²) to O(n).' }
    ];
    
    let currentMessage = 0;
    
    setInterval(() => {
        if (currentMessage < messages.length) {
            const messageElement = aiChat.children[currentMessage];
            if (messageElement) {
                messageElement.style.opacity = '1';
                messageElement.style.transform = 'translateY(0)';
                currentMessage++;
            }
        }
    }, 2000);
}

// Form validation
function setupFormValidation() {
    const inputs = document.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        input.addEventListener('input', () => {
            if (input.classList.contains('invalid')) {
                validateField(input);
            }
        });
    });
}

function validateField(field) {
    const isValid = field.checkValidity();
    
    if (isValid) {
        field.classList.remove('invalid');
        field.classList.add('valid');
        removeErrorMessage(field);
    } else {
        field.classList.add('invalid');
        field.classList.remove('valid');
        showErrorMessage(field);
    }
    
    return isValid;
}

function showErrorMessage(field) {
    removeErrorMessage(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = getErrorMessage(field);
    
    field.parentNode.appendChild(errorDiv);
}

function removeErrorMessage(field) {
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function getErrorMessage(field) {
    if (field.validity.valueMissing) {
        return 'This field is required.';
    }
    if (field.validity.typeMismatch && field.type === 'email') {
        return 'Please enter a valid email address.';
    }
    if (field.validity.tooShort) {
        return `Minimum ${field.minLength} characters required.`;
    }
    return 'Please enter a valid value.';
}

// Performance monitoring
function trackPagePerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                
                if (loadTime > 3000) {
                    console.warn('Page load time is slow:', loadTime + 'ms');
                }
            }, 100);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupFormValidation();
    createParticles();
    simulateAIChat();
    trackPagePerformance();
    
    // Animate code editor after a delay
    setTimeout(() => {
        animateCodeTyping();
    }, 1000);
});

// Add CSS for animations and effects
const additionalStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.hide {
        transform: translateX(400px);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        padding: 1rem;
        gap: 0.75rem;
    }
    
    .notification-success {
        border-left: 4px solid var(--primary-color);
    }
    
    .notification-error {
        border-left: 4px solid #ef4444;
    }
    
    .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        margin-left: auto;
        color: #6b7280;
    }
    
    .navbar.scrolled {
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .navbar {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .particles-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
    }
    
    .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: var(--primary-color);
        border-radius: 50%;
        opacity: 0.1;
        animation: float linear infinite;
    }
    
    @keyframes float {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 0.1;
        }
        90% {
            opacity: 0.1;
        }
        100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-effect 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-effect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .error-message {
        color: #ef4444;
        font-size: 0.75rem;
        margin-top: 0.25rem;
    }
    
    .form-group input.invalid {
        border-color: #ef4444;
    }
    
    .form-group input.valid {
        border-color: var(--primary-color);
    }
    
    @keyframes typeWriter {
        from { width: 0; }
        to { width: 100%; }
    }
    
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    @media (max-width: 768px) {
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: white;
            border-top: 1px solid var(--border-color);
            padding: 1rem 2rem;
            gap: 1rem;
        }
        
        .notification {
            right: 10px;
            left: 10px;
            max-width: none;
            transform: translateY(-100px);
        }
        
        .notification.show {
            transform: translateY(0);
        }
        
        .notification.hide {
            transform: translateY(-100px);
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);