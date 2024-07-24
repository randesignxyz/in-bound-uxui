
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
  
    // Format the number
    const formattedAmount = formatter.format(amount);
  
    // Replace the default currency symbol with the custom one
    const formattedWithCustomSymbol = formattedAmount.replace(
      new RegExp(`\\${formatter.formatToParts(0).find(part => part.type === 'currency').value}`),
      symbol
    );
  
    return formattedWithCustomSymbol;
  }