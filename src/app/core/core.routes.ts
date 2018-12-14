import {Routes} from '@angular/router';
import {AuthorizationCodeGrantRedirectHandlerGuard} from '../common/auth/authorization-code-grant-redirect-handler.guard';

export const coreRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [AuthorizationCodeGrantRedirectHandlerGuard],
    children: []
  }
];
