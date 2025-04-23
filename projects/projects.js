import { fetchJSON, renderProjects } from '../global.js';

document.addEventListener('DOMContentLoaded', async () => {
  const projects = await fetchJSON('../lib/projects.json');
  console.log('Loaded projects:', projects);

  const container = document.querySelector('.projects');
  const title = document.querySelector('.projects-title');

  if (projects && projects.length > 0) {
    renderProjects(projects, container, 'h2');
    if (title) title.textContent = projects.length;
  } else {
    container.innerHTML = '<p>No projects found.</p>';
  }
});
