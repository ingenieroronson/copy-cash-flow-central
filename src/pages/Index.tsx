import React, { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    window.location.replace('/settings');
  }, []);

  return null;
};

export default Index;
