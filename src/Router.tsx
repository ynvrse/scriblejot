import { createBrowserRouter } from 'react-router-dom';

import { Applayout } from './components/layouts/AppLayout';

import NotFoundPage from './pages/404';

import Dashboard from './pages/Dashboard';

import Login from './pages/Login';

import Profile from './pages/Profile';
import Setting from './pages/Setting';

export const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <Applayout />,
            children: [
                {
                    path: '',
                    element: <Dashboard />,
                },
                {
                    path: '/login',
                    element: <Login />,
                },

                {
                    path: 'settings',
                    element: <Setting />,
                },
                {
                    path: 'profile',
                    element: <Profile />,
                },
            ],
        },
        {
            path: '*',
            element: <NotFoundPage />,
        },
    ],
    {
        basename: global.basename,
    },
);
