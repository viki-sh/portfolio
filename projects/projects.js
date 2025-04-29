import { fetchJSON, renderProjects } from '../global.js';

document.addEventListener('DOMContentLoaded', async () => {
  const projects = await fetchJSON('../lib/projects.json');
  console.log('Loaded projects:', projects); // Check the console

  const container = document.querySelector('.projects');
  const title = document.querySelector('.projects-title');

  if (projects && projects.length > 0) {
    // Clear ONLY old project articles, NOT the entire container
    container.querySelectorAll('article').forEach(article => article.remove());

    renderProjects(projects, container, 'h2');
    if (title) title.textContent = projects.length;
  } else {
    container.innerHTML += '<p>No projects found.</p>'; // append instead of replace
  }
});

