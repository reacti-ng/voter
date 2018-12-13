import * as uuid from 'uuid';
import {InjectionToken} from '@angular/core';
import {EMPTY, Observable, of} from 'rxjs';
import {ApplicationState} from './application.state';
import {AuthorizationCodeGrantRequest, AuthorizationCodeGrantResponse} from './authorization-code-grant.model';
import {HttpClient, HttpParams, HttpRequest} from '@angular/common/http';
import {OAuth2Token} from './oauth2-token.model';
import {fromJson} from '../json/from-json.operator';
import {first, flatMap, map} from 'rxjs/operators';

export interface PublicGrantApplicationConfig {
  readonly type: 'public';
  readonly apiUrlRegex?: undefined;
  readonly clientId?: undefined;
}

export interface ResourceOwnerPasswordGrantApplicationConfig {
  readonly type: 'password';
  readonly tokenUrl: string;
  readonly apiUrlRegex?: undefined;
  readonly clientId: string;
  readonly clientSecret: string;
}

export interface AuthorizationCodeGrantApplicationConfig {
  readonly type: 'authorization-code-grant';
  readonly tokenUrl: string;
  readonly apiUrlRegex: string;
  readonly clientId: string;
  readonly clientSecret?: undefined;
  readonly scope: string;
}

export type AuthApplicationConfig
  = PublicGrantApplicationConfig
  | ResourceOwnerPasswordGrantApplicationConfig
  | AuthorizationCodeGrantApplicationConfig;
export type AuthApplicationConfigs<CoreAuthState> = Record<keyof CoreAuthState, AuthApplicationConfig>;

export const AUTH_APPLICATION_CONFIGS = new InjectionToken<AuthApplicationConfigs<any>>('AUTH_SERVICE_CONFIGS');

export abstract class ApplicationBase {
  abstract readonly type: 'public' | 'password' | 'authorization-code-grant';
  abstract readonly http: HttpClient;
  abstract readonly name: string;
  abstract readonly config: AuthApplicationConfig;
  abstract readonly state$: Observable<ApplicationState>;

  get loginRedirectUri$() {
    return this.state$.pipe(map(state => state.loginRedirectTo));
  }

  getAuthorizeHeaders(request: HttpRequest<any>): Observable<{[k: string]: string} | undefined> {
    let headers$ = of<{[k: string]: string} | undefined>(undefined);
    const urlRegex = new RegExp(this.config.apiUrlRegex || /.*/);
    if (urlRegex && urlRegex.test(request.url)) {
      headers$ = this.state$.pipe(
        first(),
        map(state => state.token && state.token.accessToken),
        map(accessToken => {
          return accessToken
            ? {'authorization': `Bearer ${accessToken}`}
            : undefined;
        })
      );
    }
    return headers$;
  }
}

export class PublicGrantApplication extends ApplicationBase {
  readonly type = 'public';
  readonly config = this as PublicGrantApplicationConfig;
  readonly state$: Observable<ApplicationState> = EMPTY;
  constructor(readonly http: HttpClient, readonly name: string) { super(); }
}

export class ResourceOwnerPasswordGrantApplication extends ApplicationBase {
  readonly type = 'password';

  constructor(
    readonly http: HttpClient,
    readonly name: string,
    readonly config: ResourceOwnerPasswordGrantApplicationConfig,
    readonly state$: Observable<ApplicationState>
  ) {
    super();
  }

  /**
   * An active resource owner grant can request access on behalf of the specified client id.
   *
   * @param request: AuthorizationCodeGrantRequest
   */
  requestAuthorizationCodeForClientId(request: AuthorizationCodeGrantRequest) {
    // FIXME: Server-side stuff.
    return of({code: uuid.v4().substr(28), state: request.state});
  }

  requestGrant(credentials: {username: string, password: string}): Observable<OAuth2Token> {
    const grantRequest = new HttpParams({
      fromObject: {
        grant_type: 'password',
        username: credentials.username,
        password: credentials.password,
      }
    }).toString();

    const {clientId, clientSecret} = this.config;
    return this.http.post(this.config.tokenUrl, grantRequest, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
      },
      responseType: 'json'
    }).pipe(
      fromJson({ifObj: OAuth2Token.fromJson})
    );
  }
}

export class AuthorizationCodeGrantApplication extends ApplicationBase {
  readonly type = 'authorization-code-grant';
  private readonly state = uuid.v4().substr(28);
  constructor(
    readonly http: HttpClient,
    readonly name: string,
    readonly config: AuthorizationCodeGrantApplicationConfig,
    readonly state$: Observable<ApplicationState>
  ) {
    super();
  }

  exchangeAuthCodeForToken(response: AuthorizationCodeGrantResponse): Observable<OAuth2Token> {
    return this.state$.pipe(
      first(),
      map(state => state.loginRedirectTo),
      flatMap((redirectUri) => {
        const grantRequest = new HttpParams({
          fromObject: {
            grant_type: 'authorization_code',
            code: response.code,
            redirect_uri: redirectUri,
            client_id: this.config.clientId
          }
        }).toString();
        return this.http.post(this.config.tokenUrl, grantRequest);
      }),
      fromJson({ifObj: OAuth2Token.fromJson})
    );
  }

  refreshToken(token: OAuth2Token): Observable<OAuth2Token> {
    const refreshRequest = new HttpParams({
      fromObject: {
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken
      }
    }).toString();
    return this.http.post(this.config.tokenUrl, refreshRequest, {
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      responseType: 'json',
    }).pipe(
      fromJson({ifObj: OAuth2Token.fromJson})
    );
  }

}

export type AuthApplication
  = PublicGrantApplication
  | ResourceOwnerPasswordGrantApplication
  | AuthorizationCodeGrantApplication;

export const AUTH_DEFAULT_APPLICATION = new InjectionToken<string>('AUTH_DEFAULT_APPLICATION');
