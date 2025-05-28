
import { useSaveSales } from './useSaveSales';
import { useLoadSales } from './useLoadSales';

export const useSalesRecords = () => {
  const { loading, saveDailySales } = useSaveSales();
  const { loadDailySales, loadLatestCounters } = useLoadSales();

  return {
    loading,
    saveDailySales,
    loadDailySales,
    loadLatestCounters,
  };
};
