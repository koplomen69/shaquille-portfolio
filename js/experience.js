document.addEventListener('DOMContentLoaded', () => {

  const hideBtn = document.getElementById("hideCardsBtn");
  const body = document.body;
  let hidden = false;

  hideBtn.addEventListener("click", () => {
    hidden = !hidden;
    if (hidden) {
      body.classList.add("cards-hidden");
      hideBtn.textContent = "Show Cards";
    } else {
      body.classList.remove("cards-hidden");
      hideBtn.textContent = "Hide Cards";
    }
  });

  // Initialize AOS (Animate On Scroll)
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    offset: 100
  });

  // Add scroll-triggered animations for timeline items
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

  // Observe all experience items
  const experienceItems = document.querySelectorAll('.experience-item');
  experienceItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(item);
  });

  // Add hover effect for timeline items
  experienceItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.transform = 'translateY(-2px)';
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translateY(0)';
    });
  });

  // Smooth scroll for internal links
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

  // Add parallax effect to title
  const title = document.querySelector('.experience-title');
  if (title) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      title.style.transform = `translateY(${scrolled * 0.1}px)`;
    });
  }

  // Enhanced card interactions
  const experienceCards = document.querySelectorAll('.experience-card');
  experienceCards.forEach(card => {
    card.addEventListener('mouseenter', (e) => {
      card.style.boxShadow = `
        var(--shadow-xl), 
        0 0 30px rgba(99, 102, 241, 0.3),
        0 0 60px rgba(99, 102, 241, 0.1)
      `;
    });

    card.addEventListener('mouseleave', (e) => {
      card.style.boxShadow = 'var(--shadow-md)';
    });

    card.addEventListener('click', (e) => {
      const ripple = document.createElement('div');
      const rect = card.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
      `;

      card.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Add CSS for ripple animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(2);
        opacity: 0;
      }
    }
    
    .experience-card {
      position: relative;
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);

  // Performance optimization: Reduce animations on low-end devices
  const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
                        /Android.*Chrome\/[.0-9]*/.test(navigator.userAgent);
  
  if (isLowEndDevice) {
    document.documentElement.style.setProperty('--animation-duration', '0.3s');
  }

  // Enhanced Solar System Controls Integration
  const setupSolarSystemControls = () => {
    // Speed Control
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    if (speedSlider && window.solarSystem) {
      speedSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        window.solarSystem.setRotationSpeed(value);
        speedValue.textContent = value + 'x';
      });
    }

    // Star Density Control
    const starDensitySlider = document.getElementById('starDensitySlider');
    const starDensityValue = document.getElementById('starDensityValue');
    if (starDensitySlider && window.solarSystem) {
      starDensitySlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (window.solarSystem.stars) {
          window.solarSystem.stars.material.opacity = value * 0.8;
        }
        starDensityValue.textContent = Math.round(value * 100) + '%';
      });
    }

    // Texture Quality Control
    const textureQualitySlider = document.getElementById('textureQualitySlider');
    const textureQualityValue = document.getElementById('textureQualityValue');
    if (textureQualitySlider && window.solarSystem) {
      textureQualitySlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (window.solarSystem.textures) {
          Object.values(window.solarSystem.textures).forEach(texture => {
            if (texture) {
              texture.anisotropy = Math.floor(value * window.solarSystem.renderer.capabilities.getMaxAnisotropy());
            }
          });
        }
        textureQualityValue.textContent = Math.round(value * 100) + '%';
      });
    }

    // Reset Button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn && window.solarSystem) {
      resetBtn.addEventListener('click', () => {
        window.solarSystem.resetCamera();
        window.solarSystem.setRotationSpeed(1);
        window.solarSystem.setTimeScale(1);
        
        if (speedSlider) {
          speedSlider.value = 1;
          speedValue.textContent = '1x';
        }
        if (starDensitySlider) {
          starDensitySlider.value = 1;
          starDensityValue.textContent = '100%';
          if (window.solarSystem.stars) {
            window.solarSystem.stars.material.opacity = 0.8;
          }
        }
        if (textureQualitySlider) {
          textureQualitySlider.value = 1;
          textureQualityValue.textContent = '100%';
          if (window.solarSystem.textures) {
            Object.values(window.solarSystem.textures).forEach(texture => {
              if (texture) {
                texture.anisotropy = window.solarSystem.renderer.capabilities.getMaxAnisotropy();
              }
            });
          }
        }
      });
    }

    // Pause Button
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn && window.solarSystem) {
      pauseBtn.addEventListener('click', () => {
        window.solarSystem.togglePause();
        pauseBtn.textContent = window.solarSystem.controls.isPaused ? 'Resume' : 'Pause';
        pauseBtn.classList.toggle('paused', window.solarSystem.controls.isPaused);
      });
    }

    // Hide Cards Button
    const hideCardsBtn = document.getElementById('hideCardsBtn');
    if (hideCardsBtn) {
      hideCardsBtn.addEventListener('click', () => {
        const experienceSection = document.querySelector('.experience-section');
        const isHidden = experienceSection.classList.contains('hidden');
        
        experienceSection.classList.toggle('hidden', !isHidden);
        hideCardsBtn.innerHTML = isHidden ? '<i class="bi bi-eye-slash-fill"></i>' : '<i class="bi bi-eye-fill"></i>';
        hideCardsBtn.classList.toggle('cards-hidden', !isHidden);
      });
    }

    // Controls Panel Toggle with Auto-Shrink
    const controlsToggle = document.getElementById('controlsToggle');
    const controlsPanel = document.querySelector('.solar-system-controls');
    let hasInteracted = false;

    if (controlsToggle && controlsContent && controlsPanel) {
      console.log('Controls elements found:', { controlsToggle, controlsContent, controlsPanel });

      // Toggle control panel
      controlsToggle.addEventListener('click', (e) => {
        console.log('Controls toggle clicked, current state:', {
          isShrunk: controlsPanel.classList.contains('shrunk'),
        });
        e.stopPropagation();
        const isShrunk = controlsPanel.classList.contains('shrunk');
        controlsPanel.classList.toggle('shrunk', !isShrunk);
        controlsToggle.style.transform = isShrunk ? 'rotate(0deg)' : 'rotate(90deg)';
        // Ensure controls-content is visible when expanded
        if (!isShrunk) {
          controlsContent.style.display = 'block';
          console.log('Expanded controls, buttons should be visible');
        }
      });

      // Auto-shrink after interaction with canvas
      const canvas = document.getElementById('solar-system-canvas');
      if (canvas) {
        const shrinkOnInteraction = () => {
          if (!hasInteracted) {
            console.log('Canvas interaction detected, shrinking controls');
            hasInteracted = true;
            controlsPanel.classList.add('shrunk');
            controlsContent.style.display = 'none';
            controlsToggle.style.transform = 'rotate(0deg)';
          }
        };
        
        canvas.addEventListener('mousedown', shrinkOnInteraction);
        canvas.addEventListener('touchstart', shrinkOnInteraction);
      }
    } else {
      console.error('Controls elements not found:', { controlsToggle, controlsContent, controlsPanel });
    }
  };

  // Setup controls when solar system is ready
  if (window.solarSystem) {
    setupSolarSystemControls();
  } else {
    const checkSolarSystem = setInterval(() => {
      if (window.solarSystem) {
        setupSolarSystemControls();
        clearInterval(checkSolarSystem);
      }
    }, 100);
  }

  // Camera hint functionality
  const cameraHint = document.getElementById('cameraHint');
  if (cameraHint) {
    setTimeout(() => {
      cameraHint.classList.add('show');
    }, 1000);
    
    setTimeout(() => {
      cameraHint.classList.remove('show');
    }, 6000);
    
    const canvas = document.getElementById('solar-system-canvas');
    if (canvas) {
      let hasInteracted = false;
      
      const showHintOnInteraction = () => {
        if (!hasInteracted) {
          hasInteracted = true;
          cameraHint.classList.add('show');
          setTimeout(() => {
            cameraHint.classList.remove('show');
          }, 3000);
        }
      };
      
      canvas.addEventListener('mousedown', showHintOnInteraction);
      canvas.addEventListener('touchstart', showHintOnInteraction);
    }
  }
});