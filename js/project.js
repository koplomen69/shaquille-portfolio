// ===== PROJECT PAGE SPECIFIC FUNCTIONALITY =====

// Enhanced Hamburger menu and navbar functionality
function initNavbarFunctionality() {
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.querySelector('.navbar-collapse');
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');

  // Navbar scroll effect
  window.addEventListener('scroll', function() {
    if (navbar && window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else if (navbar) {
      navbar.classList.remove('scrolled');
    }
  });

  if (navbarToggler && navbarCollapse && hamburger) {
    navbarToggler.addEventListener('click', function() {
      // Toggle hamburger animation
      setTimeout(() => {
        const isExpanded = navbarCollapse.classList.contains('show');
        hamburger.classList.toggle('active', isExpanded);
        navbarToggler.setAttribute('aria-expanded', isExpanded);
      }, 50);
    });
    
    // Close menu when clicking outside with smooth animation
    document.addEventListener('click', function(event) {
      const isClickInsideNav = navbarToggler.contains(event.target) || 
                             navbarCollapse.contains(event.target) ||
                             navbar.contains(event.target);
      if (!isClickInsideNav && navbarCollapse.classList.contains('show')) {
        hamburger.classList.remove('active');
        navbarToggler.click();
      }
    });
    
    // Enhanced nav link interactions
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        // Add active state
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // Close mobile menu with delay for better UX
        if (navbarCollapse.classList.contains('show')) {
          setTimeout(() => {
            hamburger.classList.remove('active');
            navbarToggler.click();
          }, 200);
        }
      });
      
      // Enhanced hover effects
      link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px) scale(1.02)';
      });
      
      link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
      });
    });
  }
}

// Enhanced theme toggle - use global theme manager
function initThemeToggle() {
  // The global theme manager handles all theme functionality
  // This function is kept for backward compatibility but does nothing
  // since global.js now handles all theme management
  console.log('Theme management is now handled by global theme manager');
}

// Integrated Holographic Background System
function initIntegratedBackground() {
  // Create holographic background effects integrated with the page
  const body = document.body;
  
  // Add animated background elements that work with card effects
  const backgroundEffect = document.createElement('div');
  backgroundEffect.className = 'holographic-background';
  backgroundEffect.innerHTML = `
    <div class="holo-particle holo-particle-1"></div>
    <div class="holo-particle holo-particle-2"></div>
    <div class="holo-particle holo-particle-3"></div>
    <div class="holo-particle holo-particle-4"></div>
    <div class="holo-particle holo-particle-5"></div>
    <div class="holo-particle holo-particle-6"></div>
  `;
  
  body.appendChild(backgroundEffect);
}

// Card Modal Functionality
const projectData = {
  1: {
    title: "Online Shop",
    description: "A fully functional e-commerce platform with admin panel and payment gateway integration for my college project.",
    techStack: ["Laravel", "PHP", "MySQL", "Bootstrap", "JavaScript", "PayPal API"],
    details: "This comprehensive online shop features user authentication, product catalog, shopping cart, order management, admin dashboard, and secure payment processing. Built using Laravel framework with MVC architecture.",
    links: [
      { text: "View Demo", url: "#", type: "demo" },
      { text: "GitHub", url: "#", type: "github" }
    ]
  },
  2: {
    title: "Village Profile Website",
    description: "A collaborative campus project creating a comprehensive web portal for village information using Laravel and API integration.",
    techStack: ["Laravel", "Vue.js", "API", "MySQL", "Bootstrap", "REST"],
    details: "Developed a modern village information system with real-time data integration, community features, and administrative tools. Includes population data, local services, and community announcements.",
    links: [
      { text: "View Live", url: "#", type: "demo" },
      { text: "Documentation", url: "#", type: "docs" }
    ]
  },
  3: {
    title: "Custom Linux OS",
    description: "A personalized Linux distribution with custom features and applications tailored to my preferences and workflow.",
    techStack: ["Linux Kernel", "Shell Scripting", "Python", "C++", "Package Management"],
    details: "Built from scratch with custom desktop environment, optimized performance settings, pre-installed development tools, and personalized configurations. Includes custom themes and workflow automation.",
    links: [
      { text: "Download ISO", url: "#", type: "download" },
      { text: "Installation Guide", url: "#", type: "docs" }
    ]
  },
  4: {
    title: "Company Web Profile",
    description: "A professional corporate website showcasing company services, portfolio, and business information for a production company.",
    techStack: ["WordPress", "PHP", "MySQL", "JavaScript", "CSS3", "SEO"],
    details: "Modern responsive website with content management system, SEO optimization, contact forms, service showcase, and portfolio gallery. Optimized for performance and search engines.",
    links: [
      { text: "Visit Website", url: "#", type: "demo" },
      { text: "Case Study", url: "#", type: "docs" }
    ]
  },
  5: {
    title: "Map Contributions",
    description: "Contributing to mapping platforms by sharing travel experiences and photos from various locations around the world.",
    techStack: ["Google Maps API", "Photography", "GPS", "Mobile Apps", "Geolocation"],
    details: "Active contributor to mapping services, sharing high-quality photos, reviews, and location data from travels. Helping other travelers discover amazing places with detailed information and visual guides.",
    links: [
      { text: "View Profile", url: "#", type: "profile" },
      { text: "Contributions", url: "#", type: "portfolio" }
    ]
  },
  6: {
    title: "Community Social Media",
    description: "A specialized social media platform for the K4 cultural community, managing content and fostering community engagement.",
    techStack: ["React", "Node.js", "MongoDB", "Socket.io", "AWS", "Firebase"],
    details: "Full-stack social platform with real-time messaging, content sharing, event management, and community moderation tools. Designed specifically for cultural community interactions and collaborations.",
    links: [
      { text: "Join Community", url: "#", type: "demo" },
      { text: "Features Overview", url: "#", type: "docs" }
    ]
  }
};

