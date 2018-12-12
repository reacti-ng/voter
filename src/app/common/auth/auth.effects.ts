import {Actions, Effect, ofType} from '@ngrx/effects';
import {Inject, Injectable} from '@angular/core';
import {AuthService} from './auth.service';
import {concatMap, distinctUntilKeyChanged, first, mapTo, switchMap, switchMapTo, tap} from 'rxjs/operators';
import {BEGIN_LOGIN, REFRESH_TOKEN, SET_AUTH_TOKEN, SetAuthToken, StoreAuthToken} from './auth.actions';
import {differenceInSeconds, isAfter} from 'date-fns';
import {DOCUMENT} from '@angular/common';
import {AUTH_STATE_SELECTOR, AuthState} from './auth.state';
import {createSelector, select, Selector, Store} from '@ngrx/store';
import {combineLatest, EMPTY, timer} from 'rxjs';


@Injectable()
export class AuthEffects {

  constructor(
    readonly action$: Actions,
    readonly store: Store<object>,
    @Inject(AUTH_STATE_SELECTOR)
    readonly authStateSelector: Selector<object, AuthState>,
    readonly authService: AuthService,
    @Inject(DOCUMENT) readonly document: Document,
  ) {}

  readonly accessTokenExpiresAt$ = this.store.pipe(
    select(createSelector(this.authStateSelector, AuthState.selectTokenExpiresAt))
  );

  readonly storeAccessTokenOnSete$ = this.action$.pipe(
    ofType<SetAuthToken>(SET_AUTH_TOKEN),
    concatMap((action) => [action, new StoreAuthToken()])
  );


  @Effect({dispatch: false})
  readonly redirectToLoginPage$ = this.action$.pipe(
    ofType(BEGIN_LOGIN),
    switchMapTo(this.authService.loginPageUri$.pipe(first())),
    tap(loginPageHref => {
      const window = this.document.defaultView;
      if (window) {
        window.location.href = loginPageHref;
      }
    })
  );

  @Effect()
  readonly refreshToken$ = combineLatest(
    this.action$.pipe(ofType<SetAuthToken>(REFRESH_TOKEN)),
    this.accessTokenExpiresAt$
  ).pipe(
    distinctUntilKeyChanged(0),
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
}
