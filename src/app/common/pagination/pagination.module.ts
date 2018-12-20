import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {NgbPaginationModule} from '@ng-bootstrap/ng-bootstrap';
import {PaginationNumberedPageListComponent} from './numbered-page-list/numbered-page-list.component';
import {PaginatedResponseFactory} from './pagination.service';


@NgModule({
  imports: [
    CommonModule,
    NgbPaginationModule
  ],
  declarations: [
    PaginationNumberedPageListComponent
  ],
  providers: [
    PaginatedResponseFactory
  ],
  exports: [
    PaginationNumberedPageListComponent
  ]
})
export class CommonPaginationModule {
}
