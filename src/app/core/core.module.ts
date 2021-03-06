import {coreStateActionReducerMap, selectAuthState, selectControlsState} from './core.state';
import {StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {NgModule} from '@angular/core';
import {CONTROLS_STATE_SELECTOR} from '../common/control/controls.state';
import {RouterModule} from '@angular/router';
import {coreRoutes} from './core.routes';
import {EffectsModule} from '@ngrx/effects';
import {coreEffects} from './core.effects';
import {environment} from '../../environments/environment';
import {ContainerModule} from './container/container.module';
import {CommonAuthModule} from '../common/auth/auth.module';
import {HttpClientModule} from '@angular/common/http';
import {APP_BASE_HREF} from '@angular/common';
import {UserModule} from '../user/user.module';
import {PollSharedModule} from '../poll/poll-shared.module';
import {API_BASE_HREF} from '../common/model/api-host.interceptor';
import {CommonModelModule} from '../common/model/model.module';
import {AUTH_STATE_SELECTOR} from '../common/auth/auth.state';
import {AUTH_DEFAULT_APPLICATION} from '../common/auth/application.model';

@NgModule({
  imports: [
    StoreModule.forRoot(coreStateActionReducerMap),
    StoreDevtoolsModule.instrument({
      maxAge: 50,
      logOnly: environment.production
    }),
    EffectsModule.forRoot(coreEffects),

    // Before HttpClientModule, to register interceptors.
    CommonModelModule.forRoot(),
    HttpClientModule,
    RouterModule.forRoot(coreRoutes, {enableTracing: !environment.production}),

    CommonAuthModule.forRoot(environment.authConfigs),
    ContainerModule,
    UserModule.forRoot(),
    PollSharedModule.forRoot()
  ],
  providers: [
    {provide: APP_BASE_HREF, useValue: environment.appBaseHref },
    {provide: API_BASE_HREF, useValue: environment.apiBaseHref },
    {provide: CONTROLS_STATE_SELECTOR , useValue: selectControlsState},
    {provide: AUTH_DEFAULT_APPLICATION, useValue: environment.authDefaultAppId},
    {provide: AUTH_STATE_SELECTOR, useValue: selectAuthState},
  ],
  exports: [
    ContainerModule,
  ]
})
export class CoreModule {}
