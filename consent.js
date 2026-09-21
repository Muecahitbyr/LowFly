// ============================================================
// Cookie-/Einwilligungs-Banner (TTDSG §25, DSGVO Art. 6 Abs. 1 lit. a)
//
// Es gibt nur eine nicht-notwendige Kategorie: das Google-Maps-Embed im
// Kontaktbereich. Alles andere (Fonts, Nav, Animationen) läuft rein lokal
// ohne externe Requests und braucht daher keine Einwilligung.
// ============================================================

const STORAGE_KEY = 'lowfly-consent';
const CONSENT_VERSION = 1;

function readConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent(maps) {
  const consent = { version: CONSENT_VERSION, necessary: true, maps: !!maps, ts: Date.now() };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(consent)); } catch { /* private mode etc. */ }
  window.dispatchEvent(new CustomEvent('lowfly-consent-change', { detail: consent }));
  return consent;
}

export function getConsent() {
  return readConsent();
}

// Used by the Google-Maps placeholder's own "Karte laden" button — a click
// there is itself an unambiguous, informed consent action for that one
// purpose, so it persists the same way accepting in the banner would.
export function grantMapsConsent() {
  return writeConsent(true);
}

let bannerEl = null;

function buildBanner() {
  const el = document.createElement('div');
  el.className = 'cookie-banner';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-label', 'Cookie-Einstellungen');
  el.innerHTML = `
    <div class="cookie-banner-inner">
      <div class="cookie-banner-text">
        <p class="cookie-banner-title">Diese Website respektiert deine Privatsphäre</p>
        <p>Wir verwenden nur technisch notwendige Speicherung (z.&nbsp;B. für diese Einstellung). Für die interaktive Karte im Kontaktbereich möchten wir Inhalte von Google Maps laden — dabei werden Daten an Google Ireland Limited (ggf. Google LLC, USA) übertragen. Das passiert nur mit deiner Einwilligung. Details in der <a href="datenschutz.html">Datenschutzerklärung</a>.</p>
      </div>
      <div class="cookie-banner-settings" hidden>
        <label class="cookie-toggle">
          <input type="checkbox" checked disabled>
          <span>Technisch notwendig <em>(immer aktiv)</em></span>
        </label>
        <label class="cookie-toggle">
          <input type="checkbox" id="cookieMapsToggle">
          <span>Externe Inhalte — Google Maps <em>(Datenübertragung an Google)</em></span>
        </label>
      </div>
      <div class="cookie-banner-actions">
        <button type="button" class="btn-cookie-text" data-cookie-action="settings">Einstellungen</button>
        <button type="button" class="btn-cookie-ghost" data-cookie-action="reject">Nur notwendige</button>
        <button type="button" class="btn-cookie-primary" data-cookie-action="accept">Alle akzeptieren</button>
        <button type="button" class="btn-cookie-primary" data-cookie-action="save" hidden>Auswahl speichern</button>
      </div>
    </div>
  `;
  document.body.appendChild(el);

  const settingsPanel = el.querySelector('.cookie-banner-settings');
  const mapsToggle = el.querySelector('#cookieMapsToggle');
  const saveBtn = el.querySelector('[data-cookie-action="save"]');

  el.addEventListener('click', (e) => {
    const action = e.target.closest('[data-cookie-action]')?.dataset.cookieAction;
    if (!action) return;
    if (action === 'settings') {
      settingsPanel.hidden = !settingsPanel.hidden;
      saveBtn.hidden = settingsPanel.hidden;
      return;
    }
    if (action === 'accept') { writeConsent(true); hideBanner(); return; }
    if (action === 'reject') { writeConsent(false); hideBanner(); return; }
    if (action === 'save') { writeConsent(mapsToggle.checked); hideBanner(); return; }
  });

  return el;
}

function showBanner(expandSettings) {
  if (!bannerEl) bannerEl = buildBanner();
  if (expandSettings) {
    const panel = bannerEl.querySelector('.cookie-banner-settings');
    const toggle = bannerEl.querySelector('#cookieMapsToggle');
    const existing = readConsent();
    if (toggle) toggle.checked = existing ? existing.maps : false;
    panel.hidden = false;
    bannerEl.querySelector('[data-cookie-action="save"]').hidden = false;
  }
  requestAnimationFrame(() => bannerEl.classList.add('visible'));
}

function hideBanner() {
  if (!bannerEl) return;
  bannerEl.classList.remove('visible');
}

export function openConsentSettings() {
  showBanner(true);
}

export function initConsent() {
  const existing = readConsent();
  if (!existing) {
    showBanner(false);
  }
  document.querySelectorAll('[data-cookie-settings]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openConsentSettings();
    });
  });
}
