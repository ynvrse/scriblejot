import { Home, Settings } from 'lucide-react';

import asyncComponentLoader from '@/utils/loader';

import { Routes } from './types';

const routes: Routes = [
    {
        component: asyncComponentLoader(() => import('@/pages/Dashboard')),
        path: '/',
        title: 'Dashboard',
        icon: Home,
    },
    {
        component: asyncComponentLoader(() => import('@/pages/Setting')),
        path: '/setting',
        title: 'Setting',
        icon: Settings,
    },
    {
        component: asyncComponentLoader(() => import('@/pages/NotFound')),
        path: '*',
    },
];

export default routes;
