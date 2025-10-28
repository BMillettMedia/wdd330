import checkoutProcess from './checkoutProcess.mjs';

document.addEventListener("DOMContentLoaded", () => {
  checkoutProcess.init("so-cart", "#order-summary");

  const form = document.querySelector("#checkout-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    checkoutProcess.calculateOrderTotal();
    await checkoutProcess.checkout(form);
  });

  // Optional: calculate totals when zip changes
  form.zip.addEventListener("change", () => checkoutProcess.calculateOrderTotal());
});
