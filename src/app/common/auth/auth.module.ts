import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthService} from './auth.service';
import {AUTH_APPLICATION_CONFIGS, AuthApplicationConfigs} from './application.model';


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
        AuthService
      ]
    };
  }
}
