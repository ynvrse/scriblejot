// root.tsx
import { Provider as JotaiProvider } from 'jotai';
import { ComponentType, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

import { ThemeProvider } from '@/components/theme-provider';
import { repoName } from './config';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

function render(App: ComponentType) {
    const isBuild = import.meta.env.MODE === 'production';
    const basename = isBuild ? `/${repoName}` : '';

    root.render(
        <StrictMode>
            <BrowserRouter basename={basename}>
                <JotaiProvider>
                    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                        <App />
                        <Toaster richColors />
                    </ThemeProvider>
                </JotaiProvider>
            </BrowserRouter>
        </StrictMode>,
    );
}

export default render;
