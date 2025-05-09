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
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Total commits
  dl.append('dt').text('Commits');
  dl.append('dd').text(commits.length);

  // Number of unique files
  const numFiles = d3.group(data, d => d.file).size;
  dl.append('dt').text('Files');
  dl.append('dd').text(numFiles);

  // Max depth
  const maxDepth = d3.max(data, d => d.depth);
  dl.append('dt').text('Max depth');
  dl.append('dd').text(maxDepth);

  // Longest line (by character length)
  const longestLine = d3.max(data, d => d.length);
  dl.append('dt').text('Longest line');
  dl.append('dd').text(longestLine);

  // Max lines in any one file
  const fileLineCounts = d3.rollups(
    data,
    v => v.length,
    d => d.file
  );
  const maxLines = d3.max(fileLineCounts, d => d[1]);
  dl.append('dt').text('Max lines');
  dl.append('dd').text(maxLines);
}

// Main flow
let data = await loadData();
let commits = processCommits(data);
renderCommitInfo(data, commits);
