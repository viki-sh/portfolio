import { fetchJSON, renderProjects } from './global.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projects = await fetchJSON('./lib/projects.json');
    const latestProjects = projects.slice(0, 3);
    const container = document.querySelector('.projects');
    renderProjects(latestProjects, container, 'h2');
  });