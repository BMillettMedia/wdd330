// scripts/productList.mjs
import { getData } from 'productData.mjs';

// Function to create a single product card template
function productCardTemplate(product) {
  return `
    <li class="product-card">
      <a href="product_pages/index.html?product=${product.id}">
        <img src="${product.image}" alt="Image of ${product.name}">
        <h3 class="card__brand">${product.brand}</h3>
        <h2 class="card__name">${product.name}</h2>
        <p class="product-card__price">$${product.price.toFixed(2)}</p>
      </a>
    </li>
  `;
}

// Function to render a list of product cards into the DOM
function renderList(products, selector) {
  const container = document.querySelector(selector);
  container.innerHTML = products.map(productCardTemplate).join('');
}

// Main exported function
export default async function productList(selector, category) {
  const products = await getData(category);
  renderList(products, selector);
}
