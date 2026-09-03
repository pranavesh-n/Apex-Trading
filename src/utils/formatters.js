/**
 * Universal Currency & Number Formatting Utilities
 * Supports Indian Rupee (₹), US Dollar ($), and all global currencies
 */

export function getCurrencySymbol(currency = 'INR') {
  const c = (currency || 'INR').toUpperCase();
  switch (c) {
    case 'INR': return '₹';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    default: return '₹';
  }
}

export function formatCurrency(val, currency = 'INR', showSign = false, compact = false) {
  if (val == null || isNaN(val)) {
    return `${getCurrencySymbol(currency)}0.00`;
  }
  const num = Number(val);
  const sign = num > 0 && showSign ? '+' : '';
  const sym = getCurrencySymbol(currency);
  const isNegative = num < 0;
  const abs = Math.abs(num);

  if (compact) {
    if (currency === 'INR') {
      if (abs >= 10000000) return `${sign}₹${(num / 10000000).toFixed(2)} Cr`;
      if (abs >= 100000) return `${sign}₹${(num / 100000).toFixed(2)} L`;
      if (abs >= 1000) return `${sign}₹${(num / 1000).toFixed(1)} K`;
    } else {
      if (abs >= 1000000000) return `${sign}${sym}${(num / 1000000000).toFixed(2)} B`;
      if (abs >= 1000000) return `${sign}${sym}${(num / 1000000).toFixed(2)} M`;
      if (abs >= 1000) return `${sign}${sym}${(num / 1000).toFixed(1)} K`;
    }
  }

  if (currency === 'INR') {
    // Standard Indian comma grouping (e.g. 10,50,230.50)
    const parts = abs.toFixed(2).split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    let lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    const formatted = `${formattedInt}.${decimalPart}`;

    if (isNegative) return `-₹${formatted}`;
    return `${sign}₹${formatted}`;
  }

  // Western standard comma grouping
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  if (isNegative) return `-${sym}${formatted}`;
  return `${sign}${sym}${formatted}`;
}

export function formatINR(val, showSign = false, compact = false) {
  return formatCurrency(val, 'INR', showSign, compact);
}

export function formatPercent(val, showSign = true) {
  if (val == null || isNaN(val)) return '0.00%';
  const num = Number(val);
  const sign = num > 0 && showSign ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

export function formatQty(qty) {
  if (qty == null || isNaN(qty)) return '0';
  return Number(qty).toLocaleString('en-IN');
}

export function formatDate(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function isIndianMarketOpen() {
  const now = new Date();
  // Get current UTC time and convert to IST (UTC + 5:30)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 3600000 * 5.5);
  
  const day = ist.getDay(); // 0 is Sunday, 6 is Saturday
  if (day === 0 || day === 6) return false;

  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Indian market open: 9:15 AM (555 mins) to 3:30 PM (930 mins)
  return timeInMinutes >= 555 && timeInMinutes <= 930;
}
