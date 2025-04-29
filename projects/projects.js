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

  // Pie data with labels and values
  const data = [
    { value: 1, label: 'apples' },
    { value: 2, label: 'oranges' },
    { value: 3, label: 'mangos' },
    { value: 4, label: 'pears' },
    { value: 5, label: 'limes' },
    { value: 5, label: 'cherries' },
  ];

  const arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(50);

  const sliceGenerator = d3.pie()
    .value(d => d.value);

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


