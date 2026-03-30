/* ============================================================
   R. Dekkers — Portfolio Script
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. THEME TOGGLE — dark / light, persisted in localStorage
  ---------------------------------------------------------- */
  const html        = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const STORAGE_KEY = 'rdekkers-theme';

  function getStoredTheme() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    if (themeToggle) {
      themeToggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
      themeToggle.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  // Initialise theme: stored preference → system preference → dark fallback
  const initialTheme = getStoredTheme() || getSystemTheme() || 'dark';
  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = html.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Respond to OS-level theme changes (only if user hasn't manually chosen)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!getStoredTheme()) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });


  /* ----------------------------------------------------------
     2. AUTO-UPDATE COPYRIGHT YEAR
  ---------------------------------------------------------- */
  const yearEl = document.getElementById('copyrightYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  /* ----------------------------------------------------------
     3. SMOOTH SCROLL — for nav links (respects prefers-reduced-motion)
  ---------------------------------------------------------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      if (prefersReducedMotion) {
        target.scrollIntoView();
      } else {
        const navHeight  = document.querySelector('.site-header')?.offsetHeight ?? 0;
        const targetTop  = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top:      targetTop,
          behavior: 'smooth',
        });
      }

      // Close mobile menu if open
      closeMenu();

      // Move focus to section for keyboard users
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: true });
    });
  });


  /* ----------------------------------------------------------
     4. MOBILE NAV HAMBURGER TOGGLE
  ---------------------------------------------------------- */
  const hamburger = document.getElementById('navHamburger');
  const navLinks  = document.querySelector('.nav__links');

  function openMenu() {
    if (!hamburger || !navLinks) return;
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    navLinks.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!hamburger || !navLinks) return;
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    hamburger.classList.contains('is-open') ? closeMenu() : openMenu();
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
  }

  // Close menu when clicking outside the nav
  document.addEventListener('click', function (e) {
    if (
      navLinks?.classList.contains('is-open') &&
      !e.target.closest('.nav')
    ) {
      closeMenu();
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });


  /* ----------------------------------------------------------
     5. NAV SCROLL SHADOW — add class to header when scrolled
  ---------------------------------------------------------- */
  const siteHeader = document.querySelector('.site-header');

  function onScroll() {
    if (siteHeader) {
      siteHeader.classList.toggle('is-scrolled', window.scrollY > 20);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load


  /* ----------------------------------------------------------
     6. INTERSECTION OBSERVER — fade-in on scroll for sections
  ---------------------------------------------------------- */
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Add initial state style via JS (so non-JS users still see content)
  const animatedEls = document.querySelectorAll(
    '.section__header, .about__text, .about__skills, .card, .contact__intro, .contact__link'
  );

  if (!prefersReducedMotion) {
    animatedEls.forEach(function (el, i) {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition =
        'opacity 0.55s ease ' + (i * 0.06) + 's, ' +
        'transform 0.55s ease ' + (i * 0.06) + 's';
      observer.observe(el);
    });

    // When in-view, restore
    document.head.insertAdjacentHTML(
      'beforeend',
      '<style>.in-view { opacity: 1 !important; transform: none !important; }</style>'
    );
  }

})();
