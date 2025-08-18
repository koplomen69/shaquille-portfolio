// Index Page Specific JavaScript

class IndexPageManager {
  constructor() {
    this.init();
  }

  init() {
    this.initAOS();
    this.initTypewriter();
    this.initCodeAnimation();
    this.initScrollIndicator();
    this.initSkillCards();
    this.initParticleEffects();
  }

  // Initialize AOS (Animate On Scroll)
  initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        offset: 100
      });
    }
  }

  // Enhanced typewriter effect
  initTypewriter() {
    const typewriterElement = document.querySelector('.typewriter');
    if (!typewriterElement) return;

    const texts = [
      'IT Student & Technology Enthusiast',
      'Full Stack Developer',
      'System Analyst',
      'Problem Solver'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let currentText = '';
    
    const typeSpeed = 100;
    const deleteSpeed = 50;
    const pauseDuration = 2000;

    const type = () => {
      const fullText = texts[textIndex];
      
      if (isDeleting) {
        currentText = fullText.substring(0, charIndex - 1);
        charIndex--;
      } else {
        currentText = fullText.substring(0, charIndex + 1);
        charIndex++;
      }
      
      typewriterElement.textContent = currentText;
      
      let delay = isDeleting ? deleteSpeed : typeSpeed;
      
      if (!isDeleting && charIndex === fullText.length) {
        delay = pauseDuration;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        delay = typeSpeed;
      }
      
      setTimeout(type, delay);
    };

    // Start the typing effect after initial animation
    setTimeout(type, 3000);
  }

  // Animate code snippet lines
  initCodeAnimation() {
    const codeLines = document.querySelectorAll('.code-line');
    if (codeLines.length === 0) return;

    // Animate code lines appearing one by one
    codeLines.forEach((line, index) => {
      line.style.opacity = '0';
      line.style.transform = 'translateX(-20px)';
      
      setTimeout(() => {
        line.style.transition = 'all 0.5s ease';
        line.style.opacity = '1';
        line.style.transform = 'translateX(0)';
      }, 500 + (index * 200));
    });

    // Add cursor blink effect to last line
    const lastLine = codeLines[codeLines.length - 1];
    if (lastLine) {
      setTimeout(() => {
        const cursor = document.createElement('span');
        cursor.textContent = '|';
        cursor.style.animation = 'blink-caret 1s step-end infinite';
        lastLine.appendChild(cursor);
      }, 500 + (codeLines.length * 200));
    }
  }

  // Handle scroll indicator
  initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (!scrollIndicator) return;

    scrollIndicator.addEventListener('click', () => {
      const skillsSection = document.querySelector('.skills-section');
      if (skillsSection) {
        skillsSection.scrollIntoView({ behavior: 'smooth' });
      }
    });

    // Hide scroll indicator when user scrolls
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.visibility = 'hidden';
      } else {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.visibility = 'visible';
      }
    });
  }

  // Enhanced skill cards interactions
  initSkillCards() {
    const skillCards = document.querySelectorAll('.skill-card');
    
    skillCards.forEach((card, index) => {
      // Add staggered entrance animation
      card.style.opacity = '0';
      card.style.transform = 'translateY(50px)';
      
      // Animate cards in view
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.transition = 'all 0.6s ease';
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, index * 150);
          }
        });
      }, { threshold: 0.1 });
      
      observer.observe(card);

      // Add enhanced hover effects
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-15px) scale(1.03)';
        this.createParticles(card);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
      });

      // Add click effect
      card.addEventListener('click', () => {
        card.style.animation = 'pulse 0.6s ease';
        setTimeout(() => {
          card.style.animation = '';
        }, 600);
      });
    });
  }

  // Create particle effects for skill cards
  createParticles(card) {
    const particleCount = 5;
    const cardRect = card.getBoundingClientRect();
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: var(--primary-color);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
      `;
      
      const startX = cardRect.left + Math.random() * cardRect.width;
      const startY = cardRect.top + Math.random() * cardRect.height;
      
      particle.style.left = startX + 'px';
      particle.style.top = startY + 'px';
      
      document.body.appendChild(particle);
      
      // Animate particle
      const endX = startX + (Math.random() - 0.5) * 100;
      const endY = startY - Math.random() * 100;
      
      particle.animate([
        { transform: 'translate(0, 0)', opacity: 1 },
        { transform: `translate(${endX - startX}px, ${endY - startY}px)`, opacity: 0 }
      ], {
        duration: 1000,
        easing: 'ease-out'
      }).onfinish = () => particle.remove();
    }
  }

  // Initialize particle background effects
  initParticleEffects() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    // Create floating particles
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        this.createFloatingParticle(heroSection);
      }, i * 200);
    }

    // Continuously create new particles
    setInterval(() => {
      this.createFloatingParticle(heroSection);
    }, 3000);
  }

  createFloatingParticle(container) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      background: rgba(99, 102, 241, ${Math.random() * 0.3 + 0.1});
      border-radius: 50%;
      pointer-events: none;
      z-index: 1;
    `;
    
    const startX = Math.random() * container.offsetWidth;
    const startY = container.offsetHeight;
    
    particle.style.left = startX + 'px';
    particle.style.top = startY + 'px';
    
    container.appendChild(particle);
    
    // Animate particle floating up
    const duration = Math.random() * 3000 + 2000;
    const endY = -50;
    const drift = (Math.random() - 0.5) * 100;
    
    particle.animate([
      { 
        transform: 'translate(0, 0)',
        opacity: 0 
      },
      { 
        transform: `translate(${drift}px, ${endY - startY}px)`,
        opacity: 1,
        offset: 0.1
      },
      { 
        transform: `translate(${drift * 2}px, ${endY - startY}px)`,
        opacity: 0 
      }
    ], {
      duration: duration,
      easing: 'ease-out'
    }).onfinish = () => particle.remove();
  }

  // Add smooth reveal animations for hero content
  initHeroAnimations() {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroDescription = document.querySelector('.hero-description');
    const heroButtons = document.querySelector('.hero-buttons');
    const heroVisual = document.querySelector('.hero-visual');

    // Staggered animations
    const elements = [heroTitle, heroSubtitle, heroDescription, heroButtons, heroVisual];
    
    elements.forEach((element, index) => {
      if (element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
          element.style.transition = 'all 0.8s ease';
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, 200 + (index * 200));
      }
    });
  }
}

// Counter animation for statistics
class CounterAnimation {
  static animateNumber(element, target, duration = 2000) {
    const start = 0;
    const startTime = Date.now();
    
    const updateNumber = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        element.textContent = target;
      }
    };
    
    updateNumber();
  }
}

// Initialize index page functionality
document.addEventListener('DOMContentLoaded', () => {
  const indexManager = new IndexPageManager();
  
  // Add custom cursor effect
  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    border: 2px solid var(--primary-color);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transition: all 0.1s ease;
    display: none;
  `;
  document.body.appendChild(cursor);
  
  document.addEventListener('mousemove', (e) => {
    cursor.style.display = 'block';
    cursor.style.left = e.clientX - 10 + 'px';
    cursor.style.top = e.clientY - 10 + 'px';
  });
  
  // Hide custom cursor on mobile
  if (window.innerWidth <= 768) {
    cursor.style.display = 'none';
  }
});

// Performance optimization
document.addEventListener('DOMContentLoaded', () => {
  // Lazy load images
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
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
});

// Export for potential use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { IndexPageManager, CounterAnimation };
}
