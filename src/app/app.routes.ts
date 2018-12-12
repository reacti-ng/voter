import {Routes} from '@angular/router';
import {coreRoutes} from './core/core.routes';

export const appRoutes: Routes = [
  ...coreRoutes,
  {
    path: 'poll',
    loadChildren: './poll/poll-feature.module#PollFeatureModule'
  },
  {
    path: 'org',
    loadChildren: './org/org-feature.module#OrgFeatureModule'
  },
  {
    path: 'proposal',
    loadChildren: './proposal/proposal-feature.module#ProposalFeatureModule'
  },
  {
    path: 'login',
    loadChildren: './user/features/login/login.module#UserLoginFeatureModule'
  },
  {
    path: 'public',
    loadChildren: './public/public.module#PublicModule'
  }
];
