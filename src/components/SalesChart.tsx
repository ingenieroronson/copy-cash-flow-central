
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { formatDateInMexicoTimezone } from '@/utils/dateUtils';

export interface ChartDataPoint {
  date: string;
  services: number;
  procedures: number;
  supplies: number;
  total: number;
}

interface SalesChartProps {
  data: ChartDataPoint[];
  selectedDataTypes: string[];
}

const chartConfig = {
  services: {
    label: "Servicios",
    color: "#3B82F6"
  },
  procedures: {
    label: "Procedimientos",
    color: "#8B5CF6"
  },
  supplies: {
    label: "Suministros", 
    color: "#10B981"
  },
  total: {
    label: "Total",
    color: "#F59E0B"
  }
};

export const SalesChart = ({ data, selectedDataTypes }: SalesChartProps) => {
  const formatTooltipLabel = (label: string) => {
    return formatDateInMexicoTimezone(label, 'dd/MM/yyyy');
  };

  const formatTooltipValue = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="h-80 w-full">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => formatDateInMexicoTimezone(value, 'dd/MM')}
              className="text-xs"
            />
            <YAxis 
              tickFormatter={(value) => `$${value}`}
              className="text-xs"
            />
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  labelFormatter={formatTooltipLabel}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
                />
              }
            />
            <Legend />
            
            {selectedDataTypes.includes('services') && (
              <Line 
                type="monotone" 
                dataKey="services" 
                stroke={chartConfig.services.color}
                strokeWidth={2}
                name={chartConfig.services.label}
                dot={{ fill: chartConfig.services.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            
            {selectedDataTypes.includes('procedures') && (
              <Line 
                type="monotone" 
                dataKey="procedures" 
                stroke={chartConfig.procedures.color}
                strokeWidth={2}
                name={chartConfig.procedures.label}
                dot={{ fill: chartConfig.procedures.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            
            {selectedDataTypes.includes('supplies') && (
              <Line 
                type="monotone" 
                dataKey="supplies" 
                stroke={chartConfig.supplies.color}
                strokeWidth={2}
                name={chartConfig.supplies.label}
                dot={{ fill: chartConfig.supplies.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            
            {selectedDataTypes.includes('total') && (
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke={chartConfig.total.color}
                strokeWidth={2}
                name={chartConfig.total.label}
                dot={{ fill: chartConfig.total.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};
