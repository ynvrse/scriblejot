import type { ComponentType, FC } from 'react';
import { PathRouteProps } from 'react-router';

type Routes = Array<PathRouteProps & PathRouteCustomProps>;

type PathRouteCustomProps = {
  title?: string;
  component: FC;
  icon?: ComponentType<{ className?: string }>; // untuk Lucide/Heroicons
  routes?: Routes;
};

export type { Routes };
