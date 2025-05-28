import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Save, Printer, Edit2 } from 'lucide-react';
import { usePhotocopiers, Photocopier } from '@/hooks/usePhotocopiers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const PhotocopierManagement = () => {
  const { photocopiers, loading, refetch } = usePhotocopiers();
  const { toast } = useToast();
  const [newPhotocopier, setNewPhotocopier] = useState({ name: '', location: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', location: '' });
  const { user } = useAuth();

  const handleAddPhotocopier = async () => {
    if (!newPhotocopier.name.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('fotocopiadoras')
        .insert({
          usuario_id: user.id,
          nombre: newPhotocopier.name,
          ubicacion: newPhotocopier.location
        });

      if (error) throw error;

      setNewPhotocopier({ name: '', location: '' });
      refetch();
      toast({
        title: "Fotocopiadora agregada",
        description: "La nueva fotocopiadora se ha agregado correctamente.",
      });
    } catch (error) {
      console.error('Error adding photocopier:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la fotocopiadora.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePhotocopier = async (id: string) => {
    if (!editData.name.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('fotocopiadoras')
        .update({
          nombre: editData.name,
          ubicacion: editData.location
        })
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      refetch();
      toast({
        title: "Fotocopiadora actualizada",
        description: "La fotocopiadora se ha actualizado correctamente.",
      });
    } catch (error) {
      console.error('Error updating photocopier:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la fotocopiadora.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePhotocopier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fotocopiadoras')
        .delete()
        .eq('id', id);

      if (error) throw error;

      refetch();
      toast({
        title: "Fotocopiadora eliminada",
        description: "La fotocopiadora se ha eliminado correctamente.",
      });
    } catch (error) {
      console.error('Error deleting photocopier:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la fotocopiadora.",
        variant: "destructive",
      });
    }
  };

  const startEditing = (photocopier: Photocopier) => {
    setEditingId(photocopier.id);
    setEditData({
      name: photocopier.nombre || '',
      location: photocopier.ubicacion || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({ name: '', location: '' });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Gestión de Fotocopiadoras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando fotocopiadoras...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
          <Printer className="w-6 h-6 text-orange-500" />
          Gestión de Fotocopiadoras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Photocopier */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-3">Agregar Nueva Fotocopiadora</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="photocopier-name">Nombre</Label>
              <Input
                id="photocopier-name"
                value={newPhotocopier.name}
                onChange={(e) => setNewPhotocopier(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Fotocopiadora Principal"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="photocopier-location">Ubicación</Label>
              <Input
                id="photocopier-location"
                value={newPhotocopier.location}
                onChange={(e) => setNewPhotocopier(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ej: Oficina Principal"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddPhotocopier} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </div>

        {/* Existing Photocopiers */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Fotocopiadoras Existentes</h3>
          {photocopiers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay fotocopiadoras configuradas. Agrega una nueva arriba.</p>
          ) : (
            <div className="space-y-3">
              {photocopiers.map((photocopier) => (
                <div key={photocopier.id} className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 rounded-lg">
                  {editingId === photocopier.id ? (
                    <>
                      <div className="flex-1">
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nombre de la fotocopiadora"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          value={editData.location}
                          onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Ubicación"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdatePhotocopier(photocopier.id)}
                          size="sm"
                          variant="default"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={cancelEditing}
                          size="sm"
                          variant="outline"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="font-medium">{photocopier.nombre || 'Sin nombre'}</div>
                        <div className="text-sm text-gray-500">{photocopier.ubicacion || 'Sin ubicación'}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => startEditing(photocopier)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeletePhotocopier(photocopier.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
