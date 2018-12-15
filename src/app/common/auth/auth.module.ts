import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthService} from './auth.service';
import {AUTH_APPLICATION_CONFIGS, AUTH_DEFAULT_APPLICATION, AuthApplicationConfigs} from './application.model';
import {IsAuthorizedGuard} from './auth.guard';
import {AuthorizationCodeGrantRedirectHandlerGuard} from './authorization-code-grant-redirect-handler.guard';


@NgModule({
  imports: [
    CommonModule
  ]
})
export class CommonAuthModule {
  static forRoot(configs: AuthApplicationConfigs<any>): ModuleWithProviders {
    return {
      ngModule: CommonAuthModule,
      providers: [
        {provide: AUTH_APPLICATION_CONFIGS, useValue: configs},
        AuthService,
        IsAuthorizedGuard,
        AuthorizationCodeGrantRedirectHandlerGuard
      ]
    };
  }
}
