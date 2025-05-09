import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Step 1.1: Load and parse CSV
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

// Step 1.2: Process commit information
function processCommits(data) {
  return d3
    .groups(data, d => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;

      let ret = {
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

// Step 1.3: Render summary stats
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

// Step 2: Render scatterplot of time/day of commits
function renderScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const xScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([0, width])
    .nice();

  const yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([height, 0]);

  const dots = svg.append('g').attr('class', 'dots');

  dots.selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue');

  // Add axes
  const xAxis = d3.axisBottom(xScale).ticks(6).tickFormat(d3.timeFormat("%b %d"));
  const yAxis = d3.axisLeft(yScale).ticks(6);

  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis)
    .call(g => g.append('text')
      .attr('x', width)
      .attr('y', -6)
      .attr('fill', 'black')
      .attr('text-anchor', 'end')
      .text('Date'));

  svg.append('g')
    .call(yAxis)
    .call(g => g.append('text')
      .attr('x', 6)
      .attr('y', 6)
      .attr('fill', 'black')
      .attr('text-anchor', 'start')
      .text('Hour of Day'));
}

// Load, process, and render
let data = await loadData();
let commits = processCommits(data);
renderCommitInfo(data, commits);
renderScatterPlot(data, commits);