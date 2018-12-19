import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {ApplicationState} from './application.state';
import {select} from '@ngrx/store';
import {OAuth2Token, oauth2TokenFromJson, oauth2TokenToJson} from './oauth2-token.model';
import {BehaviorSubject, combineLatest, defer, EMPTY, identity, Observable, of, timer, zip} from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  first,
  map,
  skip,
  switchMap,
  switchMapTo,
  takeUntil,
  tap
} from 'rxjs/operators';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {
  CallLoginRedirect,
  SET_AUTH_TOKEN,
  SET_TOKEN_PERSISTENCE_IS_ENABLED,
  SetAuthToken,
  SetTokenPersistenceIsEnabled,
} from './auth.actions';
import {JsonObject} from '../json/json.model';
import {AuthService} from './auth.service';
import {CoreAuthState} from '../../core/auth/auth.state';

const ACCESS_TOKEN_STORAGE_KEY = 'common.auth::access-token';
const ACCESS_TOKEN_TIMESTAMP_STORAGE_KEY = 'common.auth::access-token-timestamp';
const TOKEN_PERSISTENCE_ENABLED_STORAGE_KEY = 'common.auth::is-token-persistence-enabled';

/**
 * Persist the state of the oauth token across future browser sessions.
 */
@Injectable()
export class Oauth2TokenPersistenceEffects {
  private isLoginTokenPersistenceEnabledSubject = new BehaviorSubject(false);

  constructor(
    readonly action$: Actions,
    readonly authService: AuthService<any>,
    @Inject(DOCUMENT) readonly document: Document
  ) {
    if (!this.authService.appKeys.includes('login')) {
      throw new Error(`Must declare a \'login\' application`);
    }
    const loginApp = this.authService.apps['login'];
    loginApp.state$.pipe(
      map(state => state.isTokenPersistenceEnabled),
    ).subscribe(
      (isEnabled) => {
        this.isLoginTokenPersistenceEnabledSubject.next(isEnabled);
      }
    );
  }

  readonly defaultApp = this.authService.defaultApp;

  readonly tokenRefreshedAt$ = this.defaultApp.state$.pipe(
    select(ApplicationState.selectTokenRefreshedAt)
  );

  @Effect()
  readonly enableTokenPersistenceOnLoad$ = defer(() => {
    return this.ifHasWindow((window) => {
      const isEnabled = window.localStorage.getItem(TOKEN_PERSISTENCE_ENABLED_STORAGE_KEY) === 'true';
      return of(new SetTokenPersistenceIsEnabled(isEnabled, {app: 'login'}));
    }) || EMPTY;
  });

  @Effect({dispatch: false})
  readonly storeTokenPersisted$ = this.action$.pipe(
    ofType<SetTokenPersistenceIsEnabled>(SET_TOKEN_PERSISTENCE_IS_ENABLED),
    tap((action) => {
      this.ifHasWindow((window) => {
        window.localStorage.setItem(TOKEN_PERSISTENCE_ENABLED_STORAGE_KEY, action.isEnabled.toString());
      });
    })
  );

  @Effect({dispatch: false})
  readonly storeAccessToken$ = this.action$.pipe(
    ofType<SetAuthToken>(SET_AUTH_TOKEN),
    filter(action => this.authService.isDefaultAppKey(action.app as any)),
    switchMapTo(this.tokenRefreshedAt$.pipe(first())),
    tap(([token, refreshedAt]) => {
      const isTokenPersistenceEnabled = this.isLoginTokenPersistenceEnabledSubject.value;
      if (isTokenPersistenceEnabled && token !== undefined) {
        window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, JSON.stringify(oauth2TokenToJson(token)));
        window.localStorage.setItem(ACCESS_TOKEN_TIMESTAMP_STORAGE_KEY, refreshedAt.getTime().toString());
      } else {
        window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(ACCESS_TOKEN_TIMESTAMP_STORAGE_KEY);
      }
    })
  );

  @Effect()
  readonly restoreSavedAccessToken$ = defer(() => {
    return this.ifHasWindow((window) => {
      const isTokenPersistenceEnabled = window.localStorage.getItem(TOKEN_PERSISTENCE_ENABLED_STORAGE_KEY) === 'true';

      const jsonToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      const token = jsonToken && oauth2TokenFromJson(JSON.parse(jsonToken) as JsonObject) || null;

      const jsonTimestamp = window.localStorage.getItem(ACCESS_TOKEN_TIMESTAMP_STORAGE_KEY);
      const timestamp = jsonTimestamp && Number.parseInt(jsonTimestamp, 10) || null;

      if (!isTokenPersistenceEnabled || token == null || timestamp == null || Number.isNaN(timestamp)) {
        return EMPTY;
      }
      return of({token, timestamp});
    }) || EMPTY;
  }).pipe(
    concatMap(({token, timestamp}) => [
      new SetAuthToken(token, {useTimestamp: new Date(timestamp), app: this.defaultApp.name}),
      ...token ? [new CallLoginRedirect({app: this.defaultApp.name})] : []
    ])
  );

  private ifHasWindow<T>(action: (window: Window) => T | null): T | null {
    const window = this.document.defaultView;
    return window !== null ? action(window) : null;
  }
}
