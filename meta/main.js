import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

console.log("✅ main.js is loading");

async function loadData() {
  try {
    const data = await d3.csv('/portfolio/meta/loc.csv');
    console.log("✅ CSV loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Failed to load CSV:", error);
  }
}

let data = await loadData();
