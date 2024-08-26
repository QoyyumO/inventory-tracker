// components/ThemeProvider.tsx
'use client';

import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { ReactNode, useMemo } from 'react';
import getTheme from '../theme';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useMemo(() => getTheme(), []);

  return <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>;
}