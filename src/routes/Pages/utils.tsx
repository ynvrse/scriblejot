import { Route } from 'react-router-dom';

import { objectInsertIf } from '@/utils/insertIf';

import { Routes } from '../types';

function getPageHeight(): string {
    const topSpacing = 64 + 8; // 64px untuk header, 8px untuk margin misalnya
    return `calc(100vh - ${topSpacing}px)`;
}

function renderRoutes(routes: Routes) {
    return routes.map(({ path, component: Component, routes: nestedRoutes }) => {
        return (
            <Route
                key={path}
                path={path}
                element={<Component />}
                {...objectInsertIf(nestedRoutes, {
                    children: nestedRoutes && renderRoutes(nestedRoutes as Routes),
                })}
            />
        );
    });
}

export { getPageHeight, renderRoutes };
