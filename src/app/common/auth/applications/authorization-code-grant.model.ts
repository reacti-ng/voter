import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {ApplicationState, AuthorizationCodeGrantState, isAuthorizationCodeGrantState} from '../application.state';
import {catchError, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {AuthorizationCodeGrantResponse} from '../authorization-code-grant.model';
import {OAuth2Token, oauth2TokenFromJson} from '../oauth2-token.model';
import {ApplicationBase} from './base.model';
import {fromJsonAny} from '../../json/decoder';
import {singleResponseFromJson} from '../../model/http-response.model';

export interface AuthorizationCodeGrantApplicationConfig {
  readonly grantType: string;
  readonly tokenUrl: string;
  readonly redirectUri: string;
  readonly apiUrlRegex: string;
  readonly clientId: string;
  readonly scope: string;
}

export class AuthorizationCodeGrantApplication extends ApplicationBase<AuthorizationCodeGrantApplicationConfig, any> {
  readonly grantType = 'authorization_code';

  constructor(
    readonly http: HttpClient,
    readonly name: string,
    readonly config: AuthorizationCodeGrantApplicationConfig,
    readonly state$: Observable<ApplicationState>
  ) {
    super();
    if (this.config.grantType !== 'authorization_code') {
      throw new Error('Invalid config. Expected \'grant_type\' to be \'authorization_code\'');
    }
  }

  readonly authFlowState$ = this.state$.pipe(
    filter(isAuthorizationCodeGrantState)
  ) as Observable<ApplicationState & AuthorizationCodeGrantState>;

  get loginRedirect$() {
    return this.authFlowState$.pipe(map(state => state.loginRedirect), distinctUntilChanged());
  }

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
