
import React, { useState } from 'react';
import { SalesChart } from './SalesChart';
import { ChartFilters, ChartFilters as ChartFiltersType } from './ChartFilters';
import { ChartSummary } from './ChartSummary';
import { useChartData } from '@/hooks/useChartData';
import { exportSummaryToCSV } from '@/utils/chartExportUtils';
import { LoadingSpinner } from './LoadingSpinner';

export const SalesChartSection = () => {
  const [filters, setFilters] = useState<ChartFiltersType>({
    dataTypes: ['total', 'services', 'procedures', 'supplies'],
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }
  });

  const { chartData, summaryData, loading } = useChartData(filters);

  const handleExportCSV = () => {
    exportSummaryToCSV(summaryData);
  };

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <ChartFilters 
        filters={filters}
        onFiltersChange={setFilters}
        loading={loading}
      />

      {loading ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : chartData.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No hay datos de ventas para el período seleccionado.</p>
        </div>
      ) : (
        <>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">
              Gráfico de Ventas por Día
            </h2>
            <SalesChart 
              data={chartData} 
              selectedDataTypes={filters.dataTypes}
            />
          </div>

          <ChartSummary 
            data={summaryData}
            onExportCSV={handleExportCSV}
          />
        </>
      )}
    </div>
  );
};
