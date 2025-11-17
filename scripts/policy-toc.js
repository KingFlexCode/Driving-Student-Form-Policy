// policy-toc.js

// Mobile toggle for the sidebar menu
(function () {
  const btn = document.querySelector('.toc-toggle');
  const list = document.getElementById('tocList');
  if (!btn || !list) return;

  btn.addEventListener('click', () => {
    const open = list.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();

// Active section highlight while scrolling
(function () {
  const links = Array.from(document.querySelectorAll('.toc-glass a[href^="#"]'));
  if (!links.length) return;

  const map = new Map();
  links.forEach((a) => {
    const id = a.getAttribute('href').slice(1);
    const sec = document.getElementById(id);
    if (sec) map.set(sec, a);

    // Close menu after clicking a link on mobile
    a.addEventListener('click', () => {
      const list = document.getElementById('tocList');
      if (list && list.classList.contains('open')) list.classList.remove('open');
      links.forEach((l) => l.classList.remove('is-active'));
      a.classList.add('is-active');
    });
  });

  if (!map.size) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = map.get(entry.target);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    },
    { rootMargin: '-30% 0px -60% 0px', threshold: 0.1 }
  );

  map.forEach((_, section) => observer.observe(section));
})();

// policy-toc.js
(function(){
  const btn = document.getElementById('toc-btn');
  const drawer = document.getElementById('tocDrawer');
  if(!btn || !drawer) return;

  // Toggle open/close
  function toggle(open){
    const isOpen = open !== undefined ? open : !drawer.classList.contains('open');
    drawer.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  }

  // --- place burger just outside the card's top-left ---
(function positionBurgerInit(){
  const btn   = document.getElementById('toc-btn');
  const card  = document.getElementById('policyCard');
  if(!btn || !card) return;

  const GAP = 16;         // distance from card edge
  const TOP_OFFSET = 16;  // distance from card top

  function positionBurger(){
    const rect = card.getBoundingClientRect();
    const btnW = btn.offsetWidth;

    // Page scroll offsets
    const sx = window.scrollX || window.pageXOffset;
    const sy = window.scrollY || window.pageYOffset;

    // Left of card minus button width minus gap
    let left = rect.left + sx - btnW - GAP;
    let top  = rect.top  + sy + TOP_OFFSET;

    // Safety: if too close to viewport edge (e.g., on small screens), keep it at 12px
    const MIN_LEFT = 12;
    if (left < MIN_LEFT) left = MIN_LEFT;

    btn.style.left = left + 'px';
    btn.style.top  = top  + 'px';
  }

  // Position on load, scroll, and resize
  const ro = new ResizeObserver(positionBurger);
  ro.observe(card);
  window.addEventListener('scroll', positionBurger, { passive: true });
  window.addEventListener('resize', positionBurger);
  window.addEventListener('load', positionBurger);
  // initial
  positionBurger();
})();

  btn.addEventListener('click', () => toggle());

  // Close when clicking a link
  drawer.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if(a){
      // allow smooth scroll, then close
      setTimeout(() => toggle(false), 250);
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') toggle(false);
  });

  // Active section highlighting
  const links = Array.from(drawer.querySelectorAll('a[href^="#"]'));
  const map = new Map();
  links.forEach(a => {
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    const el = document.getElementById(id);
    if(el) map.set(el, a);
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const link = map.get(entry.target);
      if(!link) return;
      if(entry.isIntersecting){
        links.forEach(l => l.classList.remove('is-active'));
        link.classList.add('is-active');
      }
    });
  }, {rootMargin: '-40% 0px -55% 0px', threshold: 0});

  map.forEach((_, el) => obs.observe(el));
})();

