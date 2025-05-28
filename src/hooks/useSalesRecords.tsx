
import { useSaveSales } from './useSaveSales';
import { useLoadSales } from './useLoadSales';

export const useSalesRecords = () => {
  const { loading, saveDailySales } = useSaveSales();
  const { loadDailySales, loadServiceCounterPreload, loadLatestCounters } = useLoadSales();

  return {
    loading,
    saveDailySales,
    loadDailySales,
    loadServiceCounterPreload,
    loadLatestCounters, // Kept for backward compatibility
  };
};
