
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { usePricing } from '@/hooks/usePricing';
import { useToast } from '@/hooks/use-toast';

export const ServicePricesSection = () => {
  const { pricing, updateServicePrice, loading } = usePricing();
  const { toast } = useToast();

  const [servicePrices, setServicePrices] = useState({
    color_copies: 0,
    bw_copies: 0,
    color_prints: 0,
    bw_prints: 0
  });

  useEffect(() => {
    if (pricing.length > 0) {
      const prices = pricing.reduce((acc, item) => {
        if (item.service_type) {
          acc[item.service_type] = item.unit_price;
        }
        return acc;
      }, {} as any);
      setServicePrices(prev => ({ ...prev, ...prices }));
    }
  }, [pricing]);

  const handleServicePriceUpdate = async (serviceType: 'color_copies' | 'bw_copies' | 'color_prints' | 'bw_prints', price: number) => {
    try {
      await updateServicePrice(serviceType, price);
      toast({
        title: "Precio actualizado",
        description: "El precio del servicio se ha actualizado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el precio del servicio.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Precios de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando precios...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">Precios de Servicios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="color-copies">Copias a color (MXN)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="color-copies"
                type="number"
                step="0.01"
                value={servicePrices.color_copies}
                onChange={(e) => setServicePrices(prev => ({ ...prev, color_copies: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
              <Button
                onClick={() => handleServicePriceUpdate('color_copies', servicePrices.color_copies)}
                size="sm"
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="bw-copies">Copias blanco y negro (MXN)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="bw-copies"
                type="number"
                step="0.01"
                value={servicePrices.bw_copies}
                onChange={(e) => setServicePrices(prev => ({ ...prev, bw_copies: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
              <Button
                onClick={() => handleServicePriceUpdate('bw_copies', servicePrices.bw_copies)}
                size="sm"
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="color-prints">Impresiones a color (MXN)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="color-prints"
                type="number"
                step="0.01"
                value={servicePrices.color_prints}
                onChange={(e) => setServicePrices(prev => ({ ...prev, color_prints: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
              <Button
                onClick={() => handleServicePriceUpdate('color_prints', servicePrices.color_prints)}
                size="sm"
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="bw-prints">Impresiones blanco y negro (MXN)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="bw-prints"
                type="number"
                step="0.01"
                value={servicePrices.bw_prints}
                onChange={(e) => setServicePrices(prev => ({ ...prev, bw_prints: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
              <Button
                onClick={() => handleServicePriceUpdate('bw_prints', servicePrices.bw_prints)}
                size="sm"
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
