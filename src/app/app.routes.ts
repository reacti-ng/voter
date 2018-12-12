import {Routes} from '@angular/router';
import {coreRoutes} from './core/core.routes';


export const appRoutes: Routes = [
  ...coreRoutes,
  {
    path: 'org',
    loadChildren: './org/org-feature.module#OrgFeatureModule'
  },
  {
    path: 'proposal',
    loadChildren: './features/proposal/proposal-feature.module#ProposalFeatureModule'
  },
  {
    path: 'login',
    loadChildren: './features/login/login-feature.module#LoginFeatureModule'
  },
  {
    path: 'public',
    loadChildren: './features/public/public.module#PublicModule'
  }
];
