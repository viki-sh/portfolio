import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('/portfolio/meta/loc.csv', (row) => ({
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
    const first = lines[0];
    const { author, date, time, timezone, datetime } = first;

    const ret = {
      id: commit,
      url: 'https://github.com/viki-sh/portfolio/commit/' + commit,
      author,
      date,
      time,
      timezone,
      datetime,
      hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
      totalLines: lines.length,
    };

    Object.defineProperty(ret, 'lines', {
      value: lines,
      writable: false,
      enumerable: false,
      configurable: true
    });

    return ret;
  });
}

function renderCommitInfo(data, commits) {
  d3.select('#stats').append('h2').text('Summary');
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);
  dl.append('dt').text('Commits');
  dl.append('dd').text(commits.length);

  const numFiles = d3.group(data, d => d.file).size;
  dl.append('dt').text('Files');
  dl.append('dd').text(numFiles);

  const maxDepth = d3.max(data, d => d.depth);
  dl.append('dt').text('Max depth');
  dl.append('dd').text(maxDepth);

  const longestLine = d3.max(data, d => d.length);
  dl.append('dt').text('Longest line');
  dl.append('dd').text(longestLine);

  const fileLineCounts = d3.rollups(data, v => v.length, d => d.file);
  const maxLines = d3.max(fileLineCounts, d => d[1]);
  dl.append('dt').text('Max lines');
  dl.append('dd').text(maxLines);
}

function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');

  if (!commit || Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
    timeStyle: 'short'
  });
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX + 10}px`;
  tooltip.style.top = `${event.clientY + 10}px`;
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

  const yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([height, 0]);

  // Radius scale using square root for accurate area perception
  const [minLines, maxLines] = d3.extent(commits, d => d.totalLines);
  const rScale = d3.scaleSqrt()
    .domain([minLines, maxLines])
    .range([4, 30]); // dot size range

  // Sort commits so smaller circles draw last (on top)
  const sortedCommits = d3.sort(commits, d => -d.totalLines);

  // Gridlines
  svg.append('g')
    .attr('class', 'gridlines')
    .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(''));

  // Draw dots
  svg.append('g')
    .attr('class', 'dots')
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', d => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mousemove', updateTooltipPosition)
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });

  // X Axis
  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.timeFormat('%b %d')))
    .append('text')
    .attr('x', width)
    .attr('y', 35)
    .attr('fill', 'black')
    .attr('text-anchor', 'end')
    .text('Date');

  // Y Axis
  svg.append('g')
    .call(d3.axisLeft(yScale).ticks(8).tickFormat(d => String(d % 24).padStart(2, '0') + ':00'))
    .append('text')
    .attr('x', -40)
    .attr('y', -10)
    .attr('fill', 'black')
    .attr('text-anchor', 'start')
    .text('Hour of Day');
}

const data = await loadData();
const commits = processCommits(data);
renderCommitInfo(data, commits);
renderScatterPlot(data, commits);
