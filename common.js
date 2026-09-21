// Shared across all pages (index, impressum, datenschutz): fonts, footer
// year, mobile nav, cookie banner.
import './fonts.js';
import { initConsent } from './consent.js';

document.getElementById('year').textContent = new Date().getFullYear();

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

initConsent();
