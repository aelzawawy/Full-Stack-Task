import { useContext } from 'react';
import { RouterContext } from '../context/routerContextValue';
import type { RouterContextType } from '../context/routerContextValue';

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
