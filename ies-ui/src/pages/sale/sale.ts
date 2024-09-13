
export function formatCurrency(
    amount: number,
    symbol: string,
    currencyCode: string = 'USD' // Default to USD if not provided
  ): string {
    // Create a number formatter with custom options
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  
    const formattedAmount = formatter.format(amount || 0);

    // Extract the default currency symbol from the formatted parts
    const parts = formatter.formatToParts(0);
    const currencyPart = parts.find(part => part.type === 'currency');
    const defaultCurrencySymbol = currencyPart ? currencyPart.value : '';
  
    // Replace the default currency symbol with the custom one
    const formattedWithCustomSymbol = formattedAmount.replace(defaultCurrencySymbol, symbol);

    return formattedWithCustomSymbol;
  }


 export function formatQuantityIntl(quantity: number, decimalPlaces: number = 2): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
    }).format(quantity);
}