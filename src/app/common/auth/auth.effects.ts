import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';


import {concatMap, filter, first, ignoreElements, map, switchMap, switchMapTo, tap} from 'rxjs/operators';

import {Store} from '@ngrx/store';
import {Actions, Effect, ofType, ROOT_EFFECTS_INIT} from '@ngrx/effects';

import {CALL_LOGIN_REDIRECT, CallLoginRedirect, cloneAuthAction, isAuthAction, SET_AUTH_TOKEN, SetAuthToken} from './auth.actions';
import {AUTH_DEFAULT_APPLICATION} from './application.model';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
import {loadLoginRedirectAction} from './authorization-code-grant.effects';
import {defer} from 'rxjs';


@Injectable()
export class AuthEffects {

  constructor(
    readonly action$: Actions,
    readonly store: Store<object>,
    readonly router: Router,
    readonly authService: AuthService<object>,
    @Inject(DOCUMENT) readonly document: Document,
  ) {}

  readonly defaultApp = this.authService.defaultApp;

  @Effect()
  readonly provideDefaultApp$ = this.action$.pipe(
    filter(isAuthAction),
    filter(action => action.app === undefined),
    map(action => cloneAuthAction(action, {app: this.defaultApp.name}))
  );

  @Effect()
  readonly restoreLoginRedirect$ = this.action$.pipe(
    ofType(ROOT_EFFECTS_INIT),
    switchMapTo(defer(() => {
      return loadLoginRedirectAction(this.document.defaultView, this.authService.defaultApp);
    }))
  );
  /*
  @Effect({dispatch: false})
  readonly callLoginRedirect$ = this.action$.pipe(
    ofType<CallLoginRedirect>(CALL_LOGIN_REDIRECT),
    switchMapTo(this.defaultApp.loginRedirect$.pipe(first())),
    switchMap(loginRedirect => this.router.navigate(loginRedirect) ),
    ignoreElements()
  );
  */


  /* TODO: Re-enable this.
  @Effect()
  readonly refreshToken$ = combineLatest(this.action$.pipe(ofType<SetAuthToken>(REFRESH_TOKEN))).pipe(
    map(action => this.authService.apps[action.app]),
    switchMap(([_, [token, expiresAt]]) => {
      const now = new Date(Date.now());
      if (token === undefined || isAfter(expiresAt, now)) {
        return EMPTY;
      }
      const secondsUntilExpires = differenceInSeconds(expiresAt, now);
      return timer(secondsUntilExpires).pipe(mapTo(token));
    }),
    switchMap((token) => this.authService.refreshToken(token)),
    concatMap((token) => [
      new SetAuthToken(token),
      new StoreAuthToken()
    ])
  );
  */
}
