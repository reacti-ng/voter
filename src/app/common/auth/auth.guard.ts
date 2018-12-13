import {Inject, Injectable} from '@angular/core';
import {createSelector, select, Selector, Store} from '@ngrx/store';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {ApplicationState} from './application.state';
import {first, map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {OAuth2Token} from './oauth2-token.model';
import {AuthService} from './auth.service';
import {RouterData} from '../router.types';
import {AUTH_STATE_SELECTOR} from './auth.state';


@Injectable()
export class IsAuthorizedGuard implements CanActivate {
  constructor(
    readonly authService: AuthService<any>,
    readonly store: Store<object>,
    @Inject(AUTH_STATE_SELECTOR) readonly authStateSelector: Selector<object, ApplicationState>
  ) {}

  readonly accessToken$ = this.store.pipe(
    select(createSelector(this.authStateSelector, (authState => authState.token)))
  );

  canActivate(snapshot: ActivatedRouteSnapshot) {
    let accessToken$: Observable<OAuth2Token | undefined> | undefined;
    const data = RouterData.fromActivatedRouteSnapshot(snapshot);

    // If the page can be a target of a redirect of a login, check for the 'code' and 'state' parameters
    // in the snapshot. If they're present, it means that this page was entered via a redirect from
    // the core server. Finalize the login process before activating the route.
    if (data.isLoginRedirectPage) {
      const authCode = snapshot.paramMap.get('code');
      if (authCode !== null) {
        /* FIXME: code and state params needed to be loaded of redirect routes now that multiple tokens */
        // accessToken$ = this.authService.exchangeAuthCodeForToken(authCode, snapshot.paramMap.get('state'));
      }
    }
    if (!accessToken$) {
      accessToken$ = this.accessToken$.pipe(first());
    }

    return accessToken$.pipe(map(accessToken => accessToken !== undefined));
  }
}
