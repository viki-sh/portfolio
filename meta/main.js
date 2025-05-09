import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

console.log("✅ main.js is running");

async function loadData() {
  try {
    const data = await d3.csv('/portfolio/meta/loc.csv', (row) => ({
      ...row,
      line: Number(row.line),
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));

    console.log("✅ CSV loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Failed to load CSV:", error);
  }
}

let data = await loadData();
