import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {filter, first, switchMap} from 'rxjs/operators';

import {authorizationCodeGrantResponseFromQueryParams} from './authorization-code-grant.model';
import {AuthorizationCodeGrantTokenExchange} from './auth.actions';
import {AuthService} from './auth.service';

@Injectable()
export class AuthorizationCodeGrantRedirectHandlerGuard implements CanActivate {
  constructor(
    readonly store: Store<any>,
    readonly authService: AuthService<any>,
    readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot) {
    const responseParams = authorizationCodeGrantResponseFromQueryParams(route.queryParamMap);
    if (responseParams !== null) {
      this.store.dispatch(new AuthorizationCodeGrantTokenExchange(responseParams));
    }
    return this.authService.defaultApp.authFlowState$.pipe(
      filter( (state) => !state.authCodeGrantInProgress),
      switchMap((state) => {
        return this.router.navigate(state.token ? state.loginRedirect : ['/public']);
      }),
      first()
    );
  }

}