function openCardModal(projectId) {
  const modal = document.getElementById('cardModal');
  const project = projectData[projectId];
  
  if (!project) return;

  // Populate front side content
  document.getElementById('modalCardTitle').textContent = project.title;
  document.getElementById('modalCardDescription').textContent = project.description;
  
  // Set front image
  const img = document.getElementById('modalCardImage');
  img.src = `gambar/project${projectId}.png`;
  img.alt = project.title;
  
  // Populate back side content (same as front for holographic effect)
  document.getElementById('modalCardTitleBack').textContent = project.title;
  document.getElementById('modalCardDescriptionBack').textContent = project.description;
  
  const imgBack = document.getElementById('modalCardImageBack');
  imgBack.src = `gambar/project${projectId}.png`;
  imgBack.alt = project.title;
  
  // Show modal first
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Start with front visible, then flip to back after delay
  const modalContent = modal.querySelector('.card-modal-content');
  const frontSide = modal.querySelector('.expanded-card-front');
  const backSide = modal.querySelector('.expanded-card-back');
  
  // Initially show front
  frontSide.style.opacity = '1';
  backSide.style.opacity = '0';
  
  // Flip to back after short delay
  setTimeout(() => {
    frontSide.style.opacity = '0';
    backSide.style.opacity = '1';
    modalContent.classList.add('flipped');
  }, 500);
  
  // Initialize holographic effects for modal
  initModalHolographicEffects();
}

function closeCardModal() {
  const modal = document.getElementById('cardModal');
  const modalContent = modal.querySelector('.card-modal-content');
  const frontSide = modal.querySelector('.expanded-card-front');
  const backSide = modal.querySelector('.expanded-card-back');
  
  // First flip back to front
  frontSide.style.opacity = '1';
  backSide.style.opacity = '0';
  modalContent.classList.remove('flipped');
  
  // Then close modal after flip animation
  setTimeout(() => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    cleanupModalHolographicEffects();
  }, 400);
}

// Modal Holographic Effects
let modalMouseTracker = null;

function initModalHolographicEffects() {
  const expandedCard = document.querySelector('.expanded-card.holo');
  if (!expandedCard) return;
  
  // Remove any existing mouse tracker
  if (modalMouseTracker) {
    expandedCard.removeEventListener('mousemove', modalMouseTracker);
  }
  
  modalMouseTracker = function(e) {
    const rect = expandedCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to percentages
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    
    // Calculate distance from center for intensity
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const distanceFromCenter = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    ) / (Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2)));
    
    // Update CSS variables for holographic effects
    expandedCard.style.setProperty('--pointer-x', `${percentX}%`);
    expandedCard.style.setProperty('--pointer-y', `${percentY}%`);
    expandedCard.style.setProperty('--pointer-from-center', Math.min(1, distanceFromCenter));
    expandedCard.style.setProperty('--background-x', `${percentX * 0.8}%`);
    expandedCard.style.setProperty('--background-y', `${percentY * 0.8}%`);
    expandedCard.style.setProperty('--card-opacity', Math.min(1, 0.6 + distanceFromCenter * 0.4));
    
    // Apply slight rotation for 3D effect
    const rotateX = (percentY - 50) * 0.1;
    const rotateY = (percentX - 50) * 0.1;
    expandedCard.style.setProperty('--rotate-x', `${rotateY}deg`);
    expandedCard.style.setProperty('--rotate-y', `${-rotateX}deg`);
  };
  
  expandedCard.addEventListener('mousemove', modalMouseTracker);
  
  // Reset effects when mouse leaves
  expandedCard.addEventListener('mouseleave', function() {
    expandedCard.style.setProperty('--pointer-x', '50%');
    expandedCard.style.setProperty('--pointer-y', '50%');
    expandedCard.style.setProperty('--pointer-from-center', '0.5');
    expandedCard.style.setProperty('--background-x', '50%');
    expandedCard.style.setProperty('--background-y', '50%');
    expandedCard.style.setProperty('--card-opacity', '0.8');
    expandedCard.style.setProperty('--rotate-x', '0deg');
    expandedCard.style.setProperty('--rotate-y', '0deg');
  });
}

