/**
 * Market Hours Calculator (IST)
 * 
 * 1. Indian Equities (NSE/BSE):
 *    - Monday - Friday: 9:15 AM to 3:30 PM IST
 *    - Saturday & Sunday: Closed
 * 
 * 2. US Equities (NYSE/NASDAQ):
 *    - Daylight Saving Time (mid-March to early November):
 *      7:00 PM to 1:30 AM IST (Mon-Fri night)
 *    - Standard Time (early November to mid-March):
 *      8:00 PM to 2:30 AM IST (Mon-Fri night)
 *    - Weekends: Closed
 */

/**
 * Check if the US is currently in Daylight Saving Time (DST)
 */
export function isUSDST(date = new Date()) {
  const year = date.getUTCFullYear();
  
  // Second Sunday in March (2:00 AM Eastern Time = 7:00 AM UTC)
  const marchFirst = new Date(Date.UTC(year, 2, 1));
  const marchFirstDay = marchFirst.getUTCDay();
  const dstStartDay = (marchFirstDay === 0 ? 8 : 15 - marchFirstDay);
  const dstStart = new Date(Date.UTC(year, 2, dstStartDay, 7, 0, 0));
  
  // First Sunday in November (2:00 AM Eastern Time = 6:00 AM UTC)
  const novFirst = new Date(Date.UTC(year, 10, 1));
  const novFirstDay = novFirst.getUTCDay();
  const dstEndDay = (novFirstDay === 0 ? 1 : 8 - novFirstDay);
  const dstEnd = new Date(Date.UTC(year, 10, dstEndDay, 6, 0, 0));
  
  return date >= dstStart && date < dstEnd;
}

/**
 * Get current Indian (NSE/BSE) Market Status
 */
export function getIndianMarketStatus(date = new Date()) {
  // Convert current time to IST (UTC + 5:30)
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 3600000 * 5.5);
  
  const day = ist.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = day === 0 || day === 6;
  
  const totalMinutes = ist.getHours() * 60 + ist.getMinutes();
  const openMinutes = 9 * 60 + 15;  // 9:15 AM = 555
  const closeMinutes = 15 * 60 + 30; // 3:30 PM = 930
  
  if (!isWeekend && totalMinutes >= openMinutes && totalMinutes < closeMinutes) {
    return {
      isOpen: true,
      label: 'LIVE',
      market: 'NSE',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      borderColor: 'rgba(16, 185, 129, 0.4)',
      tooltip: 'NSE/BSE Market is Open (9:15 AM - 3:30 PM IST)'
    };
  }

  return {
    isOpen: false,
    label: 'CLOSED',
    market: 'NSE',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.12)',
    borderColor: 'rgba(148, 163, 184, 0.25)',
    tooltip: 'Market Closed • Next session starts at 9:15 AM IST'
  };
}

/**
 * Get current US (NYSE/NASDAQ) Market Status
 */
export function getUSMarketStatus(date = new Date()) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 3600000 * 5.5);
  
  const day = ist.getDay();
  const totalMinutes = ist.getHours() * 60 + ist.getMinutes();
  
  const inDST = isUSDST(date);
  const openHour = inDST ? 19 : 20; // 7:00 PM or 8:00 PM IST
  const closeHour = inDST ? 1 : 2;   // 1:30 AM or 2:30 AM IST
  
  const openMinutes = openHour * 60;
  const closeMinutes = closeHour * 60 + 30;
  
  // US trading spans across midnight in IST:
  // Mon-Fri evening session: from 19:00 (or 20:00) to 23:59
  // Tue-Sat morning session: from 00:00 to 01:30 (or 02:30)
  let isOpen = false;
  if (day >= 1 && day <= 5 && totalMinutes >= openMinutes) {
    isOpen = true;
  } else if (day >= 2 && day <= 6 && totalMinutes < closeMinutes) {
    isOpen = true;
  }
  
  if (isOpen) {
    return {
      isOpen: true,
      label: 'US LIVE',
      market: 'US',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      borderColor: 'rgba(16, 185, 129, 0.4)',
      tooltip: `US Market Open (${inDST ? '7:00 PM - 1:30 AM' : '8:00 PM - 2:30 AM'} IST)`
    };
  }

  return {
    isOpen: false,
    label: 'US CLOSED',
    market: 'US',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.12)',
    borderColor: 'rgba(148, 163, 184, 0.25)',
    tooltip: `US Market Closed • Opens at ${inDST ? '7:00 PM' : '8:00 PM'} IST`
  };
}

/**
 * Get dynamic market status for a specific stock or global navbar
 */
export function getMarketStatusForSymbol(symbol) {
  if (!symbol) {
    const indian = getIndianMarketStatus();
    if (indian.isOpen) return indian;
    const us = getUSMarketStatus();
    if (us.isOpen) return us;
    return indian; // Default closed
  }

  const isUS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', '^GSPC', '^IXIC', '^DJI'].includes(symbol)
    || (!symbol.endsWith('.NS') && !symbol.endsWith('.BO') && !symbol.startsWith('^NSE') && !symbol.startsWith('^BSE') && !symbol.startsWith('^CNX') && !symbol.startsWith('^CRSLDX'));

  return isUS ? getUSMarketStatus() : getIndianMarketStatus();
}

/**
 * Returns true only if either the Indian or US market is currently actively trading
 */
export function isAnyMarketOpen() {
  return getIndianMarketStatus().isOpen || getUSMarketStatus().isOpen;
}

/**
 * Returns true if a specific stock's exchange is currently open
 */
export function shouldPollSymbol(symbol) {
  if (!symbol) return false;
  return getMarketStatusForSymbol(symbol).isOpen;
}

