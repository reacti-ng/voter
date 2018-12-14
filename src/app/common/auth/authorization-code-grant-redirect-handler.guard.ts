import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {AuthorizationCodeGrantResponse} from './authorization-code-grant.model';
import {select, Store} from '@ngrx/store';
import {AuthorizationCodeGrantTokenExchange} from './auth.actions';
import {AuthService} from './auth.service';
import {filter, first, map, mapTo, tap} from 'rxjs/operators';
import {ApplicationState} from './application.state';


@Injectable()
export class AuthorizationCodeGrantRedirectHandlerGuard implements CanActivate {
  constructor(
    readonly store: Store<any>,
    readonly authService: AuthService<any>,
    readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot) {
    const responseParams = AuthorizationCodeGrantResponse.fromQueryParams(route.queryParamMap);
    if (responseParams !== null) {
      this.store.dispatch(new AuthorizationCodeGrantTokenExchange(responseParams));
    }
    return this.authService.defaultApp.authFlowState$.pipe(
      filter(state => !state.authCodeGrantInProgress),
      first(),
      tap((state) => {
        this.router.navigate(state.token ? state.loginRedirect : ['/public']);
      }),
      mapTo(false)
    );
  }

}
