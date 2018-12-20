import {Routes} from '@angular/router';
import {coreRoutes} from './core/core.routes';
import {IsAuthorizedGuard} from './common/auth/auth.guard';
import {AuthorizationCodeGrantRedirectHandlerGuard} from './common/auth/authorization-code-grant-redirect-handler.guard';
import {AppComponent} from './app.component';

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: AppComponent,
    canActivate: [AuthorizationCodeGrantRedirectHandlerGuard],
  },
  {
    path: 'org',
    loadChildren: './org/feature/feature.module#OrgFeatureModule',
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
    path: 'home',
    loadChildren: './user/features/home/home.module#UserHomeFeatureModule'
  }
];
