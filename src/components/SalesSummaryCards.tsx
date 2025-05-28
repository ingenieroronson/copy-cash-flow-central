
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, FileText, Package } from 'lucide-react';

export interface SummaryData {
  totalSales: number;
  servicesSales: number;
  suppliesSales: number;
  totalTransactions: number;
}

interface SalesSummaryCardsProps {
  data: SummaryData;
}

export const SalesSummaryCards = ({ data }: SalesSummaryCardsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const summaryCards = [
    {
      title: 'Ventas Totales',
      value: formatCurrency(data.totalSales),
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Servicios',
      value: formatCurrency(data.servicesSales),
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Suministros',
      value: formatCurrency(data.suppliesSales),
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Días con ventas',
      value: data.totalTransactions === 1 ? '1 día registrado' : `${data.totalTransactions} días registrados`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
      {summaryCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className={`${card.bgColor} border-0 shadow-sm`}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${card.color} text-white`}>
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <CardTitle className="text-sm md:text-base font-medium text-gray-700">
                  {card.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                {card.value}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
