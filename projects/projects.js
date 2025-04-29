import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

document.addEventListener('DOMContentLoaded', async () => {
  let projects;
  try {
    projects = await fetchJSON('../lib/projects.json');
  } catch (err) {
    console.error('Error loading projects.json', err);
    return;
  }

  const projectsContainer = document.querySelector('.projects-list');
  const title = document.querySelector('.projects-title');
  const searchInput = document.querySelector('.search-bar');

  let query = '';
  let selectedIndex = -1;

  const rolledData = d3.rollups(projects, v => v.length, d => d.year);
  const pieData = rolledData.map(([year, count]) => ({ label: year, value: count }));

  function drawPieChart() {
    const sliceGenerator = d3.pie().value(d => d.value);
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    const arcs = sliceGenerator(pieData);
    const colors = d3.scaleOrdinal(d3.schemeTableau10);

    const svg = d3.select('#projects-plot');
    svg.selectAll('path').remove();

    arcs.forEach((arc, i) => {
      svg.append('path')
        .attr('d', arcGenerator(arc))
        .attr('fill', colors(i))
        .attr('data-idx', i)
        .on('click', () => {
          selectedIndex = selectedIndex === i ? -1 : i;
          update();
        });
    });

    const legend = d3.select('.legend');
    legend.selectAll('li').remove();

    pieData.forEach((d, i) => {
      legend.append('li')
        .attr('style', `--color: ${colors(i)}`)
        .attr('class', 'legend-item')
        .attr('data-idx', i)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
        .on('click', () => {
          selectedIndex = selectedIndex === i ? -1 : i;
          update();
        });
    });
  }

  function update() {
    let filteredProjects = projects;

    if (query.trim() !== '') {
      filteredProjects = filteredProjects.filter(project => {
        const values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
      });
    }

    if (selectedIndex !== -1 && pieData[selectedIndex]) {
      const selectedYear = pieData[selectedIndex].label;
      filteredProjects = filteredProjects.filter(p => p.year === selectedYear);
    }

    renderProjects(filteredProjects, projectsContainer, 'h2');

    d3.selectAll('path')
      .attr('class', (_, i) => (i === selectedIndex ? 'selected' : null));

    d3.selectAll('.legend li')
      .attr('class', (_, i) => (i === selectedIndex ? 'legend-item selected' : 'legend-item'));

    if (title) title.textContent = filteredProjects.length;
  }

  if (projects && projects.length > 0) {
    drawPieChart();
    update();
  } else {
    projectsContainer.innerHTML = '<p>No projects found.</p>';
  }

  searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    selectedIndex = -1;
    update();
  });
});
