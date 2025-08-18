// Pokemon Card Effects - Standalone JavaScript for specific card elements

class PokemonCardEffects {
  constructor(options = {}) {
    this.cards = [];
    this.activeCard = null;
    this.options = {
      selector: options.selector || '.pokemon-card',
      autoInit: options.autoInit !== false,
      enableTouch: options.enableTouch !== false,
      enableKeyboard: options.enableKeyboard !== false,
      ...options
    };
    
    if (this.options.autoInit) {
      this.init();
    }
  }

  init() {
    console.log('Initializing Pokemon Card Effects...');
    this.setupCards();
    this.bindGlobalEvents();
    console.log(`${this.cards.length} cards initialized with effects`);
  }

  setupCards() {
    const cardElements = document.querySelectorAll(this.options.selector);
    
    cardElements.forEach((cardElement, index) => {
      this.transformCard(cardElement, index);
    });
  }

  transformCard(cardElement, index) {
    // Add necessary classes
    cardElement.classList.add('interactive');
    
    // Determine card type
    const cardType = this.getCardType(cardElement, index);
    if (cardType) {
      cardElement.classList.add(cardType);
    }

    // Check if structure already exists
    let rotator = cardElement.querySelector('.card__rotator');
    let inner = cardElement.querySelector('.card__inner');
    let shine = cardElement.querySelector('.card__shine');
    let glare = cardElement.querySelector('.card__glare');

    // If structure doesn't exist, create it
    if (!rotator) {
      const originalContent = cardElement.innerHTML;
      
      cardElement.innerHTML = `
        <div class="card__rotator">
          <div class="card__inner">
            ${originalContent}
            <div class="card__shine"></div>
            <div class="card__glare"></div>
          </div>
        </div>
      `;

      rotator = cardElement.querySelector('.card__rotator');
      inner = cardElement.querySelector('.card__inner');
      shine = cardElement.querySelector('.card__shine');
      glare = cardElement.querySelector('.card__glare');
    }

    // Initialize card data
    const cardData = {
      element: cardElement,
      rotator: rotator,
      inner: inner,
      shine: shine,
      glare: glare,
      isActive: false,
      isInteracting: false,
      originalContent: cardElement.innerHTML
    };

    this.cards.push(cardData);
    this.bindCardEvents(cardData);
  }

  getCardType(cardElement, index) {
    // Check for existing classes first
    if (cardElement.classList.contains('holo')) return 'holo';
    if (cardElement.classList.contains('rainbow')) return 'rainbow';
    if (cardElement.classList.contains('gold')) return 'gold';
    
    // Check content for auto-detection
    const cardTitle = cardElement.querySelector('.card-title, h1, h2, h3, h4, h5, h6')?.textContent?.toLowerCase() || '';
    const cardText = cardElement.textContent.toLowerCase();
    
    if (cardTitle.includes('premium') || cardTitle.includes('special') || 
        cardText.includes('rainbow') || cardText.includes('premium')) {
      return 'rainbow';
    } else if (cardTitle.includes('gold') || cardTitle.includes('secret') || 
               cardText.includes('gold') || cardText.includes('secret')) {
      return 'gold';
    } else {
      // Cycle through types based on index
      const types = ['holo', 'rainbow', 'gold'];
      return types[index % types.length];
    }
  }

