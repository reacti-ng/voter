import {NgModule} from '@angular/core';
import {ApiHostInterceptor} from './api-host.interceptor';
import {ApiAuthInterceptor} from './api-auth.interceptor';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {CommonPaginationModule} from '../pagination/pagination.module';


@NgModule({
  imports: [
    CommonPaginationModule
  ]
})
export class CommonModelModule {
  static forRoot() {
    return {
      ngModule: CommonModelModule,
      providers: [
        {provide: HTTP_INTERCEPTORS, useClass: ApiAuthInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: ApiHostInterceptor, multi: true},
      ]
    };
  }
}
