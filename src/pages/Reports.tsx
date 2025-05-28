
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ReportsFilters } from '@/components/ReportsFilters';
import { SalesSummaryCards } from '@/components/SalesSummaryCards';
import { DetailedReportsTable } from '@/components/DetailedReportsTable';
import { SalesChartSection } from '@/components/SalesChartSection';
import { ItemSalesSummary } from '@/components/ItemSalesSummary';
import { ExportCSVButton } from '@/components/ExportCSVButton';
import { useReportsData } from '@/hooks/useReportsData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, FileText, Package } from 'lucide-react';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface ReportFilters {
  dateRange: DateRange;
  period: 'week' | 'month' | 'custom';
  photocopierId?: string;
}

const Reports = () => {
  const { user, loading: authLoading } = useAuth();
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    period: 'month'
  });

  const [activeTab, setActiveTab] = useState<string>('table');

  const { 
    summaryData, 
    detailedData, 
    loading: reportsLoading,
    refetch 
  } = useReportsData(filters);

  if (authLoading) return <LoadingSpinner />;
  if (!user) return <AuthForm />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Reportes de Ventas
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Analiza tus ventas con reportes detallados y exporta los datos
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6 lg:space-y-8">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Datos Detallados</span>
              <span className="sm:hidden">Datos</span>
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Resumen por Artículo</span>
              <span className="sm:hidden">Artículos</span>
            </TabsTrigger>
            <TabsTrigger value="chart" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Gráficos</span>
              <span className="sm:hidden">Gráficos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="space-y-4 md:space-y-6 lg:space-y-8">
            <ReportsFilters 
              filters={filters} 
              onFiltersChange={setFilters}
              loading={reportsLoading}
            />

            {reportsLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <SalesSummaryCards data={summaryData} />
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                      Detalle de Ventas
                    </h2>
                    <ExportCSVButton 
                      data={detailedData} 
                      filters={filters}
                      disabled={detailedData.length === 0}
                    />
                  </div>
                  
                  <DetailedReportsTable data={detailedData} />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="items" className="space-y-4 md:space-y-6 lg:space-y-8">
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Resumen por Artículo
              </h2>
              <p className="text-sm md:text-base text-gray-600">
                Análisis de ventas agrupado por productos y servicios
              </p>
            </div>
            <ItemSalesSummary />
          </TabsContent>

          <TabsContent value="chart">
            <SalesChartSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Reports;
