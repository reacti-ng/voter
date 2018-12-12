import {NgModule} from '@angular/core';
import {PaginatedResponseFactory} from './pagination.service';


@NgModule({})
export class CommonModelModule {
  static forRoot() {
    return {
      ngModule: CommonModelModule,
      providers: [
        PaginatedResponseFactory
      ]
    };
  }
}
