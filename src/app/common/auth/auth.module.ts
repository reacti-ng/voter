import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthService} from './auth.service';
import {AUTH_SERVICE_CONFIG, AuthServiceConfig} from './auth-config.model';


@NgModule({
  imports: [
    CommonModule
  ]
})
export class CommonAuthModule {
  static forAuthConfig(config: AuthServiceConfig): ModuleWithProviders {
    return {
      ngModule: CommonAuthModule,
      providers: [
        {provide: AUTH_SERVICE_CONFIG, useValue: config},
        AuthService
      ]
    };
  }
}
