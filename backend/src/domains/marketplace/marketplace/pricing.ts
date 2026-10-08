export function serviceCost(price: number, priceType: string, hours: number) {
 const units = priceType === 'DAILY' ? Math.ceil(hours / 24) : priceType === 'FIXED' ? 1 : hours;
 return Math.round(price * units * 100) / 100;
}

// Street addresses cannot be reliably anonymized by splitting free text.
export const PRIVATE_LOCATION = 'Location shared after agreement';
