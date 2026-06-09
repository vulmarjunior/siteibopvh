import type { ReactNode } from 'react';

export interface DocumentSection {
  id: string;
  title: string;
  subtitle: string;
  content: ReactNode;
  icon: ReactNode;
}