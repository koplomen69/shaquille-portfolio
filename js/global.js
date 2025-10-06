// Global JavaScript functionality

// Unified Theme Management System
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("themeToggle");
    this.themeToggleMobile = document.getElementById("themeToggleMobile");
    this.htmlElement = document.documentElement;
    this.isDarkMode = false;
    this.init();
  }

  init() {
    // Load saved theme immediately, before DOM content loads
    this.loadSavedTheme();
    
    // Wait for DOM to be ready before setting up event listeners
    if (document.readyState === 'loading') {
      document.addEventListener("DOMContentLoaded", () => {
        this.setupEventListeners();
      });
    } else {
      this.setupEventListeners();
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  loadSavedTheme() {
    const savedTheme = localStorage.getItem("theme");
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const themeToUse = savedTheme || preferredTheme;
    
    this.setTheme(themeToUse);
  }

  setupEventListeners() {
    // Update theme toggle references in case DOM changed
    this.themeToggle = document.getElementById("themeToggle");
    this.themeToggleMobile = document.getElementById("themeToggleMobile");

    // Add event listeners for both theme toggles
    if (this.themeToggle) {
      this.themeToggle.addEventListener("click", () => {
        this.switchTheme();
      });
    }

    if (this.themeToggleMobile) {
      this.themeToggleMobile.addEventListener("click", () => {
        this.switchTheme();
      });
    }
  }

  setTheme(theme) {
    this.isDarkMode = theme === 'dark';
    this.applyTheme();
    localStorage.setItem("theme", theme);
  }

  switchTheme() {
    const newTheme = this.isDarkMode ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  applyTheme() {
    // Apply theme to HTML element (for CSS custom properties)
    this.htmlElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
    
    // Apply theme to body
    document.body.classList.toggle("dark-mode", this.isDarkMode);
    document.body.classList.toggle("light-mode", !this.isDarkMode);
    
    // Apply theme to navbar
    const navbar = document.getElementById("navbar");
    if (navbar) {
      navbar.classList.toggle("dark-mode", this.isDarkMode);
      navbar.classList.toggle("light-mode", !this.isDarkMode);
    }
    
    // Update theme toggle icons
    this.updateThemeIcons();
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { isDarkMode: this.isDarkMode, theme: this.isDarkMode ? 'dark' : 'light' }
    }));
  }

  updateThemeIcons() {
    [this.themeToggle, this.themeToggleMobile].forEach(toggle => {
      if (toggle) {
        const icon = toggle.querySelector('i') || toggle;
        if (icon) {
          icon.classList.toggle("bi-brightness-high-fill", !this.isDarkMode);
          icon.classList.toggle("bi-moon", this.isDarkMode);
        }
      }
    });
  }

  // Public method to get current theme
  getCurrentTheme() {
    return this.isDarkMode ? 'dark' : 'light';
  }

  // Public method to check if dark mode is active
  isDark() {
    return this.isDarkMode;
  }
}

// Navigation Manager
class NavigationManager {
  constructor() {
    this.navbar = document.querySelector('.custom-navbar');
    this.hamburger = document.getElementById('hamburger');
    this.mobileNav = document.getElementById('mobileNav');
    this.mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    this.isMenuOpen = false;
    this.init();
  }

  init() {
    // Add scroll effect to navbar
    window.addEventListener('scroll', () => {
      if (this.navbar) {
        if (window.scrollY > 100) {
          this.navbar.style.background = this.navbar.classList.contains('dark-mode') 
            ? 'rgba(31, 41, 55, 0.98)' 
            : 'rgba(255, 255, 255, 0.98)';
        } else {
          this.navbar.style.background = this.navbar.classList.contains('dark-mode') 
            ? 'rgba(31, 41, 55, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)';
        }
      }
    });

    // Add active link highlighting
    this.highlightActiveLink();
    
    // Initialize hamburger menu
    this.initHamburgerMenu();
  }

