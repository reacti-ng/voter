import {InjectionToken} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {ApplicationState, AuthorizationCodeGrantState, isAuthorizationCodeGrantState} from './application.state';
import {
  AuthorizationCodeGrantRequest, authorizationCodeGrantRequestToHttpParams,
  AuthorizationCodeGrantResponse,
  authorizationCodeGrantResponseFromJson
} from './authorization-code-grant.model';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {OAuth2Token, oauth2TokenFromJson} from './oauth2-token.model';
import {catchError, distinctUntilChanged, filter, first, flatMap, map, switchMap} from 'rxjs/operators';
import {select} from '@ngrx/store';
import {fromJsonAny} from '../json/decoder';
import {JsonAny} from '../json/json.model';
import {singleResponseFromJson} from '../model/http-response.model';

export interface PublicGrantApplicationConfig {
  readonly type: 'public';
  readonly clientId?: undefined;
}

export interface ResourceOwnerPasswordGrantApplicationConfig {
  readonly type: 'password';
  readonly tokenUrl: string;
  readonly apiUrlRegex?: undefined;
  readonly clientId: string;
  readonly clientSecret: string;

  readonly grantAuthCodeUrl?: string;
}

export interface AuthorizationCodeGrantApplicationConfig {
  readonly type: 'authorization-code-grant';
  readonly tokenUrl: string;
  readonly redirectUri: string;
  readonly clientId: string;
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

  get token$(): Observable<OAuth2Token | undefined> {
    return this.state$.pipe(map(state => state.token));
  }

  /**
   * Get the authorization headers for the request, if the user is logged in.
   */
  getAuthorizeHeaders(): Observable<{[k: string]: string}> {
    return this.state$.pipe(
      select(ApplicationState.selectAccessToken),
      first(),
      map(accessToken => (accessToken ? {'authorization': `Bearer ${accessToken}`} : {}) as { [k: string]: string })
    );
  }
}

export class PublicGrantApplication extends ApplicationBase {
  readonly type = 'public';
  readonly config = this as PublicGrantApplicationConfig;
  readonly state$: Observable<ApplicationState> = of(ApplicationState.initial(this.name));
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
  requestAuthorizationCodeForClientId(request: AuthorizationCodeGrantRequest): Observable<AuthorizationCodeGrantResponse> {
    const token$ = this.state$.pipe(map(state => state.token));
    const grantAuthCodeUrl = this.config.grantAuthCodeUrl;
    if (grantAuthCodeUrl === undefined) {
      return throwError(new Error(`No 'grantAuthCodeUrl' configured for ${this.name}`));
    }

    return token$.pipe(
      first(),
      switchMap(token => {
        if (token === undefined) {
          throw new Error(`Must be logged in in order to request an access token`);
        }
        const body = authorizationCodeGrantRequestToHttpParams(request);

        // Call the user/auth_code with the resource owner grant.
        // This is the _only_ api endpoint which accepts authorization using the resource owner app
        return this.getAuthorizeHeaders().pipe(
          flatMap(authHeaders => {
            return this.http.post(grantAuthCodeUrl, body, {
              headers: {
                ...authHeaders,
                'content-type': 'application/x-www-form-urlencoded'
              }
            });
          }),
          singleResponseFromJson(authorizationCodeGrantResponseFromJson)
        );
      })
    );
  }

  requestGrant(credentials: {username: string, password: string}): Observable<OAuth2Token | undefined> {
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
      singleResponseFromJson(oauth2TokenFromJson),
      catchError(err => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          return of(undefined);
        }
        return throwError(err);
      })
    );
  }
}

export class AuthorizationCodeGrantApplication extends ApplicationBase {
  readonly type = 'authorization-code-grant';
  constructor(
    readonly http: HttpClient,
    readonly name: string,
    readonly config: AuthorizationCodeGrantApplicationConfig,
    readonly state$: Observable<ApplicationState>
  ) {
    super();
  }

  readonly authFlowState$ = this.state$.pipe(
    filter(isAuthorizationCodeGrantState)
  ) as Observable<ApplicationState & AuthorizationCodeGrantState>;

  readonly loginRedirect$ = this.authFlowState$.pipe(select('loginRedirect'));

  exchangeAuthCodeForToken(response: AuthorizationCodeGrantResponse): Observable<OAuth2Token | undefined> {
    const grantRequest = new HttpParams({
      fromObject: {
        grant_type: 'authorization_code',
        code: response.code,
        state: response.state,
        redirect_uri: this.config.redirectUri,
        client_id: this.config.clientId,
      }
    });
    return this.http.post(this.config.tokenUrl, grantRequest, {
      headers: {'content-type': 'application/x-www-form-urlencoded'}
    }).pipe(
      singleResponseFromJson(oauth2TokenFromJson),
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          return of(undefined);
        }
        return throwError(err);
      })
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
      singleResponseFromJson(oauth2TokenFromJson)
    );
  }
}

export type AuthApplication
  = PublicGrantApplication
  | ResourceOwnerPasswordGrantApplication
  | AuthorizationCodeGrantApplication;

export const AUTH_DEFAULT_APPLICATION = new InjectionToken<string>('AUTH_DEFAULT_APPLICATION');
