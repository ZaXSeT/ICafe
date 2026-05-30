const fs = require('fs');
async function fetchIds(query) {
  const res = await fetch(`https://unsplash.com/s/photos/${query}`);
  const text = await res.text();
  const matches = [...text.matchAll(/href="\/photos\/([a-zA-Z0-9_-]+)"/g)];
  console.log(`Results for ${query}:`);
  const uniqueIds = [...new Set(matches.map(m => m[1]))].slice(0, 5);
  console.log(uniqueIds);
}

async function main() {
  await fetchIds('matcha-latte');
  await fetchIds('iced-coffee-frappe');
}
main();
