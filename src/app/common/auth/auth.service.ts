import * as uuid from 'uuid';

import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {APP_BASE_HREF} from '@angular/common';

import {createSelector, select, Selector, Store} from '@ngrx/store';


import {
  AUTH_APPLICATION_CONFIGS,
  AuthApplication,
  AuthApplicationConfig,
  AuthApplicationConfigs, AuthorizationCodeGrantApplication, PublicGrantApplication,
  ResourceOwnerPasswordGrantApplication
} from './application.model';
import {AUTH_STATE_SELECTOR, AuthState} from './auth.state';
import {Observable} from 'rxjs';
import {ApplicationState} from './application.state';

@Injectable()
export class AuthService<CoreAuthState extends Record<keyof CoreAuthState, ApplicationState>> {
  // The state variable to pass into authorization

  readonly appKeys: (Extract<keyof CoreAuthState, string>)[];
  readonly apps: Readonly<Record<keyof CoreAuthState, AuthApplication>>;

  constructor(
    private readonly http: HttpClient,
    private readonly store: Store<any>,
    @Inject(AUTH_STATE_SELECTOR) private readonly authStateSelector: Selector<object, CoreAuthState>,
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
}

export function notAnAuthApplication(appKey: any) {
  return new Error(`Not a known auth application: '${appKey}'`);
}
