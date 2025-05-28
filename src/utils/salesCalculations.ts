
export const calculateServiceTotal = (service: any, price: number) => {
  const difference = Math.max(0, service.today - service.yesterday);
  return difference * price;
};

export const calculateSupplyTotal = (supply: any, price: number) => {
  const sold = Math.max(0, supply.startStock - supply.endStock);
  return sold * price;
};
