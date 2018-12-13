import {Inject, Injectable} from '@angular/core';
import {createSelector, select, Selector, Store} from '@ngrx/store';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot} from '@angular/router';
import {ApplicationState} from './application.state';
import {filter, first, map, mapTo, skip, switchMap, tap, timeout} from 'rxjs/operators';
import {Observable, of, race, zip} from 'rxjs';
import {OAuth2Token} from './oauth2-token.model';
import {AuthService} from './auth.service';
import {RouterData} from '../router.types';
import {AUTH_STATE_SELECTOR} from './auth.state';
import {AuthorizationCodeGrantResponse} from './authorization-code-grant.model';
import {AuthApplication} from './application.model';
import {AuthorizationCodeGrantTokenExchange} from './auth.actions';


@Injectable()
export class IsAuthorizedGuard implements CanActivate, CanActivateChild {
  constructor(
    readonly store: Store<any>,
    readonly authService: AuthService<any>,
  ) {}

  appForRouteData(data: RouterData) {
    const authData = data['common.auth'];
    return this.authService.appForKey(authData && authData.app);
  }

  canActivate(snapshot: ActivatedRouteSnapshot) {
    const data = RouterData.fromActivatedRouteSnapshot(snapshot);
    const app = this.appForRouteData(data);

    const authGrantResponse = AuthorizationCodeGrantResponse.fromQueryParams(snapshot.queryParamMap);
    if (authGrantResponse != null) {
      this.store.dispatch(new AuthorizationCodeGrantTokenExchange(authGrantResponse, {app: app.name}));
    }

    return zip(
      app.state$.pipe(select(ApplicationState.selectAccessToken)),
      app.state$.pipe(select(ApplicationState.isAuthCodeGrantInProgress))
    ).pipe(
      filter(([_, isGrantInProgress]) => !isGrantInProgress),
      map(([token, _]) => token !== undefined),
      first()
    );
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(childRoute);
  }
}
