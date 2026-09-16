'use strict';

/* ---------------------------------------------------------
   Sreenu Chandaka — Portfolio interactions
   --------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader && preloader.classList.add('is-hidden'), 350);
  });
  // Fallback in case 'load' already fired or is slow to fire
  setTimeout(() => preloader && preloader.classList.add('is-hidden'), 2500);

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
    navIndicator.style.width = target.offsetWidth + 'px';
    navIndicator.style.transform = `translateX(${target.offsetLeft - target.parentElement.offsetLeft}px)`;
  }

  function activatePage(pageName, sourceBtn){
    pages.forEach((p) => p.classList.toggle('active', p.dataset.page === pageName));
    navLinks.forEach((b) => b.classList.toggle('active', b.dataset.page === pageName));
    if (sourceBtn) moveIndicator(sourceBtn);
    if (pageViewport) pageViewport.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    revealVisible();
  }

  navLinks.forEach((btn) => {
    btn.addEventListener('click', () => activatePage(btn.dataset.page, btn));
  });

  // position indicator initially + on resize
  const initialActive = document.querySelector('.navbar-link.active') || navLinks[0];
  requestAnimationFrame(() => moveIndicator(initialActive));
  window.addEventListener('resize', () => {
    const current = document.querySelector('.navbar-link.active');
    moveIndicator(current);
  });

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
    const start = performance.now();

    function tick(now){
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
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
  function yearsSince(date){
    const now = new Date();
    let years = now.getFullYear() - date.getFullYear();
    const hasHadAnniversaryThisYear =
      now.getMonth() > date.getMonth() ||
      (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
    if (!hasHadAnniversaryThisYear) years -= 1;
    return Math.max(1, years);
  }
  const exp = yearsSince(CAREER_START);
  const expChip = document.getElementById('expChip');
  if (expChip) expChip.textContent = `${exp}+ yrs experience`;
  const expStat = document.querySelector('.stat-num[data-count="3"]');
  if (expStat) expStat.dataset.count = String(exp);

});
