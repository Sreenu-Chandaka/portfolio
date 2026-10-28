'use strict';

/* ---------------------------------------------------------
   Sreenu Chandaka — Portfolio interactions
   --------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  // Show content as soon as the DOM is ready — don't wait for every image.
  setTimeout(() => preloader && preloader.classList.add('is-hidden'), 150);

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById('progressBar');
  const activeScroller = () => document.querySelector('.page.active') || document.documentElement;

  function updateProgress(){
    const el = activeScroller();
    const scrollTop = el === document.documentElement ? window.scrollY : el.scrollTop;
    const scrollHeight = (el.scrollHeight || document.documentElement.scrollHeight) - window.innerHeight;
    const pct = scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- Custom cursor ---------- */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (hasFinePointer && cursorDot && cursorRing) {
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    window.addEventListener('mousemove', (e) => {
      if (!document.body.classList.contains('has-cursor')) {
        document.body.classList.add('has-cursor');
        ringX = e.clientX; ringY = e.clientY;
      }
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });
    function ringLoop(){
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(ringLoop);
    }
    ringLoop();

    document.querySelectorAll('a, button, input, textarea').forEach((el) => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-active'));
    });
  }

  /* ---------- Sidebar contacts toggle ---------- */
  const sidebarBtn = document.querySelector('[data-sidebar-btn]');
  const sidebarMore = document.querySelector('[data-sidebar-more]');
  if (sidebarBtn && sidebarMore) {
    sidebarBtn.addEventListener('click', () => {
      const isOpen = sidebarMore.classList.toggle('is-open');
      sidebarBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  /* ---------- Tab navigation ---------- */
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const pages = document.querySelectorAll('[data-page]');
  const navIndicator = document.getElementById('navIndicator');
  const pageViewport = document.querySelector('.page-viewport');

  function moveIndicator(target){
    if (!navIndicator || !target) return;
    // target.offsetLeft is already relative to .navbar's padding edge, since
    // .navbar (position: sticky) is target's offsetParent — do not subtract
    // navbar's own offsetLeft, which lives in a different coordinate space.
    navIndicator.style.width = target.offsetWidth + 'px';
    navIndicator.style.transform = `translateX(${target.offsetLeft}px)`;
  }

  // Mobile: show a fade when the tab bar overflows, and keep the active tab in view.
  const navbarEl = document.querySelector('.navbar');
  function updateNavOverflow(){
    if (!navbarEl) return;
    const scrollable = navbarEl.scrollWidth > navbarEl.clientWidth + 2;
    navbarEl.classList.toggle('is-scrollable', scrollable);
    navbarEl.classList.toggle('at-end', navbarEl.scrollLeft + navbarEl.clientWidth >= navbarEl.scrollWidth - 2);
  }
  if (navbarEl) {
    navbarEl.addEventListener('scroll', updateNavOverflow, { passive: true });
    window.addEventListener('resize', updateNavOverflow);
    window.addEventListener('load', updateNavOverflow);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateNavOverflow);
    updateNavOverflow();
  }

  function activatePage(pageName, sourceBtn){
    pages.forEach((p) => p.classList.toggle('active', p.dataset.page === pageName));
    navLinks.forEach((b) => b.classList.toggle('active', b.dataset.page === pageName));
    if (sourceBtn) {
      moveIndicator(sourceBtn);
      if (navbarEl && navbarEl.scrollWidth > navbarEl.clientWidth) {
        const left = sourceBtn.offsetLeft - (navbarEl.clientWidth - sourceBtn.offsetWidth) / 2;
        navbarEl.scrollTo({ left: Math.max(0, left), behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }
    if (pageViewport) pageViewport.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    revealVisible();
  }

  // Deep links: #resume, #portfolio … work, and the back button follows tabs.
  const pageNames = Array.from(navLinks).map((b) => b.dataset.page);
  function goTo(pageName, push){
    if (!pageNames.includes(pageName)) pageName = 'about';
    const btn = Array.from(navLinks).find((b) => b.dataset.page === pageName);
    activatePage(pageName, btn);
    if (push) history.pushState(null, '', pageName === 'about' ? location.pathname : '#' + pageName);
  }
  navLinks.forEach((btn) => {
    btn.addEventListener('click', () => goTo(btn.dataset.page, true));
  });
  document.querySelectorAll('[data-goto]').forEach((el) => {
    el.addEventListener('click', () => goTo(el.dataset.goto, true));
  });
  window.addEventListener('popstate', () => goTo(location.hash.slice(1) || 'about', false));

  // Position the indicator initially, after fonts/layout settle, and on resize.
  const initialActive = document.querySelector('.navbar-link.active') || navLinks[0];
  const settleIndicator = () => moveIndicator(document.querySelector('.navbar-link.active') || initialActive);
  requestAnimationFrame(settleIndicator);
  window.addEventListener('load', settleIndicator);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(settleIndicator);
  window.addEventListener('resize', settleIndicator);

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = ('IntersectionObserver' in window)
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 })
    : null;

  function revealVisible(){
    if (revealObserver) {
      revealEls.forEach((el) => revealObserver.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }
  }
  revealVisible();

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  function animateCount(el){
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const fmt = (v) => el.dataset.format === 'group'
      ? Math.round(v).toLocaleString('en-US')
      : v.toFixed(decimals);
    const start = performance.now();

    function tick(now){
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = fmt(value) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(target) + suffix;
    }
    if (reduceMotion) {
      el.textContent = fmt(target) + suffix;
    } else {
      requestAnimationFrame(tick);
    }
  }
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Portfolio filter ---------- */
  const filterBtns = document.querySelectorAll('[data-filter-btn]');
  const projectItems = document.querySelectorAll('[data-filter-item]');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      projectItems.forEach((item) => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* ---------- Contact form ---------- */
  const form = document.querySelector('[data-form]');
  const formInputs = document.querySelectorAll('[data-form-input]');
  const formBtn = document.querySelector('[data-form-btn]');
  const formStatus = document.querySelector('[data-form-status]');

  function checkFormValidity(){
    if (!form || !formBtn) return;
    formBtn.disabled = !form.checkValidity();
  }
  formInputs.forEach((input) => input.addEventListener('input', checkFormValidity));
  checkFormValidity();

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) return;

      formBtn.disabled = true;
      const label = formBtn.querySelector('.form-btn-label');
      const originalLabel = label ? label.textContent : '';
      if (label) label.textContent = 'Sending…';
      if (formStatus) { formStatus.textContent = ''; formStatus.className = 'form-status'; }

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success !== false) {
          if (formStatus) { formStatus.textContent = 'Message sent — thanks, I\'ll reply soon.'; formStatus.classList.add('is-ok'); }
          form.reset();
        } else {
          throw new Error(data.message || 'Something went wrong');
        }
      } catch (err) {
        if (formStatus) { formStatus.textContent = 'Could not send right now — please email me directly.'; formStatus.classList.add('is-error'); }
      } finally {
        if (label) label.textContent = originalLabel;
        checkFormValidity();
      }
    });
  }

  /* ---------- Theme toggle ---------- */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('sc-theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      if (next === 'dark') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', 'light');
      localStorage.setItem('sc-theme', next);
    });
  }

  /* ---------- Back to top ---------- */
  const toTop = document.getElementById('toTop');
  function toggleToTop(){
    if (!toTop) return;
    toTop.classList.toggle('is-visible', window.scrollY > 400);
  }
  window.addEventListener('scroll', toggleToTop, { passive: true });
  toggleToTop();
  if (toTop) {
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }

  /* ---------- Experience calculator ----------
     Recomputes "years of experience" from a fixed career-start date
     so the badge and stat stay accurate without manual edits. */
  const CAREER_START = new Date('2023-02-01'); // first professional role (Orotron internship)
  // Rounded down to the nearest half year, e.g. 3.5
  function yearsSince(date){
    const now = new Date();
    const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())
      - (now.getDate() < date.getDate() ? 1 : 0);
    return Math.max(1, Math.floor(months / 6) / 2);
  }
  const exp = yearsSince(CAREER_START);
  const expLabel = Number.isInteger(exp) ? String(exp) : exp.toFixed(1);
  const expChip = document.getElementById('expChip');
  if (expChip) expChip.textContent = `${expLabel}+ yrs experience`;
  const expStat = document.querySelector('.stat-num[data-count="3"]');
  if (expStat) { expStat.dataset.count = String(exp); expStat.dataset.decimals = Number.isInteger(exp) ? '0' : '1'; }

  // Open the tab named in the URL (e.g. …/portfolio/#resume) once everything is wired up.
  if (location.hash.length > 1) goTo(location.hash.slice(1), false);

});
