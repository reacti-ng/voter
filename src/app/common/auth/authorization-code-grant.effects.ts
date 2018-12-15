import {Inject, Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {
  AUTHORIZATION_CODE_GRANT_BEGIN,
  AUTHORIZATION_CODE_GRANT_REDIRECT,
  AUTHORIZATION_CODE_GRANT_TOKEN_EXCHANGE,
  AuthorizationCodeGrantRedirect,
  AuthorizationCodeGrantTokenExchange,
  BeginAuthorizationCodeGrant,
  SetAuthToken,
  SetLoginRedirect
} from './auth.actions';
import {catchError, concatMap, filter, first, map, startWith, switchMap, switchMapTo, tap} from 'rxjs/operators';
import {AuthorizationCodeGrantRequest, AuthorizationCodeGrantResponse} from './authorization-code-grant.model';
import {DOCUMENT} from '@angular/common';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
import {concat, Observable, of, throwError, zip} from 'rxjs';
import {AuthorizationCodeGrantApplication} from './application.model';
import {Action} from '@ngrx/store';
import {HttpResponse} from '@angular/common/http';


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
      const app = this.authService.appForKey(action.app);
      if (app.type !== 'authorization-code-grant') {
        throw new Error(`App is not a code grant application`);
      }

      const httpParams = AuthorizationCodeGrantRequest.toHttpParams(action.request);
      const window = this.document.defaultView;
      if (window) {
        saveRedirectCommands(window.localStorage, app);
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
      if (app.type !== 'authorization-code-grant') {
        throw new Error(`Application ${action.app} must be authorization-code-grant (got ${app})`);
      }

      const setLoginRedirect$ = loadLoginRedirectAction(this.document.defaultView, app);
      const setAuthToken$ = app.authFlowState$.pipe(
        filter(state => !!state.authCodeGrantInProgress),
        first(),
        switchMap(() => app.exchangeAuthCodeForToken(action.response)),
        map((token) => new SetAuthToken(token, {app: app.name})),
        catchError(err => {
          if (err instanceof HttpResponse && err.status === 401) {
            // This is just a login failure,
            return of(new SetAuthToken(undefined, {app: app.name}));
          }
          return throwError(err);
        }),
      );

      return concat(
        setLoginRedirect$,
        setAuthToken$
      );
    })
  );

}

function saveRedirectCommands(storage: Storage, app: AuthorizationCodeGrantApplication) {
  app.loginRedirect$.pipe(first()).subscribe(loginRedirect => {
    storage.setItem(`common.auth::${app.name}::loginRedirect`, JSON.stringify(loginRedirect));
  });
}

function loadLoginRedirectAction(window: Window | null, app: AuthorizationCodeGrantApplication): Observable<Action> {
  if (window) {
    const rawRedirect = window.localStorage.getItem(`common.auth::${app.name}::loginRedirect`);
    if (rawRedirect !== null) {
      const redirect = JSON.parse(rawRedirect);
      if (Array.isArray(redirect)) {
        return of(new SetLoginRedirect(redirect, {app: app.name}));
      }
    }
  }
  return of(new SetLoginRedirect(['/user'], {app: app.name}));
}
