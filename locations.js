// ============================================================
// Standort-Umschalter — einmalig in der Nav, sitewide. Schaltet Team,
// Klassen, Fuhrpark, Adresse/Öffnungszeiten und die Google-Maps-Karte
// zwischen den Standorten um. Steuert alles über ein einziges data-loc
// Attribut auf <body>; jedes Element mit einem passenden data-loc-Attribut
// wird per CSS ein-/ausgeblendet (siehe styles.css, "Standort-Umschalter").
// ============================================================

const STORAGE_KEY = 'lowfly-location';

export const LOCATIONS = {
  a: {
    id: 'a',
    label: 'Kaufbeuren',
    mapQuery: 'Neugablonzer Str. 37, 87600 Kaufbeuren',
  },
  b: {
    // Adresse, Telefon, Öffnungszeiten und Bewertungen sind bestätigt echt.
    // Nur das angezeigte Team (Lukas/Nina/Tom) ist noch Platzhalter — die
    // echten Google-Rezensionen nennen "Dilovan" und "Haci Mete" als
    // Fahrlehrer vor Ort, das Team-Block-Markup wurde aber noch nicht
    // darauf umgestellt (siehe Rückfrage im Chat).
    id: 'b',
    label: 'Schongau',
    mapQuery: 'Oskar-von-Miller-Straße 10, 86956 Schongau',
  },
};

function readStoredLocation() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'a' || v === 'b' ? v : 'a';
  } catch {
    return 'a';
  }
}

function applyLocation(loc, { persist }) {
  document.body.dataset.loc = loc;
  document.querySelectorAll('[data-loc-btn]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.locBtn === loc));
  });
  if (persist) {
    try { localStorage.setItem(STORAGE_KEY, loc); } catch { /* private mode etc. */ }
  }
  window.dispatchEvent(new CustomEvent('lowfly-location-change', { detail: LOCATIONS[loc] }));
}

export function initLocationSwitch() {
  const buttons = document.querySelectorAll('[data-loc-btn]');
  if (!buttons.length) return;

  applyLocation(readStoredLocation(), { persist: false });

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // switching Standort changes how tall several sections are (e.g.
      // Klassen goes from 2 rows to 1), which can shift whatever the
      // visitor is currently looking at up or down even though the
      // switcher itself lives in the fixed nav and never moves. Anchor to
      // whatever sits just below the nav right now and compensate for any
      // shift there, regardless of which section further down caused it.
      const anchor = document.elementFromPoint(window.innerWidth / 2, 100);
      const before = anchor ? anchor.getBoundingClientRect().top : null;
      applyLocation(btn.dataset.locBtn, { persist: true });
      if (anchor) {
        const delta = anchor.getBoundingClientRect().top - before;
        if (delta !== 0) window.scrollBy({ top: delta, left: 0, behavior: 'instant' });
      }
    });
  });
}
