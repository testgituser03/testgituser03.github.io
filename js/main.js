/**
 * PRODUCTION-READY PORTFOLIO JAVASCRIPT
 * Variant B: Modern & Interactive
 * 
 * Features:
 * - Mobile navigation with focus trap
 * - Dark mode toggle with localStorage persistence
 * - Intersection Observer for scroll animations
 * - Skill meter animations on scroll
 * - Animated statistics counter
 * - Project modal with accessible focus management
 * - Form validation
 * - Smooth scroll with reduced motion support
 * 
 * Architecture: IIFE pattern to avoid global namespace pollution
 */

(function() {
  'use strict';
  
  /* ==========================================
     CONFIGURATION & CONSTANTS
     ========================================== */
  const CONFIG = {
    // Animation durations (ms)
    ANIMATION_FAST: 150,
    ANIMATION_BASE: 200,
    ANIMATION_SLOW: 300,
    ANIMATION_BOUNCE: 600,
    
    // IntersectionObserver thresholds
    OBSERVER_THRESHOLD: 0.2,
    
    // Local storage keys
    STORAGE_THEME: 'portfolio-theme',
    
    // Selectors
    SELECTORS: {
      nav: '.nav',
      navToggle: '.nav__toggle',
      navMenu: '.nav__menu',
      navLinks: '.nav__link',
      themeToggle: '.theme-toggle',
      skillBars: '.skill-item__fill',
      statNumbers: '.stat-card__number',
      projectCards: '.project-card',
      modal: '#project-modal',
      modalClose: '[data-close-modal]',
      contactForm: '.contact__form',
      formStatus: '.form-status'
    }
  };
  
  /* ==========================================
     UTILITY FUNCTIONS
     ========================================== */
  
  /**
   * Query selector helper with error handling
   * @param {string} selector - CSS selector
   * @param {Element} context - Context element (default: document)
   * @returns {Element|null}
   */
  const $ = (selector, context = document) => context.querySelector(selector);
  
  /**
   * Query selector all helper
   * @param {string} selector - CSS selector
   * @param {Element} context - Context element (default: document)
   * @returns {NodeList}
   */
  const $$ = (selector, context = document) => context.querySelectorAll(selector);
  
  /**
   * Check if user prefers reduced motion
   * @returns {boolean}
   */
  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };
  
  /**
   * Debounce function to limit event handler calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function}
   */
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  /**
   * Linear interpolation for smooth animations
   * @param {number} start - Start value
   * @param {number} end - End value
   * @param {number} progress - Progress (0-1)
   * @returns {number}
   */
  const lerp = (start, end, progress) => {
    return start + (end - start) * progress;
  };
  
  /* ==========================================
     MOBILE NAVIGATION
     ========================================== */
  class MobileNav {
    constructor() {
      this.nav = $(CONFIG.SELECTORS.nav);
      this.toggle = $(CONFIG.SELECTORS.navToggle);
      this.menu = $(CONFIG.SELECTORS.navMenu);
      this.links = $$(CONFIG.SELECTORS.navLinks);
      this.isOpen = false;
      
      if (!this.toggle || !this.menu) return;
      
      this.init();
    }
    
    init() {
      // Toggle button click
      this.toggle.addEventListener('click', () => this.toggleMenu());
      
      // Close menu when clicking nav links
      this.links.forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            this.closeMenu();
          }
        });
      });
      
      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeMenu();
          this.toggle.focus();
        }
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (this.isOpen && 
            !this.menu.contains(e.target) && 
            !this.toggle.contains(e.target)) {
          this.closeMenu();
        }
      });
      
      // Handle resize
      window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 768 && this.isOpen) {
          this.closeMenu();
        }
      }, 250));
    }
    
    toggleMenu() {
      this.isOpen ? this.closeMenu() : this.openMenu();
    }
    
    openMenu() {
      this.isOpen = true;
      this.menu.classList.add('active');
      this.toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      
      // Focus trap
      this.trapFocus();
    }
    
    closeMenu() {
      this.isOpen = false;
      this.menu.classList.remove('active');
      this.toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    
    trapFocus() {
      // Get all focusable elements in menu
      const focusable = this.menu.querySelectorAll(
        'a[href], button:not([disabled])'
      );
      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];
      
      // Focus first element
      firstFocusable.focus();
      
      // Trap focus within menu
      const handleTab = (e) => {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      };
      
      this.menu.addEventListener('keydown', handleTab);
    }
  }
  
  /* ==========================================
     THEME TOGGLE (DARK/LIGHT MODE)
     ========================================== */
  class ThemeManager {
    constructor() {
      this.toggle = $(CONFIG.SELECTORS.themeToggle);
      this.currentTheme = this.getStoredTheme() || this.getPreferredTheme();
      
      if (!this.toggle) return;
      
      this.init();
    }
    
    init() {
      // Apply initial theme
      this.applyTheme(this.currentTheme);
      
      // Toggle button click
      this.toggle.addEventListener('click', () => this.switchTheme());
      
      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
          if (!this.getStoredTheme()) {
            this.applyTheme(e.matches ? 'dark' : 'light');
          }
        });
    }
    
    getPreferredTheme() {
      return window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
    }
    
    getStoredTheme() {
      return localStorage.getItem(CONFIG.STORAGE_THEME);
    }
    
    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      this.currentTheme = theme;
      localStorage.setItem(CONFIG.STORAGE_THEME, theme);
      
      // Update aria-label
      const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      this.toggle.setAttribute('aria-label', label);
    }
    
    switchTheme() {
      const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      this.applyTheme(newTheme);
    }
  }
  
  /* ==========================================
     INTERSECTION OBSERVER FOR ANIMATIONS
     ========================================== */
  class ScrollAnimations {
    constructor() {
      this.animatedElements = $$('[data-animate]');
      this.init();
    }
    
    init() {
      if (!('IntersectionObserver' in window)) {
        // Fallback: show all elements immediately
        this.animatedElements.forEach(el => el.classList.add('animated'));
        return;
      }
      
      const options = {
        threshold: CONFIG.OBSERVER_THRESHOLD,
        rootMargin: '0px 0px -50px 0px'
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            
            // Unobserve after animation (performance)
            observer.unobserve(entry.target);
          }
        });
      }, options);
      
      this.animatedElements.forEach(el => observer.observe(el));
    }
  }
  
  /* ==========================================
     SKILL METER ANIMATIONS
     ========================================== */
  class SkillAnimations {
    constructor() {
      this.skillBars = $$(CONFIG.SELECTORS.skillBars);
      this.animated = new Set();
      this.init();
    }
    
    init() {
      if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
        // Fallback: show all bars immediately
        this.skillBars.forEach(bar => bar.classList.add('animated'));
        return;
      }
      
      const options = {
        threshold: 0.5,
        rootMargin: '0px'
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animated.has(entry.target)) {
            this.animateSkillBar(entry.target);
            this.animated.add(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, options);
      
      this.skillBars.forEach(bar => observer.observe(bar));
    }
    
    animateSkillBar(bar) {
      // Add animated class to trigger CSS transition
      setTimeout(() => {
        bar.classList.add('animated');
      }, 100);
    }
  }
  
  /* ==========================================
     ANIMATED COUNTER FOR STATISTICS
     ========================================== */
  class CounterAnimations {
    constructor() {
      this.counters = $$(CONFIG.SELECTORS.statNumbers);
      this.animated = new Set();
      this.init();
    }
    
    init() {
      if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
        // Fallback: show final numbers immediately
        this.counters.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-count'));
          counter.textContent = target;
        });
        return;
      }
      
      const options = {
        threshold: 0.5
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animated.has(entry.target)) {
            this.animateCounter(entry.target);
            this.animated.add(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, options);
      
      this.counters.forEach(counter => observer.observe(counter));
    }
    
    animateCounter(counter) {
      const target = parseInt(counter.getAttribute('data-count'));
      const duration = 2000; // 2 seconds
      const startTime = performance.now();
      
      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const current = Math.floor(lerp(0, target, easeProgress));
        counter.textContent = current;
        
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };
      
      requestAnimationFrame(updateCounter);
    }
  }
  
  /* ==========================================
     PROJECT MODAL
     ========================================== */
  class ProjectModal {
    constructor() {
      this.modal = $(CONFIG.SELECTORS.modal);
      this.triggers = $$('.btn--icon[aria-label*="Quick view"]');
      this.previousFocus = null;
      
      if (!this.modal) return;
      
      this.init();
    }
    
    init() {
      // Open modal on trigger click
      this.triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          const card = trigger.closest('.project-card');
          this.openModal(card);
        });
      });
      
      // Close modal on close button or overlay click
      const closeButtons = $$(CONFIG.SELECTORS.modalClose);
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => this.closeModal());
      });
      
      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !this.modal.hasAttribute('hidden')) {
          this.closeModal();
        }
      });
    }
    
    openModal(card) {
      // Extract card data
      const title = card.querySelector('.project-card__title').textContent;
      const description = card.querySelector('.project-card__description').textContent;
      const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent);
      
      // Populate modal
      const modalContent = $('.modal__content', this.modal);
      modalContent.innerHTML = `
        <h2 id="modal-title">${title}</h2>
        <p>${description}</p>
        <div class="project-card__tags">
          ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <p style="margin-top: 2rem; color: var(--color-text-secondary);">
          Click "View Details" to see the full project case study.
        </p>
      `;
      
      // Store previous focus
      this.previousFocus = document.activeElement;
      
      // Show modal
      this.modal.removeAttribute('hidden');
      this.modal.setAttribute('aria-hidden', 'false');
      
      // Focus first focusable element
      const firstFocusable = $('.modal__close', this.modal);
      if (firstFocusable) firstFocusable.focus();
      
      // Trap focus
      this.trapFocus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
      this.modal.setAttribute('hidden', '');
      this.modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      
      // Return focus to trigger
      if (this.previousFocus) {
        this.previousFocus.focus();
      }
    }
    
    trapFocus() {
      const focusable = this.modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];
      
      const handleTab = (e) => {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      };
      
      this.modal.addEventListener('keydown', handleTab);
    }
  }
  
  /* ==========================================
     CONTACT FORM VALIDATION
     ========================================== */
  class ContactForm {
    constructor() {
      this.form = $(CONFIG.SELECTORS.contactForm);
      
      if (!this.form) return;
      
      this.init();
    }
    
    init() {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
      
      // Real-time validation
      const inputs = this.form.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
      });
    }
    
    validateField(field) {
      const value = field.value.trim();
      let isValid = true;
      let message = '';
      
      if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'This field is required';
      } else if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          message = 'Please enter a valid email address';
        }
      }
      
      // Update field appearance
      if (isValid) {
        field.style.borderColor = 'var(--color-border)';
      } else {
        field.style.borderColor = '#ef4444';
      }
      
      return { isValid, message };
    }
    
    handleSubmit(e) {
      // Note: Form uses mailto action as per requirements
      // This function validates before allowing submission
      
      const inputs = this.form.querySelectorAll('input, textarea');
      let isFormValid = true;
      let errors = [];
      
      inputs.forEach(input => {
        const validation = this.validateField(input);
        if (!validation.isValid) {
          isFormValid = false;
          errors.push(`${input.name}: ${validation.message}`);
        }
      });
      
      if (!isFormValid) {
        e.preventDefault();
        this.showStatus('error', 'Please fix the errors and try again.');
        return false;
      }
      
      // If valid, show success message
      this.showStatus('success', 'Opening your email client...');
    }
    
    showStatus(type, message) {
      const status = $(CONFIG.SELECTORS.formStatus);
      if (!status) return;
      
      status.className = `form-status form-status--${type}`;
      status.textContent = message;
      status.setAttribute('role', 'alert');
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        status.className = 'form-status';
        status.textContent = '';
      }, 5000);
    }
  }
  
  /* ==========================================
     SMOOTH SCROLL
     ========================================== */
  class SmoothScroll {
    constructor() {
      this.init();
    }
    
    init() {
      // Smooth scroll for anchor links
      $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const href = anchor.getAttribute('href');
          
          // Ignore if href is just "#"
          if (href === '#') return;
          
          e.preventDefault();
          
          const target = $(href);
          if (!target) return;
          
          // Calculate offset (account for fixed nav)
          const nav = $(CONFIG.SELECTORS.nav);
          const navHeight = nav ? nav.offsetHeight : 0;
          const targetPosition = target.offsetTop - navHeight - 20;
          
          // Smooth scroll
          window.scrollTo({
        top: targetPosition,
            behavior: prefersReducedMotion() ? 'auto' : 'smooth'
          });
          
          // Focus target for accessibility
          target.setAttribute('tabindex', '-1');
          target.focus();
        });
      });
    }
  }
  
  /* ==========================================
     IMAGE LAZY LOADING OPTIMIZATION
     ========================================== */
  class ImageLoader {
    constructor() {
      this.images = $$('img[loading="lazy"]');
      this.init();
    }
    
    init() {
      // Hide skeleton when image loads
      this.images.forEach(img => {
        if (img.complete) {
          this.onImageLoad(img);
        } else {
          img.addEventListener('load', () => this.onImageLoad(img));
          img.addEventListener('error', () => this.onImageError(img));
        }
      });
    }
    
    onImageLoad(img) {
      const skeleton = img.parentElement.querySelector('.skeleton');
      if (skeleton) {
        skeleton.style.display = 'none';
      }
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease-in';
      setTimeout(() => {
        img.style.opacity = '1';
      }, 10);
    }
    
    onImageError(img) {
      const skeleton = img.parentElement.querySelector('.skeleton');
      if (skeleton) {
        skeleton.style.display = 'none';
      }
      // Optionally add error placeholder
      img.alt = 'Image failed to load';
    }
  }
  
  /* ==========================================
     ENTERPRISE NAVIGATION EFFECTS
     ========================================== */
  class NavigationEffects {
    constructor() {
      this.nav = $(CONFIG.SELECTORS.nav);
      this.init();
    }
    
    init() {
      if (!this.nav) return;
      
      // Add scrolled class on scroll
      window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
          this.nav.classList.add('scrolled');
        } else {
          this.nav.classList.remove('scrolled');
        }
      });
      
      // Initial check
      if (window.scrollY > 50) {
        this.nav.classList.add('scrolled');
      }
    }
  }
  
  /* ==========================================
     PARALLAX EFFECT ON HERO
     ========================================== */
  class ParallaxEffect {
    constructor() {
      this.hero = $('.hero');
      this.heroContent = $('.hero__content');
      this.heroVisual = $('.hero__visual');
      this.init();
    }
    
    init() {
      if (!this.hero || prefersReducedMotion()) return;
      
      window.addEventListener('scroll', () => {
        requestAnimationFrame(() => this.updateParallax());
      });
    }
    
    updateParallax() {
      const scrolled = window.pageYOffset;
      const heroHeight = this.hero.offsetHeight;
      
      if (scrolled < heroHeight) {
        const opacity = 1 - (scrolled / heroHeight);
        const translateY = scrolled * 0.4;
        
        if (this.heroContent) {
          this.heroContent.style.transform = `translateY(${translateY}px)`;
          this.heroContent.style.opacity = opacity;
        }
        
        if (this.heroVisual) {
          this.heroVisual.style.transform = `translateY(${-translateY * 0.5}px)`;
        }
      }
    }
  }
  
  /* ==========================================
     MAGNETIC BUTTON EFFECT (ENTERPRISE)
     ========================================== */
  class MagneticButtons {
    constructor() {
      this.buttons = $$('.btn--primary');
      this.init();
    }
    
    init() {
      if (prefersReducedMotion()) return;
      
      this.buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => this.handleMouseMove(e, btn));
        btn.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, btn));
      });
    }
    
    handleMouseMove(e, btn) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const moveX = x * 0.3;
      const moveY = y * 0.3;
      
      btn.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
    }
    
    handleMouseLeave(e, btn) {
      btn.style.transform = 'translate(0, 0) scale(1)';
      btn.style.transition = 'transform 0.3s ease';
      setTimeout(() => {
        btn.style.transition = '';
      }, 300);
    }
  }
  
  /* ==========================================
     SMOOTH REVEAL FOR SECTIONS
     ========================================== */
  class SmoothReveal {
    constructor() {
      this.sections = $$('.section');
      this.init();
    }
    
    init() {
      if (!('IntersectionObserver' in window)) return;
      
      const options = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      }, options);
      
      this.sections.forEach(section => {
        if (!prefersReducedMotion()) {
          section.style.opacity = '0';
          section.style.transform = 'translateY(40px)';
          section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        }
        observer.observe(section);
      });
    }
  }
  
  
  /* ==========================================
     INITIALIZATION
     ========================================== */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }
  }
  
  function initApp() {
    new MobileNav();
    new ThemeManager();
    new ScrollAnimations();
    new SkillAnimations();
    new CounterAnimations();
    new ProjectModal();
    new ContactForm();
    new SmoothScroll();
    new ImageLoader();
    new NavigationEffects();
    new ParallaxEffect();
    new MagneticButtons();
    new SmoothReveal();
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('✅ Portfolio initialized successfully');
      console.log('✨ Enterprise features enabled');
    }
  }
  
  init();
  
})();
