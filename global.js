console.log("IT’S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  { url: 'meta/', title: 'Meta' }, 
  { url: 'https://github.com/viki-sh', title: 'GitHub' },
];


const BASE_PATH = '/portfolio/';

const nav = document.createElement('nav');
document.body.prepend(nav);

for (const page of pages) {
  const href = page.url.startsWith('http') ? page.url : BASE_PATH + page.url;
  const a = document.createElement('a');
  a.href = href;
  a.textContent = page.title;

  const tempLink = new URL(a.href, location.origin);
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

export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';

  for (const project of projects) {
    const article = document.createElement('article');
    article.innerHTML = `
    <${headingLevel}>${project.title} <span class="project-year">(${project.year})</span></${headingLevel}>
    <img src="${project.image}" alt="${project.title}">
    <p>${project.description}</p>
  `;
  
    containerElement.appendChild(article);
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}
