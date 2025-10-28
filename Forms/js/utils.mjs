import { getLocalStorage } from './utils.mjs';
import externalServices from './externalServices.mjs';

const checkoutProcess = {
  key: "",
  outputSelector: "",
  list: [],
  itemTotal: 0,
  shipping: 0,
  tax: 0,
  orderTotal: 0,

  init(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = getLocalStorage(key);
    this.calculateItemSummary();
  },

  calculateItemSummary() {
    this.itemTotal = this.list.reduce((sum, item) => sum + item.FinalPrice * item.Quantity, 0);
    document.querySelector("#item-total").textContent = `$${this.itemTotal.toFixed(2)}`;
  },

  calculateOrderTotal() {
    const numItems = this.list.reduce((sum, item) => sum + item.Quantity, 0);
    this.shipping = 10 + (numItems - 1) * 2;
    this.tax = this.itemTotal * 0.06;
    this.orderTotal = this.itemTotal + this.shipping + this.tax;
    this.displayOrderTotals();
  },

  displayOrderTotals() {
    document.querySelector("#shipping").textContent = `$${this.shipping.toFixed(2)}`;
    document.querySelector("#tax").textContent = `$${this.tax.toFixed(2)}`;
    document.querySelector("#order-total").textContent = `$${this.orderTotal.toFixed(2)}`;
  },

  packageItems(items) {
    return items.map(item => ({
      id: item.Id,
      name: item.Name,
      price: item.FinalPrice,
      quantity: item.Quantity
    }));
  },

  async checkout(form) {
    const formData = new FormData(form);
    const orderData = Object.fromEntries(formData.entries());

    const payload = {
      orderDate: new Date().toISOString(),
      ...orderData,
      items: this.packageItems(this.list),
      orderTotal: this.orderTotal,
      shipping: this.shipping,
      tax: this.tax
    };

    const result = await externalServices.checkout(payload);
    alert(`Order confirmed! Order ID: ${result.orderId}`);
    localStorage.removeItem(this.key);
  }
};

export default checkoutProcess;
