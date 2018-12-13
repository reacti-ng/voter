import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';

import {differenceInSeconds, isAfter} from 'date-fns';

import {combineLatest, EMPTY, timer} from 'rxjs';
import {concatMap, distinctUntilKeyChanged, map, mapTo, switchMap, tap} from 'rxjs/operators';

import {createSelector, select, Selector, Store} from '@ngrx/store';
import {Actions, Effect, ofType} from '@ngrx/effects';

import {AuthService} from './auth.service';
import {
  BEGIN_AUTHORIZATION_CODE_GRANT,
  BeginAuthorizationCodeGrant,
  FINALIZE_AUTHRORIZATION_CODE_GRANT,
  FinalizeAuthorizationCodeGrant,
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
    readonly authService: AuthService<any>,
    @Inject(DOCUMENT) readonly document: Document,
  ) {}

  // Every time the auth token is set, store the token.
  readonly storeAccessTokenOnSave$ = this.action$.pipe(
    ofType<SetAuthToken>(SET_AUTH_TOKEN),
    concatMap((action) => [action, new StoreAuthToken(action.app)])
  );

  @Effect({dispatch: false})
  readonly beginAuthorizationCodeGrantFlow$ = this.action$.pipe(
    ofType<BeginAuthorizationCodeGrant>(BEGIN_AUTHORIZATION_CODE_GRANT),
    tap(action => {
      const httpParams = AuthorizationCodeGrantRequest.toHttpParams(action.request);
      const window = this.document.defaultView;
      if (window) {
        window.location.href = `/login?${httpParams}`;
      }
    })
  );

  @Effect({dispatch: false})
  readonly finalizeAuthorizationCodeGrantFlow$ = this.action$.pipe(
    ofType<FinalizeAuthorizationCodeGrant>(FINALIZE_AUTHRORIZATION_CODE_GRANT),
    tap(action => {
      const httpParams = AuthorizationCodeGrantResponse.toHttpParams(action.response);
      const window = this.document.defaultView;
      if (window) {
        window.location.href = `${action.redirectUri}${httpParams}`;
      }
    })
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