  initHamburgerMenu() {
    if (this.hamburger && this.mobileNav) {
      // Toggle menu on hamburger click
      this.hamburger.addEventListener('click', () => {
        this.toggleMobileMenu();
      });

      // Close menu when clicking on mobile nav links
      this.mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
          this.closeMobileMenu();
        });
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (this.isMenuOpen && 
            !this.mobileNav.contains(e.target) && 
            !this.hamburger.contains(e.target)) {
          this.closeMobileMenu();
        }
      });

      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isMenuOpen) {
          this.closeMobileMenu();
        }
      });

      // Prevent body scroll when menu is open
      this.mobileNav.addEventListener('transitionend', () => {
        if (this.isMenuOpen) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      });
    }
  }

  toggleMobileMenu() {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    this.isMenuOpen = true;
    this.hamburger.classList.add('active');
    this.mobileNav.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    this.hamburger.classList.remove('active');
    this.mobileNav.classList.remove('active');
    document.body.style.overflow = '';
  }

  highlightActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active');
      }
    });
  }
}

// Utility Functions
class Utils {
  // Smooth scroll to element
  static scrollToElement(elementId, offset = 0) {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  // Add animation on scroll
  static observeElements(selector, animationClass) {
    const elements = document.querySelectorAll(selector);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(animationClass);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(element => {
      observer.observe(element);
    });
  }

  // Debounce function for performance
  static debounce(func, wait) {
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

  // Format date
  static formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
  }

  // Copy text to clipboard
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      return false;
    }
  }

  // Show notification/toast
  static showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 24px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '9999',
      opacity: '0',
      transform: 'translateY(-20px)',
      transition: 'all 0.3s ease'
    });

    // Set background color based on type
    const colors = {
      info: '#6366f1',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 10);

    // Animate out and remove
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
}

// Loading Manager
class LoadingManager {
  constructor() {
    this.createLoader();
  }

  createLoader() {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.innerHTML = `
      <div class="loader-content">
        <div class="loader-spinner"></div>
        <p>Loading...</p>
      </div>
    `;
    
    // Add loader styles
    const loaderStyles = `
      #page-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--bg-primary);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        transition: opacity 0.3s ease;
      }
      
      .loader-content {
        text-align: center;
      }
      
      .loader-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--border-color);
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = loaderStyles;
    document.head.appendChild(styleSheet);
    document.body.appendChild(loader);
  }

  hide() {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 300);
    }
  }
}

// Initialize global functionality
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme manager and make it globally accessible
  window.globalThemeManager = new ThemeManager();
  
  // Initialize navigation manager
  new NavigationManager();
  
  // Initialize loading manager and hide after page load
  const loadingManager = new LoadingManager();
  window.addEventListener('load', () => {
    setTimeout(() => loadingManager.hide(), 500);
  });
  

  
  document.body.appendChild(scrollTopBtn);
});

// Initialize theme manager immediately for early theme application
if (!window.globalThemeManager) {
  window.globalThemeManager = new ThemeManager();
}

// Export utilities for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeManager, NavigationManager, Utils, LoadingManager };
}

// Debug function to test theme synchronization
window.testThemeSync = function() {
  console.log('Theme Sync Test:');
  console.log('Current theme:', window.globalThemeManager?.getCurrentTheme());
  console.log('HTML data-theme:', document.documentElement.getAttribute('data-theme'));
  console.log('LocalStorage theme:', localStorage.getItem('theme'));
  console.log('Body classes:', document.body.className);
  
  return {
    currentTheme: window.globalThemeManager?.getCurrentTheme(),
    htmlDataTheme: document.documentElement.getAttribute('data-theme'),
    localStorageTheme: localStorage.getItem('theme'),
    bodyClasses: document.body.className
  };
};

// Auto-test on page load (can be removed later)
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    console.log('Auto Theme Sync Test:');
    window.testThemeSync();
  }, 1000);
});
