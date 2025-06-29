
export const calculateServiceTotal = (service: any, price: number) => {
  const difference = Math.max(0, service.today - (service.errors || 0) - service.yesterday);
  return difference * price;
};

export const calculateSupplyTotal = (supply: any, price: number) => {
  const sold = Math.max(0, supply.startStock - supply.endStock);
  return sold * price;
};

export const calculateServiceDifference = (service: any) => {
  return Math.max(0, service.today - (service.errors || 0) - service.yesterday);
};
