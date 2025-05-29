
import React from 'react';
import { Users } from 'lucide-react';

export const EmptySharedAccessState = () => {
  return (
    <div className="text-center py-8 bg-gray-50 rounded-lg">
      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">No has compartido acceso con ningún usuario</p>
      <p className="text-gray-400 text-sm">Los accesos compartidos aparecerán aquí</p>
    </div>
  );
};
