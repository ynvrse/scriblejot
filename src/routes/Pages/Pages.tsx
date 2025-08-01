// routes/pages/pages.tsx
import { Routes } from 'react-router-dom';
import routes from '..';
import { getPageHeight, renderRoutes } from './utils';

function Pages() {
    const height = getPageHeight();

    return (
        <div style={{ height }}>
            <Routes>{renderRoutes(routes)}</Routes>
        </div>
    );
}

export default Pages;
