
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

const BASE_PATH = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? '/'
  : '/portfolio/'; 


const nav = document.createElement('nav');
document.body.prepend(nav);

for (const page of pages) {
  let url = page.url;
  if (!url.startsWith('http')) {
    url = BASE_PATH + url;
  }

  const a = document.createElement('a');
  a.href = url;
  a.textContent = page.title;


  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
  );


  a.toggleAttribute('target', a.host !== location.host);

  nav.append(a);
}
