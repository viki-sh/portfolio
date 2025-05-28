import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';

let commitProgress = 100;
let commitMaxTime;
let filteredCommits = [];
let commits = [];

const xScale = d3.scaleTime();
const yScale = d3.scaleLinear().domain([0, 1]).range([600, 0]);

d3.csv('loc.csv', d3.autoType).then(raw => {
  commits = d3.groups(raw, d => d.commit).map(([commit, lines], i) => {
    const datetime = new Date(lines[0].datetime);
    return {
      id: commit,
      datetime,
      hourFrac: datetime.getHours() / 24 + datetime.getMinutes() / 1440,
      totalLines: lines.length,
      lines,
      url: lines[0].url || '#'
    };
  }).sort((a, b) => d3.ascending(a.datetime, b.datetime));

  processCommits();
  renderScatterPlot(commits);
  onTimeSliderChange();
  generateScrollText();
  setupScroller();
});

function processCommits() {
  xScale.domain(d3.extent(commits, d => d.datetime)).range([0, 1000]);
}

function renderScatterPlot(commits) {
  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', 1000)
    .attr('height', 600);

  svg.append('g')
    .attr('transform', 'translate(0, 570)')
    .attr('class', 'x-axis')
    .call(d3.axisBottom(xScale));

  svg.append('g')
    .attr('class', 'dots')
    .selectAll('circle')
    .data(commits, d => d.id)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', d => Math.sqrt(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7);
}

function updateScatterPlot(commits) {
  const svg = d3.select('#chart').select('svg');

  xScale.domain(d3.extent(commits, d => d.datetime));

  const xAxisGroup = svg.select('g.x-axis');
  xAxisGroup.selectAll('*').remove();
  xAxisGroup.call(d3.axisBottom(xScale));

  const dots = svg.select('g.dots');

  dots.selectAll('circle')
    .data(commits, d => d.id)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', d => Math.sqrt(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7);
}

function updateFileDisplay() {
  let lines = filteredCommits.flatMap(d => d.lines);
  let files = d3.groups(lines, d => d.file)
    .map(([name, lines]) => ({ name, lines }))
    .sort((a, b) => b.lines.length - a.lines.length);

  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  const filesContainer = d3.select('#files')
    .selectAll('div')
    .data(files, d => d.name)
    .join(
      enter => enter.append('div').call(div => {
        div.append('dt').append('code');
        div.append('dd');
      })
    );

  filesContainer.select('dt > code').html(d => `${d.name}<small>${d.lines.length} lines</small>`);
  filesContainer.attr('style', d => `--color: ${colors(d.type)}`);

  filesContainer.select('dd')
    .selectAll('div')
    .data(d => d.lines)
    .join('div')
    .attr('class', 'loc');
}

function onTimeSliderChange() {
  commitProgress = +document.getElementById('commit-progress').value;
  const timeScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([0, 100]);

  commitMaxTime = timeScale.invert(commitProgress);
  document.getElementById('commit-time').textContent = commitMaxTime.toLocaleString();

  filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);
  updateScatterPlot(filteredCommits);
  updateFileDisplay();
}

document.getElementById('commit-progress')
  .addEventListener('input', onTimeSliderChange);

function generateScrollText() {
  d3.select('#scatter-story')
    .selectAll('.step')
    .data(commits)
    .join('div')
    .attr('class', 'step')
    .html((d, i) => `On ${d.datetime.toLocaleString('en', { dateStyle: 'full', timeStyle: 'short' })},
      I made <a href=\"${d.url}\" target=\"_blank\">${i > 0 ? 'another glorious commit' : 'my first commit'}</a>.
      I edited ${d.totalLines} lines in ${d3.rollups(d.lines, D => D.length, d => d.file).length} files.`);
}

function setupScroller() {
  const scroller = scrollama();
  scroller.setup({
    container: '#scrolly-1',
    step: '#scrolly-1 .step'
  }).onStepEnter(response => {
    const date = response.element.__data__.datetime;
    commitMaxTime = date;
    filteredCommits = commits.filter(d => d.datetime <= date);
    updateScatterPlot(filteredCommits);
    updateFileDisplay();
  });
}
