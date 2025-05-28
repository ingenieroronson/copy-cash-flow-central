
import { useSaveSales } from './useSaveSales';
import { useLoadSales } from './useLoadSales';

export const useSalesRecords = () => {
  const { loading, saveDailySales } = useSaveSales();
  const { loadDailySales } = useLoadSales();

  return {
    loading,
    saveDailySales,
    loadDailySales,
  };
};
