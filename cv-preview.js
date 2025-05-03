document.addEventListener('DOMContentLoaded', function() {
  // Theme toggling functionality
  const themeToggle = document.getElementById('themeToggle');
  const icon = themeToggle.querySelector('i');
  const htmlElement = document.documentElement;
  
  // Check for saved theme preference or use default
  const savedTheme = localStorage.getItem('theme') || 'light';
  htmlElement.setAttribute('data-theme', savedTheme);
  
  // Update icon based on current theme
  updateThemeIcon(savedTheme);
  
  // Handle theme toggle button click
  themeToggle.addEventListener('click', function() {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeIcon(newTheme);
  });
  
  function updateThemeIcon(theme) {
    if (theme === 'dark') {
      icon.classList.remove('bi-brightness-high-fill');
      icon.classList.add('bi-moon-fill');
    } else {
      icon.classList.remove('bi-moon-fill');
      icon.classList.add('bi-brightness-high-fill');
    }
  }
  
  // Handle PDF viewer loading
  const pdfViewer = document.getElementById('pdf-viewer');
  const loadingAnimation = document.querySelector('.loading-animation');
  
  pdfViewer.addEventListener('load', function() {
    // Hide loading animation when PDF is loaded
    setTimeout(() => {
      loadingAnimation.style.opacity = '0';
      setTimeout(() => {
        loadingAnimation.style.display = 'none';
      }, 500);
    }, 1000); // Add a slight delay for better UX
  });
  
  // Handle hamburger menu toggle animation
  const navbarToggler = document.querySelector('.navbar-toggler');
  navbarToggler.addEventListener('click', function() {
    // Force a reflow to make sure animations work properly
    this.offsetHeight;
  });
  
  // Add subtle parallax effect to background shapes
  if (window.matchMedia('(min-width: 768px)').matches) {
    document.addEventListener('mousemove', function(e) {
      const shapes = document.querySelectorAll('.bg-shape');
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      
      shapes.forEach((shape, index) => {
        const factor = (index + 1) * 10;
        const x = (mouseX - 0.5) * factor;
        const y = (mouseY - 0.5) * factor;
        
        shape.style.transform = `translate(${x}px, ${y}px)`;
      });
    });
  }
  
  // Add floating dots
  createFloatingDots();
});

// Create floating dots for additional visual interest
function createFloatingDots() {
  const container = document.getElementById('bg-container');
  const dotCount = 30;
  
  for (let i = 0; i < dotCount; i++) {
    const dot = document.createElement('div');
    dot.classList.add('floating-dot');
    
    // Random positioning and properties
    dot.style.left = `${Math.random() * 100}vw`;
    dot.style.top = `${Math.random() * 100}vh`;
    const size = Math.random() * 4 + 1; // 1-5px size
    dot.style.width = `${size}px`;
    dot.style.height = dot.style.width;
    
    // Random animation duration and delay
    const duration = Math.random() * 60 + 30;
    dot.style.animation = `float-dot ${duration}s linear infinite`;
    dot.style.animationDelay = `${Math.random() * duration}s`;
    
    // Add to container
    container.appendChild(dot);
  }
  
  // Add CSS for dots
  const style = document.createElement('style');
  style.textContent = `
    .floating-dot {
      position: absolute;
      background-color: rgba(78, 67, 118, 0.4);
      border-radius: 50%;
      pointer-events: none;
    }
    
    @keyframes float-dot {
      0%, 100% {
        transform: translateY(0) translateX(0);
        opacity: 0;
      }
      10%, 90% {
        opacity: 0.6;
      }
      50% {
        transform: translateY(-100px) translateX(50px);
      }
    }
    
    [data-theme="dark"] .floating-dot {
      background-color: rgba(200, 200, 255, 0.2);
    }
  `;
  document.head.appendChild(style);
}
