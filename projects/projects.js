import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

document.addEventListener('DOMContentLoaded', async () => {
  const projects = await fetchJSON('../lib/projects.json');
  console.log('Loaded projects:', projects);

  const listContainer = document.querySelector('.projects-list');
  const title = document.querySelector('.projects-title');

  if (projects && projects.length > 0) {
    listContainer.innerHTML = '';
    renderProjects(projects, listContainer, 'h2');
    if (title) title.textContent = projects.length;
  } else {
    listContainer.innerHTML = '<p>No projects found.</p>';
  }

  // D3 code to draw full circle
  const arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(50);

  const arc = arcGenerator({
    startAngle: 0,
    endAngle: 2 * Math.PI,
  });

  d3.select('#projects-plot')
    .append('path')
    .attr('d', arc)
    .attr('fill', 'red');
});


