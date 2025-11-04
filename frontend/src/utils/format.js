export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US').format(price);
};

export const parsePrice = (priceString) => {
  if (typeof priceString !== 'string') {
    priceString = String(priceString);
  }
  const value = parseFloat(priceString.replace(/[^\d.-]/g, ''));
  return isNaN(value) ? 0 : value;
};
