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
    canActivateChild: [IsAuthorizedGuard]
  },
  {
    path: 'proposal',
    loadChildren: './proposal/feature/feature.module#ProposalFeatureModule',
    canActivateChild: [IsAuthorizedGuard]
  },
  {
    path: 'login',
    loadChildren: './user/feature/login/login.module#UserLoginFeatureModule',
  },
  {
    path: 'home',
    loadChildren: './user/feature/home/home.module#UserHomeFeatureModule'
  },
  {
    path: 'profile',
    loadChildren: './user/feature/profile/profile.module#UserProfileFeatureModule'
  }
];
