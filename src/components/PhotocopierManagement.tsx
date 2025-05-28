import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePhotocopiers } from '@/hooks/usePhotocopiers';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SharedAccessManager } from './SharedAccessManager';

export const PhotocopierManagement = () => {
  const { photocopiers, loading, refetch } = usePhotocopiers();
  const { user } = useAuth();
  const { toast } = useToast();
  const [newPhotocopier, setNewPhotocopier] = useState({ nombre: '', ubicacion: '' });
  const [editingPhotocopiers, setEditingPhotocopiers] = useState<Record<string, any>>({});

  const handleAddPhotocopier = async () => {
    if (!user || !newPhotocopier.nombre.trim()) {
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
        .insert({
          usuario_id: user.id,
          nombre: newPhotocopier.nombre,
          ubicacion: newPhotocopier.ubicacion || null,
        });

      if (error) throw error;

      setNewPhotocopier({ nombre: '', ubicacion: '' });
      toast({
        title: "Fotocopiadora agregada",
        description: "La nueva fotocopiadora se ha agregado correctamente.",
      });
      refetch();
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
    const editedData = editingPhotocopiers[id];
    if (!editedData || !editedData.nombre?.trim()) {
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
          nombre: editedData.nombre,
          ubicacion: editedData.ubicacion || null,
        })
        .eq('id', id)
        .eq('usuario_id', user?.id);

      if (error) throw error;

      setEditingPhotocopiers(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      toast({
        title: "Fotocopiadora actualizada",
        description: "La fotocopiadora se ha actualizado correctamente.",
      });
      refetch();
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
    if (!confirm('¿Estás seguro de que quieres eliminar esta fotocopiadora? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('fotocopiadoras')
        .delete()
        .eq('id', id)
        .eq('usuario_id', user?.id);

      if (error) throw error;

      toast({
        title: "Fotocopiadora eliminada",
        description: "La fotocopiadora se ha eliminado correctamente.",
      });
      refetch();
    } catch (error) {
      console.error('Error deleting photocopier:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la fotocopiadora.",
        variant: "destructive",
      });
    }
  };

  const startEditing = (photocopier: any) => {
    setEditingPhotocopiers(prev => ({
      ...prev,
      [photocopier.id]: {
        nombre: photocopier.nombre || '',
        ubicacion: photocopier.ubicacion || '',
      }
    }));
  };

  const cancelEditing = (id: string) => {
    setEditingPhotocopiers(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const updateEditingField = (id: string, field: string, value: string) => {
    setEditingPhotocopiers(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      }
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Gestión de Fotocopiadoras
          </CardTitle>
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Gestión de Fotocopiadoras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Photocopier */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Agregar Nueva Fotocopiadora</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label htmlFor="new-photocopier-name">Nombre</Label>
                <Input
                  id="new-photocopier-name"
                  value={newPhotocopier.nombre}
                  onChange={(e) => setNewPhotocopier(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Fotocopiadora Principal"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="new-photocopier-location">Ubicación</Label>
                <Input
                  id="new-photocopier-location"
                  value={newPhotocopier.ubicacion}
                  onChange={(e) => setNewPhotocopier(prev => ({ ...prev, ubicacion: e.target.value }))}
                  placeholder="Ej: Oficina, Sucursal 1"
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
              <p className="text-gray-500 text-center py-8">
                No hay fotocopiadoras configuradas. Agrega una nueva arriba.
              </p>
            ) : (
              <div className="space-y-3">
                {photocopiers.map((photocopier) => {
                  const isEditing = editingPhotocopiers[photocopier.id];
                  
                  return (
                    <div key={photocopier.id} className="border rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          {isEditing ? (
                            <Input
                              value={isEditing.nombre}
                              onChange={(e) => updateEditingField(photocopier.id, 'nombre', e.target.value)}
                              placeholder="Nombre de la fotocopiadora"
                            />
                          ) : (
                            <div>
                              <h4 className="font-medium">{photocopier.nombre}</h4>
                              <p className="text-sm text-gray-500">{photocopier.ubicacion || 'Sin ubicación'}</p>
                            </div>
                          )}
                        </div>
                        
                        {isEditing && (
                          <div className="flex-1">
                            <Input
                              value={isEditing.ubicacion}
                              onChange={(e) => updateEditingField(photocopier.id, 'ubicacion', e.target.value)}
                              placeholder="Ubicación"
                            />
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                onClick={() => handleUpdatePhotocopier(photocopier.id)}
                                size="sm"
                                variant="default"
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => cancelEditing(photocopier.id)}
                                size="sm"
                                variant="outline"
                              >
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => startEditing(photocopier)}
                                size="sm"
                                variant="outline"
                              >
                                Editar
                              </Button>
                              <Button
                                onClick={() => handleDeletePhotocopier(photocopier.id)}
                                size="sm"
                                variant="destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shared Access Management for each photocopier */}
      {photocopiers.map((photocopier) => (
        <SharedAccessManager
          key={photocopier.id}
          fotocopiadoraId={photocopier.id}
          fotocopiadoraNombre={photocopier.nombre || 'Fotocopiadora'}
        />
      ))}
    </div>
  );
};
