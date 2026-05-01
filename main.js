/* Father Fats Public House — main.js
   Vanilla ES modules, no build step required
   ----------------------------------------------------------------
   Sections:
   1. Loader
   2. Parallax hero
   3. Nav: hamburger, scroll-active
   4. Fade-in on scroll (IntersectionObserver)
   5. Proof bar count-up
   6. Gallery lightbox
*/

'use strict';

// ============================================================
// 1. LOADER
// ============================================================
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  // Total loader duration: ~1.2s (logo 0.4s + bar 0.6s + fadeout 0.2s)
  // Add .done class after bar completes to trigger fadeout
  setTimeout(() => {
    loader.classList.add('done');
  }, 1050);

  // After fadeout, remove from DOM so it doesn't block interactions
  setTimeout(() => {
    loader.style.display = 'none';
  }, 1350);
})();


// ============================================================
// 2. PARALLAX HERO (0.3x scroll rate via JS transform)
// ============================================================
(function initParallax() {
  const bg = document.getElementById('heroBg');
  if (!bg) return;

  // Use requestAnimationFrame to throttle
  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    bg.style.transform = `translateY(${scrollY * 0.3}px)`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
})();


// ============================================================
// 3. NAV: hamburger, overlay close, section active state
// ============================================================
(function initNav() {
  const toggle   = document.getElementById('navToggle');
  const overlay  = document.getElementById('navOverlay');
  const closeBtn = document.getElementById('overlayClose');
  const body     = document.body;

  if (!toggle || !overlay) return;

  function openOverlay() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    body.style.overflow = 'hidden';
  }

  function closeOverlay() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
  }

  toggle.addEventListener('click', openOverlay);
  if (closeBtn) closeBtn.addEventListener('click', closeOverlay);

  // Close on overlay link click
  overlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeOverlay);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeOverlay();
  });

  // Active nav link based on scroll position
  const sections   = ['hero', 'menu', 'about', 'drinks', 'find-us'];
  const navLinks   = document.querySelectorAll('.nav-links a[data-section]');

  function updateActiveLink() {
    let current = '';
    const scrollY = window.scrollY + 120;

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && scrollY >= el.offsetTop) current = id;
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
})();


// ============================================================
// 4. FADE-IN ON SCROLL (IntersectionObserver)
// ============================================================
(function initFadeIn() {
  const targets = document.querySelectorAll('.fade-in');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  targets.forEach(el => observer.observe(el));
})();


// ============================================================
// 5. PROOF BAR COUNT-UP ANIMATION
// ============================================================
(function initCountUp() {
  const counters = document.querySelectorAll('[data-count-to]');
  if (!counters.length) return;

  const DURATION = 800;

  function animateCount(el) {
    const target   = parseFloat(el.dataset.countTo);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();


// ============================================================
// 6. GALLERY LIGHTBOX
// ============================================================
(function initLightbox() {
  const grid       = document.getElementById('galleryGrid');
  const lightbox   = document.getElementById('lightbox');
  const lbImg      = document.getElementById('lightboxImg');
  const lbClose    = document.getElementById('lightboxClose');
  const lbPrev     = document.getElementById('lightboxPrev');
  const lbNext     = document.getElementById('lightboxNext');

  if (!grid || !lightbox || !lbImg) return;

  const items = Array.from(grid.querySelectorAll('.masonry-item img'));
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    const src = items[index].src;
    const alt = items[index].alt;
    lbImg.src  = src;
    lbImg.alt  = alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Clear src after transition to avoid flash on reopen
    setTimeout(() => { lbImg.src = ''; }, 260);
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    lbImg.src = items[currentIndex].src;
    lbImg.alt = items[currentIndex].alt;
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % items.length;
    lbImg.src = items[currentIndex].src;
    lbImg.alt = items[currentIndex].alt;
  }

  // Attach click to each gallery item
  items.forEach((img, i) => {
    img.closest('.masonry-item').addEventListener('click', () => openLightbox(i));
  });

  lbClose.addEventListener('click', closeLightbox);

  lbPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    showPrev();
  });

  lbNext.addEventListener('click', (e) => {
    e.stopPropagation();
    showNext();
  });

  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   showPrev();
    if (e.key === 'ArrowRight')  showNext();
  });
})();
