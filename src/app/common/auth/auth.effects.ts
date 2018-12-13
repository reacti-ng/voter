import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';


import {concatMap, tap} from 'rxjs/operators';

import {select, Selector, Store} from '@ngrx/store';
import {Actions, Effect, ofType} from '@ngrx/effects';

import {
  AUTHORIZATION_CODE_GRANT_BEGIN,
  BeginAuthorizationCodeGrant,
  AUTHORIZATION_CODE_GRANT_REDIRECT,
  AuthorizationCodeGrantRedirect,
  SET_AUTH_TOKEN,
  SetAuthToken,
  StoreAuthToken
} from './auth.actions';
import {AuthorizationCodeGrantRequest, AuthorizationCodeGrantResponse} from './authorization-code-grant.model';


@Injectable()
export class AuthEffects {

  constructor(
    readonly action$: Actions,
    readonly store: Store<object>,
    @Inject(DOCUMENT) readonly document: Document,
  ) {}

  // Every time the auth token is set, store the token.
  readonly storeAccessTokenOnSave$ = this.action$.pipe(
    ofType<SetAuthToken>(SET_AUTH_TOKEN),
    concatMap((action) => [action, new StoreAuthToken({app: action.app})])
  );

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
