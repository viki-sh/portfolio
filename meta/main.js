import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('/portfolio/meta/loc.csv', row => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  return data;
}

function processCommits(data) {
  return d3.groups(data, d => d.commit).map(([commit, lines]) => {
    const { author, date, time, timezone, datetime } = lines[0];
    return {
      id: commit,
      url: `https://github.com/viki-sh/portfolio/commit/${commit}`,
      author,
      date,
      time,
      timezone,
      datetime,
      hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
      totalLines: lines.length,
      lines
    };
  });
}

function renderCommitInfo(data, commits) {
  d3.select('#stats').append('h2').text('Summary');
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);
  dl.append('dt').text('Commits');
  dl.append('dd').text(commits.length);
  dl.append('dt').text('Files');
  dl.append('dd').text(new Set(data.map(d => d.file)).size);
  dl.append('dt').text('Max depth');
  dl.append('dd').text(d3.max(data, d => d.depth));
  dl.append('dt').text('Longest line');
  dl.append('dd').text(d3.max(data, d => d.length));
  dl.append('dt').text('Max lines');
  dl.append('dd').text(d3.max(d3.rollups(data, v => v.length, d => d.file), d => d[1]));
}

function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  if (!commit) return;
  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
    timeStyle: 'short'
  });
}

function updateTooltipVisibility(visible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !visible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.pageX + 12}px`;
  tooltip.style.top = `${event.pageY + 12}px`;
}

function renderScatterPlot(data, commits) {
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const width = 1000 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([0, width])
    .nice();

  const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  svg.append('g')
    .attr('class', 'gridlines')
    .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(''));

  svg.append('g')
    .attr('class', 'dots')
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .on('mouseenter', (event, d) => {
      renderTooltipContent(d);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mousemove', updateTooltipPosition)
    .on('mouseleave', () => {
      updateTooltipVisibility(false);
    });

  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.timeFormat('%b %d')))
    .append('text')
    .attr('x', width)
    .attr('y', 35)
    .attr('fill', 'black')
    .attr('text-anchor', 'end')
    .text('Date');

  svg.append('g')
    .call(d3.axisLeft(yScale).ticks(8).tickFormat(d => `${String(d).padStart(2, '0')}:00`))
    .append('text')
    .attr('x', -40)
    .attr('y', -10)
    .attr('fill', 'black')
    .attr('text-anchor', 'start')
    .text('Hour of Day');
}

// Run
const data = await loadData();
const commits = processCommits(data);
renderCommitInfo(data, commits);
renderScatterPlot(data, commits);
