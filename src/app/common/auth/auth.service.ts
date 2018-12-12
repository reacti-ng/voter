import {Set} from 'immutable';
import * as uuid from 'uuid';

import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {APP_BASE_HREF} from '@angular/common';

import {createSelector, select, Selector, Store} from '@ngrx/store';

import {Observable, of} from 'rxjs';
import {first, flatMap, map} from 'rxjs/operators';

import {OAuth2Token} from './oauth2-token.model';
import {AUTH_STATE_SELECTOR, AuthState} from './auth.state';
import {AUTH_SERVICE_CONFIG, AuthServiceConfig} from './auth-config.model';
import {fromJson} from '../json/from-json.operator';
import {AuthorizationCodeGrantRequest, AuthorizationCodeGrantResponse} from './authorization-code-grant.model';
import {BeginAuthorizationCodeGrant} from './auth.actions';

@Injectable()
export class AuthService {
  // The state variable to pass into authorization
  private readonly state = uuid.v4().substr(28);

  constructor(
    private readonly http: HttpClient,
    private readonly store: Store<object>,
    @Inject(AUTH_STATE_SELECTOR) private readonly authSelector: Selector<object, AuthState>,
    @Inject(APP_BASE_HREF) private readonly appBaseHref: string,
    @Inject(AUTH_SERVICE_CONFIG) private readonly authConfig: AuthServiceConfig
  ) {}

  readonly token$ = this.store.pipe(
    select(createSelector(this.authSelector, AuthState.selectToken))
  );

  readonly accessToken$ = this.store.pipe(
    select(createSelector(this.authSelector, AuthState.selectAccessToken))
  );

  readonly accessTokenExpiresAt$: Observable<[OAuth2Token, Date]> = this.store.pipe(
    select(createSelector(this.authSelector, AuthState.selectTokenExpiresAt))
  );

  readonly loginRedirectUri$ = this.store.pipe(
    select(this.authSelector),
    map(authState => [this.appBaseHref, ...authState.loginRedirectTo].join('/')),
  );

  /**
   * The full URI (including mandatory query params for an oauth authorization code
   * grant page)
   */
  readonly authorizationCodeGrantRequest$ = this.loginRedirectUri$.pipe(
    map(loginRedirectUri => ({
      clientId: this.authConfig.clientId,
      redirectUri: loginRedirectUri,
      scope: Set(this.authConfig.requireScopes),
      state: this.state
    }))
  );

  login(): void {
    this.authorizationCodeGrantRequest$.pipe(first()).subscribe((request) => {
      this.store.dispatch(new BeginAuthorizationCodeGrant(request));
    });
  }

  /**
   * Exchange the authorization code for an access token.
   *
   * @param authCode: string
   * @param stateParam: string | null
   */
  exchangeAuthCodeForToken(authCode: string, stateParam: string | null): Observable<OAuth2Token> {
    if (stateParam !== this.state) {
      console.warn(`Invalid state token returned by authorization server (expected: ${this.state}, received: ${stateParam})`);
    }
    return this.loginRedirectUri$.pipe(
      first(),
      flatMap((redirectUri) => {
        const grantRequest = new HttpParams({
          fromObject: {
            grant_type: 'authorization_code',
            code: authCode,
            redirect_uri: redirectUri,
            client_id: this.authConfig.clientId
          }
        }).toString();

        return this.http.post([this.authConfig.authServerHref, 'token'].join('/'), grantRequest);
      }),
      fromJson({ifObj: OAuth2Token.fromJson})
    );
  }

  getAuthorizationCodeForClientId(request: AuthorizationCodeGrantRequest): Observable<AuthorizationCodeGrantResponse> {
    // FIXME: Serverside stuff.
    return of({code: request.clientId, state: request.state});
  }

  submitResourceOwnerCredentialsGrantRequest(
    credentials: {username: string | null, password: string | null}
  ): Observable<OAuth2Token | undefined> {
    if (credentials.username == null) {
      return of(undefined);
    }
    if (credentials.password == null) {
      return of(undefined);
    }

    const grantRequest = new HttpParams({
      fromObject: {
        grant_type: 'password',
        username: credentials.username,
        password: credentials.password,
        scope: this.authConfig.requireScopes.join(' ')
      }
    }).toString();

    return this.http.post([this.authConfig.authServerHref, 'token'].join('/'), grantRequest, {
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      responseType: 'json',
      withCredentials: true
    }).pipe(fromJson({ifObj: OAuth2Token.fromJson}));
  }

  refreshToken(token: OAuth2Token): Observable<OAuth2Token> {
    const refreshRequest = new HttpParams({
      fromObject: {
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken
      }
    }).toString();
    return this.http.post([this.authConfig.authServerHref, 'token'].join('/'), refreshRequest, {
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      responseType: 'json',
      withCredentials: true
    }).pipe(
      fromJson({ifObj: OAuth2Token.fromJson})
    );
  }
}
