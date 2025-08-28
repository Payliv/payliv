export const currencies = [
  { code: 'XOF', name: 'Franc CFA (BCEAO)', symbol: 'FCFA' },
  { code: 'XAF', name: 'Franc CFA (BEAC)', symbol: 'FCFA' },
  { code: 'NGN', name: 'Naira Nigérian', symbol: '₦' },
  { code: 'USD', name: 'Dollar Américain', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GHS', name: 'Cedi Ghanéen', symbol: 'GH₵' },
  { code: 'KES', name: 'Shilling Kényan', symbol: 'KSh' },
];

export const getCurrencySymbol = (code) => {
  const currency = currencies.find(c => c.code === code);
  return currency ? currency.symbol : code;
};