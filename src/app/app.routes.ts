import {Routes} from '@angular/router';
import {coreRoutes} from './core/core.routes';
import {IsAuthorizedGuard} from './common/auth/auth.guard';

export const appRoutes: Routes = [
  ...coreRoutes,
  {
    path: 'org',
    loadChildren: './org/org-feature.module#OrgFeatureModule',
    canActivateChild: [
      IsAuthorizedGuard
    ]
  },
  {
    path: 'proposal',
    loadChildren: './proposal/proposal-feature.module#ProposalFeatureModule',
    canActivateChild: [
      IsAuthorizedGuard
    ]
  },
  {
    path: 'login',
    loadChildren: './user/features/login/login.module#UserLoginFeatureModule',
  },
  {
    path: 'public',
    loadChildren: './public/public.module#PublicModule'
  }
];
