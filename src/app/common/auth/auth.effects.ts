import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';


import {concatMap, filter, map} from 'rxjs/operators';

import {Store} from '@ngrx/store';
import {Actions, Effect, ofType} from '@ngrx/effects';

import {cloneAuthAction, isAuthAction, SET_AUTH_TOKEN, SetAuthToken, StoreAuthToken} from './auth.actions';
import {AUTH_DEFAULT_APPLICATION} from './application.model';


@Injectable()
export class AuthEffects {

  constructor(
    readonly action$: Actions,
    readonly store: Store<object>,
    @Inject(AUTH_DEFAULT_APPLICATION) private readonly defaultAppId: string,
    @Inject(DOCUMENT) readonly document: Document,
  ) {}

  // Every time the auth token is set, store the token.
  readonly storeAccessTokenOnSave$ = this.action$.pipe(
    ofType<SetAuthToken>(SET_AUTH_TOKEN),
    concatMap((action) => [action, new StoreAuthToken({app: action.app})])
  );

  @Effect()
  readonly provideDefaultApp$ = this.action$.pipe(
    filter(isAuthAction),
    filter(action => action.app === undefined),
    map(action => cloneAuthAction(action, {app: this.defaultAppId}))
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
