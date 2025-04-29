// File: /projects/projects.js
import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

document.addEventListener('DOMContentLoaded', async () => {
  const allProjects = await fetchJSON('../lib/projects.json');
  const container = document.querySelector('.projects-list');
  const title = document.querySelector('.projects-title');
  const searchInput = document.querySelector('.search-bar');

  function renderPieChart(projects) {
    const rolled = d3.rollups(
      projects,
      v => v.length,
      d => d.year
    );

    const data = rolled.map(([label, value]) => ({ label, value }));
    const arcs = d3.pie().value(d => d.value)(data);
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    const colors = d3.scaleOrdinal(d3.schemeTableau10);

    const svg = d3.select('#projects-plot');
    svg.selectAll('path').remove();
    arcs.forEach((d, i) => {
      svg.append('path')
        .attr('d', arcGenerator(d))
        .attr('fill', colors(i));
    });

    const legend = d3.select('.legend');
    legend.selectAll('*').remove();
    data.forEach((d, i) => {
      legend.append('li')
        .attr('class', 'legend-item')
        .attr('style', `--color: ${colors(i)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
  }

  function update(query) {
    const filtered = allProjects.filter(project => {
      const values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query.toLowerCase());
    });
    renderProjects(filtered, container, 'h2');
    renderPieChart(filtered);
    if (title) title.textContent = filtered.length;
  }

  searchInput.addEventListener('input', (e) => update(e.target.value));

  update('');
});