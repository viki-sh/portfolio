// global.js
console.log("IT’S ALIVE!");

// Utility for selecting multiple elements
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// List of site pages
const pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  { url: 'https://github.com/viki-sh', title: 'GitHub' },
];

// Detect local or GitHub Pages environment
const BASE_PATH = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? '/'
  : '/portfolio/';  // <-- adjust if repo name differs

// Create and insert <nav> at the top of <body>
const nav = document.createElement('nav');
document.body.prepend(nav);

// Build links
for (const page of pages) {
  let url = page.url;

  // Prefix with BASE_PATH if relative
  if (!url.startsWith('http')) {
    url = BASE_PATH + url;
  }

  const a = document.createElement('a');
  a.href = url;
  a.textContent = page.title;

  // Highlight current page
  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
  );

  // Open external links in new tab
  a.toggleAttribute('target', a.host !== location.host);

  nav.append(a);
}

