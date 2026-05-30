async function getRawUrl(id) {
  try {
    const res = await fetch(`https://unsplash.com/photos/${id}`);
    const text = await res.text();
    const match = text.match(/"url":"(https:\/\/images\.unsplash\.com\/photo-[^"]+)"/);
    if (match) {
      console.log(`${id}: ${match[1].replace(/\\u0026/g, '&')}`);
    } else {
      console.log(`${id}: No raw URL found`);
    }
  } catch (e) {
    console.log(`${id}: Error ${e.message}`);
  }
}

async function main() {
  await getRawUrl('Z-hvocTfR_s');
  await getRawUrl('44d0W8JhoPc');
  await getRawUrl('1587314168485-3236d6710814');
  await getRawUrl('1536514072410-5019a3c69182');
}
main();
