
import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptySharedModulesState = () => {
  return (
    <div className="text-center py-8 bg-gray-50 rounded-lg">
      <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">No tienes acceso a módulos compartidos</p>
      <p className="text-gray-400 text-sm">Cuando alguien comparta acceso contigo, aparecerán aquí</p>
    </div>
  );
};
