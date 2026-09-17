// ============================================================
// Fahrschule Low Fly — interactions
// ============================================================

// real employee photos — imported so Vite resolves/hashes/copies them into
// the production build (a data-photo string alone wouldn't be picked up)
import haciPhoto from './assets/mitarbeiter/haci.webp';
import melissaPhoto from './assets/mitarbeiter/melissa.webp';
import eliasPhoto from './assets/mitarbeiter/elias.webp';
import biancaPhoto from './assets/mitarbeiter/bianca.webp';

document.getElementById('year').textContent = new Date().getFullYear();

// known real photos by team-block key; anyone missing here (e.g. Sandra, no
// photo yet) falls through to their data-photo attribute, which 404s
// gracefully into the initials avatar
const knownTeamPhotos = { haci: haciPhoto, melissa: melissaPhoto, elias: eliasPhoto, bianca: biancaPhoto };

/* ---------- team per-card photos (mobile): every block shows its own photo
   inline, since on mobile the list scrolls but nothing stays pinned to
   preview it like on desktop ---------- */
document.querySelectorAll('.team-block-img').forEach((img) => {
  const block = img.closest('.team-block');
  img.addEventListener('error', () => { img.style.display = 'none'; }, { once: true });
  img.src = knownTeamPhotos[img.dataset.key] || block.dataset.photo;
});

/* ---------- team sticky-scroll: active block detection + image crossfade ---------- */
(function initTeamSticky() {
  const blocks = Array.from(document.querySelectorAll('.team-block'));
  const visual = document.getElementById('teamVisual');
  if (!blocks.length || !visual) return;

  const nameEl = document.getElementById('teamVisualName');
  const roleEl = document.getElementById('teamVisualRole');
  const imgEl = document.getElementById('teamVisualImg');
  const fallbackEl = document.getElementById('teamVisualFallback');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let activeBlock = blocks[0];
  let swapTimer = null;

  function applyBlock(block) {
    nameEl.textContent = block.dataset.name;
    roleEl.textContent = block.dataset.role;
    fallbackEl.textContent = block.dataset.initials;
    fallbackEl.style.setProperty('--hue', block.dataset.hue);
    imgEl.style.display = '';
    imgEl.src = knownTeamPhotos[block.dataset.key] || block.dataset.photo;
  }

  function setActive(block) {
    blocks.forEach(b => b.classList.toggle('active', b === block));
    if (reduceMotion) {
      applyBlock(block);
      return;
    }
    clearTimeout(swapTimer);
    visual.classList.add('is-swapping');
    swapTimer = setTimeout(() => {
      applyBlock(block);
      visual.classList.remove('is-swapping');
    }, 280);
  }

  imgEl.addEventListener('error', () => { imgEl.style.display = 'none'; });
  applyBlock(activeBlock); // set initial src only after the error listener is attached

  function updateActive() {
    const targetY = window.innerHeight * 0.45;
    let closest = null;
    let closestDist = Infinity;
    blocks.forEach((el) => {
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      const d = Math.abs(mid - targetY);
      if (d < closestDist) { closestDist = d; closest = el; }
    });
    if (closest && closest !== activeBlock) {
      activeBlock = closest;
      setActive(closest);
    }
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateActive(); ticking = false; });
  }, { passive: true });

  updateActive();
})();

/* ---------- scroll progress + nav state ---------- */
const nav = document.getElementById('nav');
const progressBar = document.getElementById('progressBar');

function onScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
  nav.classList.toggle('scrolled', scrollTop > 40);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- mobile nav ---------- */
const burger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  burger.classList.remove('open');
  navLinks.classList.remove('open');
}));

/* ---------- reveal on scroll ---------- */
const revealTargets = document.querySelectorAll('.reveal, .reveal-scale, .reveal-word');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
revealTargets.forEach(el => io.observe(el));

/* stagger cards that sit side by side in a grid/rail, so they cascade in
   one after another instead of all popping at once */
document.querySelectorAll('.values-grid, .classes-rail, .fleet-grid').forEach(group => {
  Array.from(group.children).forEach((el, i) => {
    if (el.classList.contains('reveal') || el.classList.contains('reveal-scale')) {
      el.style.transitionDelay = `${Math.min(i * 90, 360)}ms`;
    }
  });
});

/* stagger hero words a touch */
document.querySelectorAll('.hero-title .reveal-word').forEach((el, i) => {
  el.style.transitionDelay = `${i * 60}ms`;
});
// hero words reveal immediately (not scroll dependent, it's above the fold)
window.addEventListener('load', () => {
  document.querySelectorAll('.hero-title .reveal-word').forEach(el => el.classList.add('in'));
});

/* ---------- count-up stats ---------- */
const statNums = document.querySelectorAll('.stat-num');
const statIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = decimals ? val.toFixed(decimals).replace('.', ',') : Math.round(val);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = decimals ? target.toFixed(decimals).replace('.', ',') : target;
    }
    requestAnimationFrame(tick);
    statIO.unobserve(el);
  });
}, { threshold: 0.6 });
statNums.forEach(el => statIO.observe(el));

/* ---------- parallax on scroll (data-speed elements) ---------- */
const parallaxEls = document.querySelectorAll('[data-speed]');
function parallax() {
  const vh = window.innerHeight;
  parallaxEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    const speed = parseFloat(el.dataset.speed);
    const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
    el.style.transform = `translate3d(0, ${offset * -1 * 0.15}px, 0)`;
  });
}
window.addEventListener('scroll', parallax, { passive: true });
parallax();

/* ---------- hero orb mouse parallax ---------- */
const hero = document.querySelector('.hero');
const orbs = document.querySelectorAll('.hero .orb');
hero.addEventListener('mousemove', (e) => {
  const { innerWidth: w, innerHeight: h } = window;
  const nx = (e.clientX / w - 0.5);
  const ny = (e.clientY / h - 0.5);
  orbs.forEach((orb, i) => {
    const factor = (i + 1) * 14;
    orb.style.transform = `translate(${nx * factor}px, ${ny * factor}px)`;
  });
});

/* ---------- magnetic buttons ---------- */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0,0)';
  });
});

/* ---------- fleet card 3D tilt ---------- */
document.querySelectorAll('.fleet-card.tilt').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateY(${px * 14}deg) rotateX(${-py * 14}deg) translateZ(10px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateY(0) rotateX(0) translateZ(0)';
  });
});

/* ---------- contact form (no backend — friendly local confirmation) ---------- */
const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.querySelector('[name="name"]').value.trim();
  formNote.textContent = `Danke${name ? ', ' + name : ''}! Bitte sende deine Anfrage zusätzlich per Telefon oder E-Mail ab, damit wir sie sicher erhalten.`;
  form.reset();
});