function cleanupModalHolographicEffects() {
  const expandedCard = document.querySelector('.expanded-card.holo');
  if (expandedCard && modalMouseTracker) {
    expandedCard.removeEventListener('mousemove', modalMouseTracker);
    modalMouseTracker = null;
  }
}

// Advanced Effect Cycling System
let effectCycleInterval = null;
let currentEffectIndex = 0;
const effects = ['holo-effect', 'rainbow-rare', 'gold-secret'];

function startEffectCycling() {
  const expandedCard = document.querySelector('.expanded-card.holo');
  if (!expandedCard) return;
  
  // Start with first effect
  applyEffect(expandedCard, effects[0]);
  currentEffectIndex = 0;
  
  // Cycle through effects every 4 seconds
  effectCycleInterval = setInterval(() => {
    currentEffectIndex = (currentEffectIndex + 1) % effects.length;
    applyEffect(expandedCard, effects[currentEffectIndex]);
  }, 4000);
}

function stopEffectCycling() {
  if (effectCycleInterval) {
    clearInterval(effectCycleInterval);
    effectCycleInterval = null;
  }
  
  // Clean up all effect classes
  const expandedCard = document.querySelector('.expanded-card.holo');
  if (expandedCard) {
    effects.forEach(effect => {
      expandedCard.classList.remove(effect);
    });
  }
}

function applyEffect(card, effectClass) {
  // Remove all existing effect classes
  effects.forEach(effect => {
    card.classList.remove(effect);
  });
  
  // Add transition class for smooth effect changes
  card.classList.add('effect-transition');
  
  // Add the new effect class
  setTimeout(() => {
    card.classList.add(effectClass);
  }, 50);
  
  // Update effect indicator
  const effectNames = {
    'holo-effect': 'Holographic',
    'rainbow-rare': 'Rainbow Rare',
    'gold-secret': 'Gold Secret'
  };
  
  const effectNameElement = document.getElementById('effectName');
  if (effectNameElement) {
    effectNameElement.textContent = effectNames[effectClass] || 'Holographic';
  }
}

// Manual effect switching (optional - can be triggered by clicks)
function switchToNextEffect() {
  const expandedCard = document.querySelector('.expanded-card.holo');
  if (!expandedCard) return;
  
  currentEffectIndex = (currentEffectIndex + 1) % effects.length;
  applyEffect(expandedCard, effects[currentEffectIndex]);
  
  // Reset the cycling timer
  if (effectCycleInterval) {
    clearInterval(effectCycleInterval);
    effectCycleInterval = setInterval(() => {
      currentEffectIndex = (currentEffectIndex + 1) % effects.length;
      applyEffect(expandedCard, effects[currentEffectIndex]);
    }, 4000);
  }
}

// Initialize project page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Pokemon card effects should auto-initialize from pokemon-card-effects.js
  // No need to manually initialize since the HTML structure is already correct

  // Initialize navbar functionality
  initNavbarFunctionality();
  
  // Initialize theme toggle
  initThemeToggle();
  
  // Initialize integrated holographic background
  initIntegratedBackground();
  
  // Hide loading overlay after everything is loaded
  setTimeout(() => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('fade-out');
      setTimeout(() => {
        loadingOverlay.style.display = 'none';
      }, 800);
    }
  }, 1500); // Show loading for 1.5 seconds

  // Card click handlers
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      const projectId = this.getAttribute('data-project');
      openCardModal(projectId);
    });
  });

  // Modal close handlers
  const modal = document.getElementById('cardModal');
  if (modal) {
    const closeBtn = modal.querySelector('.card-modal-close');
    const backdrop = modal.querySelector('.card-modal-backdrop');
    
    if (closeBtn) closeBtn.addEventListener('click', closeCardModal);
    if (backdrop) backdrop.addEventListener('click', closeCardModal);
    
    // Escape key to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeCardModal();
      }
    });
  }
});
