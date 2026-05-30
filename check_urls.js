async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    console.log(`${url}: ${res.status}`);
  } catch (e) {
    console.log(`${url}: Error ${e.message}`);
  }
}

async function main() {
  await checkUrl('https://images.unsplash.com/photo-Z-hvocTfR_s');
  await checkUrl('https://images.unsplash.com/photo-44d0W8JhoPc');
}
main();
