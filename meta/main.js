import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('/portfolio/meta/loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  return data;
}

function processCommits(data) {
  return d3.groups(data, d => d.commit).map(([commit, lines]) => {
    const { author, date, time, timezone, datetime } = lines[0];
    const result = {
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
    Object.defineProperty(result, 'lines', {
      value: lines,
      writable: false,
      enumerable: false,
      configurable: true
    });
    return result;
  });
}

function renderCommitInfo(data, commits) {
  d3.select('#stats').append('h2').text('Summary');
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);
  dl.append('dt').text('Commits'); dl.append('dd').text(commits.length);
  dl.append('dt').text('Files'); dl.append('dd').text(d3.group(data, d => d.file).size);
  dl.append('dt').text('Max depth'); dl.append('dd').text(d3.max(data, d => d.depth));
  dl.append('dt').text('Longest line'); dl.append('dd').text(d3.max(data, d => d.length));
  dl.append('dt').text('Max lines');
  dl.append('dd').text(d3.max(d3.rollups(data, v => v.length, d => d.file), d => d[1]));
}

function renderScatterPlot(data, commits) {
  const margin = { top: 30, right: 20, bottom: 40, left: 60 };
  const width = 1000 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = d3.select('#chart').append('svg')
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

  svg.append('g').selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue');

  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.timeFormat("%b %d")));

  svg.append('g')
    .call(d3.axisLeft(yScale).ticks(8).tickFormat(d => String(d % 24).padStart(2, '0') + ':00'));
}

let data = await loadData();
let commits = processCommits(data);
renderCommitInfo(data, commits);
renderScatterPlot(data, commits);
