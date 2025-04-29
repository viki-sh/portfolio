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

  // --- D3 Pie Chart Code ---
  const data = [1, 2]; // 1 slice vs 2 slices (e.g. 33% and 66%)

  const arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(50);

  const sliceGenerator = d3.pie();
  const arcData = sliceGenerator(data);
  const arcs = arcData.map(d => arcGenerator(d));

  const colors = ['gold', 'purple'];

  arcs.forEach((arc, idx) => {
    d3.select('#projects-plot')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors[idx]);
  });
});


