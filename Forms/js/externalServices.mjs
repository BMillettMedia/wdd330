const baseURL = import.meta.env.VITE_SERVER_URL;

const externalServices = {
  async getProductsByCategory(category) {
    const response = await fetch(`${baseURL}products/search/${category}`);
    const data = await response.json();
    return data.Result;
  },

  async checkout(payload) {
    const url = `${baseURL}checkout`;
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    };
    const response = await fetch(url, options);
    return response.json();
  }
};

export default externalServices;
