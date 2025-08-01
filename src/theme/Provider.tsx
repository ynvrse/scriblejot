// import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@/components/theme-provider';

import type { CustomThemeProviderProps } from './types';

function CustomThemeProvider({ children }: CustomThemeProviderProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {children}
    </ThemeProvider>
  );
}

export default CustomThemeProvider;
