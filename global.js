
console.log("IT’S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  { url: 'https://github.com/viki-sh', title: 'GitHub' },
];

const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const BASE_PATH = isLocal ? '/' : `${location.origin}/portfolio/`;

const nav = document.createElement('nav');
document.body.prepend(nav);

for (const page of pages) {
  const href = page.url.startsWith('http') ? page.url : BASE_PATH + page.url;
  const a = document.createElement('a');
  a.href = href;
  a.textContent = page.title;

  const tempLink = new URL(a.href);
  a.classList.toggle(
    'current',
    tempLink.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '')
  );

  a.toggleAttribute('target', a.host !== location.host);
  nav.append(a);
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select>
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
    `
  );

  const select = document.querySelector('.color-scheme select');

  function setColorScheme(mode) {
    document.documentElement.style.setProperty('color-scheme', mode);
    select.value = mode;
  }

  if ('colorScheme' in localStorage) {
    setColorScheme(localStorage.colorScheme);
  }

  select.addEventListener('input', (event) => {
    const mode = event.target.value;
    localStorage.colorScheme = mode;
    setColorScheme(mode);
  });
});
