
import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpRequest} from '@angular/common/http';
import {APP_BASE_HREF} from '@angular/common';

import {createSelector, select, Selector, Store} from '@ngrx/store';


import {
  AUTH_APPLICATION_CONFIGS, AUTH_DEFAULT_APPLICATION,
  AuthApplication,
  AuthApplicationConfig,
  AuthApplicationConfigs, AuthorizationCodeGrantApplication, PublicGrantApplication,
  ResourceOwnerPasswordGrantApplication
} from './application.model';
import {AUTH_STATE_SELECTOR, AuthState} from './auth.state';
import {Observable} from 'rxjs';
import {ApplicationState} from './application.state';
import {AuthorizationCodeGrantRequest} from './authorization-code-grant.model';
import {Set} from 'immutable';
import {filter, first, map, mapTo, tap} from 'rxjs/operators';
import {BeginAuthorizationCodeGrant, SetLoginRedirect} from './auth.actions';
import * as uuid from 'uuid';

@Injectable()
export class AuthService<CoreAuthState extends Record<keyof CoreAuthState, ApplicationState>> {
  // FIXME: This should be stable across sessions.
  private readonly state = uuid.v4();

  readonly appKeys: (Extract<keyof CoreAuthState, string>)[];
  readonly apps: Readonly<Record<keyof CoreAuthState, AuthApplication>>;

  readonly defaultApp: AuthorizationCodeGrantApplication;

  constructor(
    private readonly http: HttpClient,
    private readonly store: Store<any>,
    @Inject(AUTH_STATE_SELECTOR) private readonly authStateSelector: Selector<object, CoreAuthState>,
    @Inject(AUTH_DEFAULT_APPLICATION) private readonly defaultAppId: string,
    @Inject(APP_BASE_HREF) private readonly appBaseHref: string,
    @Inject(AUTH_APPLICATION_CONFIGS) private readonly appConfigs: AuthApplicationConfigs<CoreAuthState>
  ) {
    this.appKeys = Object.keys(appConfigs) as (Extract<keyof CoreAuthState, string>)[];

    const apps: Partial<Record<keyof CoreAuthState, AuthApplication>> = {};
    (apps as any)['__public__'] = this.createAuthApplication('__public__' as keyof CoreAuthState, {type: 'public'});

    for (const key of this.appKeys) {
      apps[key] = this.createAuthApplication(key, appConfigs[key]);
    }
    this.apps = apps as Record<keyof CoreAuthState, AuthApplication>;

    const defaultApp = apps[defaultAppId as keyof CoreAuthState];
    if (defaultApp === undefined || defaultApp.type !== 'authorization-code-grant') {
      throw new Error(`Default application must be of type 'authorization-code-grant'`);
    }
    this.defaultApp = defaultApp as AuthorizationCodeGrantApplication;
  }

  private createAuthApplication(app: keyof CoreAuthState, config: AuthApplicationConfig): AuthApplication {
    if (typeof app !== 'string') {
      throw new Error(`Application key must be a string ${app}`);
    }
    const appSelector = createSelector(this.authStateSelector, authState => authState[app]);
    const appState$ = this.store.pipe(select(appSelector)) as Observable<ApplicationState>;

    switch (config.type) {
      case 'public':
        return new PublicGrantApplication(this.http, app);
      case 'password':
        return new ResourceOwnerPasswordGrantApplication(this.http, app, config, appState$);
      case 'authorization-code-grant':
        return new AuthorizationCodeGrantApplication(this.http, app, config, appState$);
    }
  }

  appForClientId(clientId: string): AuthApplication {
    for (const appKey of this.appKeys) {
      const app = this.apps[appKey];
      if (app.config.clientId === clientId) {
        return app;
      }
    }
    throw notAnAuthApplication(clientId);
  }

  appForKey(key?: Extract<keyof CoreAuthState, string>): AuthApplication {
    return key ? this.apps[key] : this.defaultApp;
  }

  beginAuthCodeGrantFlow(options?: {app?: Extract<keyof CoreAuthState, string>}): Observable<AuthorizationCodeGrantRequest> {
    const app = this.appForKey(options && options.app);
    if (app.type !== 'authorization-code-grant') {
      throw new Error(`Can not begin a code grant flwo for an application of type '${app.type}'`);
    }

    const request = {
      redirectUri: app.config.redirectUri,
      clientId: app.config.clientId,
      scope: Set(app.config.scope.split(' ')),
      state: this.state
    };
    this.store.dispatch(new BeginAuthorizationCodeGrant(request, {app: app.name}));
    return app.authFlowState$.pipe(
      filter(state => ApplicationState.isAuthCodeGrantInProgress(state)),
      mapTo(request),
      first()
    );
  }

  setLoginRedirect(commands: any[], options?: {app?: Extract<keyof CoreAuthState, string>}): void {
    this.store.dispatch(new SetLoginRedirect(commands, options));
  }
}

export function notAnAuthApplication(appKey: any) {
  return new Error(`Not a known auth application: '${appKey}'`);
}
