import { createContext } from 'react';

export interface RouterContextType {
  pathname: string;
  navigate: (to: string, replace?: boolean) => void;
}

export const RouterContext = createContext<RouterContextType | undefined>(undefined);
