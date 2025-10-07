// scripts/productData.mjs
export async function getData(category) {
  try {
    const response = await fetch('../data/tents.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    // Filter by category (for future scalability)
    return data.filter(product => product.category === category);
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}
