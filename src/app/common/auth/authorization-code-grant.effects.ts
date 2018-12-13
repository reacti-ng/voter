import {Inject, Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {
  AUTHORIZATION_CODE_GRANT_BEGIN,
  AUTHORIZATION_CODE_GRANT_REDIRECT, AUTHORIZATION_CODE_GRANT_TOKEN_EXCHANGE,
  AuthorizationCodeGrantRedirect, AuthorizationCodeGrantTokenExchange,
  BeginAuthorizationCodeGrant, SetAuthToken
} from './auth.actions';
import {first, map, switchMap, tap} from 'rxjs/operators';
import {AuthorizationCodeGrantRequest, AuthorizationCodeGrantResponse} from './authorization-code-grant.model';
import {DOCUMENT} from '@angular/common';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
import {of, zip} from 'rxjs';


@Injectable()
export class AuthorizationCodeGrantEffects {
  constructor(
    readonly action$: Actions,
    readonly router: Router,
    readonly authService: AuthService<any>,
    @Inject(DOCUMENT) protected readonly document: Document
  ) {}

  @Effect({dispatch: false})
  readonly beginAuthorizationCodeGrantFlow$ = this.action$.pipe(
    ofType<BeginAuthorizationCodeGrant>(AUTHORIZATION_CODE_GRANT_BEGIN),
    tap(action => {
      const httpParams = AuthorizationCodeGrantRequest.toHttpParams(action.request);
      const window = this.document.defaultView;
      if (window) {
        window.location.href = `/login?${httpParams}`;
      }
    })
  );

  @Effect({dispatch: false})
  readonly authorizationCodeFlowRedirect$ = this.action$.pipe(
    ofType<AuthorizationCodeGrantRedirect>(AUTHORIZATION_CODE_GRANT_REDIRECT),
    tap(action => {
      const httpParams = AuthorizationCodeGrantResponse.toHttpParams(action.response);
      const window = this.document.defaultView;
      if (window) {
        window.location.href = `${action.redirectUri}?${httpParams}`;
      }
    })
  );

  @Effect()
  readonly authorizationCodeFlowTokenExchange$ = this.action$.pipe(
    ofType<AuthorizationCodeGrantTokenExchange>(AUTHORIZATION_CODE_GRANT_TOKEN_EXCHANGE),
    switchMap(action => {
      const app = this.authService.appForKey(action.app);
      if (app.type === 'authorization-code-grant') {
        return zip(of(app), app.exchangeAuthCodeForToken(action.response)).pipe(first());
      }
      throw new Error(`Application ${action.app} must be authorization-code-grant (got ${app})`);
    }),
    map(([app, token]) => new SetAuthToken(token, {app: app.name}))
  );

}
