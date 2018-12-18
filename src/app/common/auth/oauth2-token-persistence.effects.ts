import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {ApplicationState} from './application.state';
import {select} from '@ngrx/store';
import {OAuth2Token, oauth2TokenFromJson} from './oauth2-token.model';
import {combineLatest, defer, EMPTY, of} from 'rxjs';
import {distinctUntilKeyChanged, map, tap} from 'rxjs/operators';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {
  SET_TOKEN_PERSISTENCE_IS_ENABLED,
  SetAuthToken,
  SetTokenPersistenceIsEnabled,
  STORE_AUTH_TOKEN,
  StoreAuthToken,
} from './auth.actions';
import {JsonObject} from '../json/json.model';
import {AuthService} from './auth.service';

const ACCESS_TOKEN_STORAGE_KEY = 'common.auth::access-token';
const ACCESS_TOKEN_TIMESTAMP_STORAGE_KEY = 'common.auth::access-token-timestamp';
const TOKEN_PERSISTENCE_ENABLED_STORAGE_KEY = 'common.auth::is-token-persistence-enabled';

@Injectable()
export class Oauth2TokenPersistenceEffects {
  constructor(
    readonly action$: Actions,
    readonly authService: AuthService<any>,
    @Inject(DOCUMENT) readonly document: Document
  ) {
    if (!this.authService.appKeys.includes('login')) {
      throw new Error(`Must declare a \'login\' application`);
    }
  }

  // Only root credentials need to be stored.
  private readonly loginApp = this.authService.apps['login'];

  readonly isTokenPersistenceEnabled$ = this.loginApp.state$.pipe(
    map(appState => appState.isTokenPersistenceEnabled)
  );

  readonly tokenRefreshedAt$ = this.loginApp.state$.pipe(
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
  readonly storeAccessToken$ = combineLatest(
    this.action$.pipe(ofType<StoreAuthToken>(STORE_AUTH_TOKEN)),
    this.tokenRefreshedAt$,
    this.isTokenPersistenceEnabled$,
  ).pipe(
    distinctUntilKeyChanged(0),
    tap(([_, [token, refreshedAt], isTokenPersistenceEnabled]) => {
      this.ifHasWindow((window) => {
        if (token === undefined || !isTokenPersistenceEnabled) {
          window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
          window.localStorage.removeItem(ACCESS_TOKEN_TIMESTAMP_STORAGE_KEY);
        } else {
          window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, JSON.stringify(OAuth2Token.toJson(token)));
          window.localStorage.setItem(ACCESS_TOKEN_TIMESTAMP_STORAGE_KEY, refreshedAt.getTime().toString());
        }
      });
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

      if (!isTokenPersistenceEnabled
        || token == null || timestamp == null || Number.isNaN(timestamp)) {
        return EMPTY;
      }
      return of({token, timestamp});
    }) || EMPTY;
  }).pipe(
    map(({token, timestamp}) => new SetAuthToken(token, {useTimestamp: new Date(timestamp), app: 'login'}))
  );

  private ifHasWindow<T>(action: (window: Window) => T | null): T | null {
    const window = this.document.defaultView;
    return window !== null ? action(window) : null;
  }

}
