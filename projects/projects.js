import { fetchJSON, renderProjects } from '../global.js';

document.addEventListener('DOMContentLoaded', async () => {
  const projects = await fetchJSON('../lib/projects.json');
  const container = document.querySelector('.projects');
  const title = document.querySelector('.projects-title');

  projects.forEach(project => {
    renderProjects(project, container, 'h2');
  });

  if (title) {
    title.textContent = projects.length;
  }
});
