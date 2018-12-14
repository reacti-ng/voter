import {Inject, Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {
  AUTHORIZATION_CODE_GRANT_BEGIN,
  AUTHORIZATION_CODE_GRANT_REDIRECT, AUTHORIZATION_CODE_GRANT_TOKEN_EXCHANGE,
  AuthorizationCodeGrantRedirect, AuthorizationCodeGrantTokenExchange,
  BeginAuthorizationCodeGrant, SET_LOGIN_REDIRECT, SetAuthToken, SetLoginRedirect
} from './auth.actions';
import {concatMap, filter, first, map, mapTo, switchMap, tap} from 'rxjs/operators';
import {AuthorizationCodeGrantRequest, AuthorizationCodeGrantResponse} from './authorization-code-grant.model';
import {DOCUMENT} from '@angular/common';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
import {EMPTY, identity, Observable, of, pipe, zip} from 'rxjs';
import {AuthorizationCodeGrantApplication} from './application.model';
import {Action, select} from '@ngrx/store';
import {ApplicationState} from './application.state';


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
      const window = this.document.defaultView;
      return zip(
        of(app),
        app.exchangeAuthCodeForToken(action.response),
        loadRedirectActions(window && window.localStorage, app)
      ).pipe(first());
    }),
    concatMap(([app, token, redirectActions]) => [
      new SetAuthToken(token, {app: app.name}),
      ...redirectActions
    ]),
  );

  @Effect({dispatch: false})
  readonly redirectDefaultAppOnCodeGrantFinalization$ = this.action$.pipe(
    ofType<SetLoginRedirect>(SET_LOGIN_REDIRECT),
    switchMap(action => {
      const app = this.authService.appForKey(action.app);
      if (app !== this.authService.defaultApp) {
        return EMPTY;
      }
      return app.authFlowState$.pipe(
        select(ApplicationState.isAuthCodeGrantInProgress),
        first(),
        // If there _is_ a code grant in progress, filter out the only element in the stream
        filter(identity),
        mapTo(action)
      );
    }),
    tap((action) => {
      return this.router.navigate(action.redirect);
    })
  );
}

function saveRedirectCommands(storage: Storage, app: AuthorizationCodeGrantApplication) {
  app.loginRedirect$.pipe(first()).subscribe(loginRedirect => {
    storage.setItem(`common.auth::${app.name}::loginRedirect`, JSON.stringify(loginRedirect));
  });
}

function loadRedirectActions(storage: Storage | null, app: AuthorizationCodeGrantApplication): Observable<Action[]> {
  const rawRedirect = storage && storage.getItem(`common.auth::${app.name}}::loginRedirect`);
  if (rawRedirect !== null) {
    const redirect = JSON.parse(rawRedirect);
    if (Array.isArray(redirect)) {
      return of([new SetLoginRedirect(redirect, {app: app.name})]);
    }
  }
  return of([]);
}
