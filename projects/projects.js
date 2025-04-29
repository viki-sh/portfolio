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

  function rollupData(data) {
    return d3.rollups(data, v => v.length, d => d.year)
             .map(([label, value]) => ({ label, value }));
  }

  function drawPieChart(data) {
    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(50);
    const arcs = pie(data);

    const colors = d3.scaleOrdinal(d3.schemeTableau10);

    const svg = d3.select('#projects-plot');
    svg.selectAll('path').remove();

    arcs.forEach((arcData, i) => {
      svg.append('path')
        .attr('d', arc(arcData))
        .attr('fill', colors(i))
        .attr('data-idx', i)
        .attr('class', i === selectedIndex ? 'selected' : null)
        .on('click', () => {
          selectedIndex = selectedIndex === i ? -1 : i;
          update();
        });
    });

    const legend = d3.select('.legend');
    legend.selectAll('li').remove();

    data.forEach((d, i) => {
      legend.append('li')
        .attr('style', `--color: ${colors(i)}`)
        .attr('class', i === selectedIndex ? 'legend-item selected' : 'legend-item')
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
      filteredProjects = filteredProjects.filter(p =>
        Object.values(p).join('\n').toLowerCase().includes(query.toLowerCase())
      );
    }

    const pieData = rollupData(filteredProjects);

    let visibleProjects = filteredProjects;
    if (selectedIndex !== -1 && pieData[selectedIndex]) {
      const selectedYear = pieData[selectedIndex].label;
      visibleProjects = filteredProjects.filter(p => p.year === selectedYear);
    }

    renderProjects(visibleProjects, projectsContainer, 'h2');
    if (title) title.textContent = visibleProjects.length;

    drawPieChart(pieData);
  }

  if (projects && projects.length > 0) {
    update();
  } else {
    projectsContainer.innerHTML = '<p>No projects found.</p>';
  }

  searchInput.addEventListener('input', (e) => {
    query = e.target.value;
    selectedIndex = -1;
    update();
  });
});