  bindGlobalEvents() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.resetAllCards();
      }
    });

    window.addEventListener('resize', () => {
      this.resetAllCards();
    });
  }

  bindCardEvents(cardData) {
    const { rotator } = cardData;

    // Mouse events
    rotator.addEventListener('mousemove', (e) => this.handleMouseMove(e, cardData));
    rotator.addEventListener('mouseenter', (e) => this.handleMouseEnter(e, cardData));
    rotator.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, cardData));
    
    // Touch events
    if (this.options.enableTouch) {
      rotator.addEventListener('touchstart', (e) => this.handleTouchStart(e, cardData), { passive: false });
      rotator.addEventListener('touchmove', (e) => this.handleTouchMove(e, cardData), { passive: false });
      rotator.addEventListener('touchend', (e) => this.handleTouchEnd(e, cardData));
    }
    
    // Click events
    rotator.addEventListener('click', (e) => this.handleClick(e, cardData));
    
    // Keyboard events
    if (this.options.enableKeyboard) {
      rotator.addEventListener('focus', (e) => this.handleFocus(e, cardData));
      rotator.addEventListener('blur', (e) => this.handleBlur(e, cardData));
      rotator.addEventListener('keydown', (e) => this.handleKeydown(e, cardData));
    }

    // Make rotator interactive
    rotator.setAttribute('tabindex', '0');
    rotator.setAttribute('role', 'button');
    rotator.setAttribute('aria-label', 'Interactive holographic card');
  }

  handleMouseMove(e, cardData) {
    if (!cardData.isInteracting && !cardData.isActive) return;
    this.updateCardEffects(e, cardData);
  }

  handleMouseEnter(e, cardData) {
    console.log('Mouse enter detected on card');
    cardData.isInteracting = true;
    cardData.element.classList.add('interacting');
    this.updateCardEffects(e, cardData);
  }

  handleMouseLeave(e, cardData) {
    if (!cardData.isActive) {
      this.resetCard(cardData);
    }
  }

  handleTouchStart(e, cardData) {
    e.preventDefault();
    cardData.isInteracting = true;
    cardData.element.classList.add('interacting');
    this.updateCardEffects(e.touches[0], cardData);
  }

  handleTouchMove(e, cardData) {
    e.preventDefault();
    if (cardData.isInteracting) {
      this.updateCardEffects(e.touches[0], cardData);
    }
  }

  handleTouchEnd(e, cardData) {
    if (!cardData.isActive) {
      setTimeout(() => this.resetCard(cardData), 300);
    }
  }

  handleClick(e, cardData) {
    e.preventDefault();
    if (cardData.isActive) {
      this.deactivateCard(cardData);
    } else {
      this.activateCard(cardData);
    }
  }

  handleFocus(e, cardData) {
    cardData.isInteracting = true;
    cardData.element.classList.add('interacting');
    // Set default hover position for keyboard users
    this.updateCardEffects(e, cardData, { x: 30, y: 30 });
  }

  handleBlur(e, cardData) {
    if (!cardData.isActive) {
      this.resetCard(cardData);
    }
  }

  handleKeydown(e, cardData) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.handleClick(e, cardData);
    } else if (e.key === 'Escape' && cardData.isActive) {
      this.deactivateCard(cardData);
    }
  }

  updateCardEffects(e, cardData, overridePosition = null) {
    const rect = cardData.rotator.getBoundingClientRect();
    
    let clientX, clientY;
    if (overridePosition) {
      clientX = rect.left + (rect.width * overridePosition.x / 100);
      clientY = rect.top + (rect.height * overridePosition.y / 100);
    } else {
      clientX = e.clientX || e.pageX;
      clientY = e.clientY || e.pageY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const percentX = this.clamp((x / rect.width) * 100, 0, 100);
    const percentY = this.clamp((y / rect.height) * 100, 0, 100);
    
    const centerX = percentX - 50;
    const centerY = percentY - 50;
    const distanceFromCenter = Math.sqrt(centerX * centerX + centerY * centerY) / 50;
    
    // Original rotation range for responsive movement
    const rotateX = this.map(centerY, -50, 50, 12, -12);
    const rotateY = this.map(centerX, -50, 50, -12, 12);
    
    this.updateCSSVariables(cardData.element, {
      '--pointer-x': `${percentX}%`,
      '--pointer-y': `${percentY}%`,
      '--pointer-from-center': this.clamp(distanceFromCenter, 0, 1),
      '--pointer-from-top': percentY / 100,
      '--pointer-from-left': percentX / 100,
      '--rotate-x': `${rotateY}deg`,
      '--rotate-y': `${rotateX}deg`,
      '--background-x': `${this.map(percentX, 0, 100, 35, 65)}%`,
      '--background-y': `${this.map(percentY, 0, 100, 35, 65)}%`,
      '--card-opacity': cardData.isInteracting || cardData.isActive ? '1' : '0.045'
    });
  }

  activateCard(cardData) {
    if (this.activeCard && this.activeCard !== cardData) {
      this.deactivateCard(this.activeCard);
    }
    
    cardData.isActive = true;
    cardData.isInteracting = true;
    this.activeCard = cardData;
    
    cardData.element.classList.add('active');
    cardData.element.classList.add('interacting');
    
    this.updateCSSVariables(cardData.element, {
      '--card-scale': '1.1',
      '--translate-y': '-15px',
      '--card-opacity': '1'
    });
  }

  deactivateCard(cardData) {
    cardData.isActive = false;
    this.activeCard = null;
    
    cardData.element.classList.remove('active');
    this.resetCard(cardData);
  }

  resetCard(cardData, delay = 300) {
    setTimeout(() => {
      cardData.isInteracting = false;
      cardData.element.classList.remove('interacting');
      
      this.updateCSSVariables(cardData.element, {
        '--pointer-x': '50%',
        '--pointer-y': '50%',
        '--pointer-from-center': '0',
        '--pointer-from-top': '0.5',
        '--pointer-from-left': '0.5',
        '--rotate-x': '0deg',
        '--rotate-y': '0deg',
        '--background-x': '50%',
        '--background-y': '50%',
        '--card-opacity': '0.045',
        '--card-scale': '1',
        '--translate-x': '0px',
        '--translate-y': '0px'
      });
    }, delay);
  }

  resetAllCards() {
    this.cards.forEach(cardData => {
      if (cardData.isActive) {
        this.deactivateCard(cardData);
      } else {
        this.resetCard(cardData, 0);
      }
    });
  }

  updateCSSVariables(element, variables) {
    Object.entries(variables).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  }

  // Utility methods
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  }

  // Public API methods
  addCard(element, type = null) {
    if (type) {
      element.classList.add(type);
    }
    this.transformCard(element, this.cards.length);
  }

  removeCard(element) {
    const cardData = this.cards.find(card => card.element === element);
    if (cardData) {
      if (cardData.isActive) {
        this.deactivateCard(cardData);
      }
      element.innerHTML = cardData.originalContent;
      element.classList.remove('interactive', 'holo', 'rainbow', 'gold');
      this.cards = this.cards.filter(card => card !== cardData);
    }
  }

  destroy() {
    this.resetAllCards();
    this.cards.forEach(cardData => {
      this.removeCard(cardData.element);
    });
    this.cards = [];
  }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelectorAll('.pokemon-card').length > 0) {
      window.pokemonCardEffects = new PokemonCardEffects();
    }
  });
} else {
  // DOM is already ready
  if (document.querySelectorAll('.pokemon-card').length > 0) {
    window.pokemonCardEffects = new PokemonCardEffects();
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PokemonCardEffects;
}
if (typeof window !== 'undefined') {
  window.PokemonCardEffects = PokemonCardEffects;
}
