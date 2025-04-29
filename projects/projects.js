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

  // Group project data by year and count them
  const rolledData = d3.rollups(
    projects,
    v => v.length,
    d => d.year
  );

  // Sort years ascending and map to { label, value }
  const data = rolledData
    .sort(([a], [b]) => +a - +b)
    .map(([year, count]) => ({
      label: year,
      value: count
    }));

  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const sliceGenerator = d3.pie().value(d => d.value);
  const arcData = sliceGenerator(data);
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  // Draw pie slices
  arcData.forEach((d, i) => {
    d3.select('#projects-plot')
      .append('path')
      .attr('d', arcGenerator(d))
      .attr('fill', colors(i));
  });

  // Draw legend
  const legend = d3.select('.legend');
  data.forEach((d, i) => {
    legend.append('li')
      .attr('style', `--color: ${colors(i)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
});
