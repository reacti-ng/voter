import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrgSearchComponent} from './search/org-search.component';
import {OrgBadgeComponent} from './badge/badge.component';
import {PollSharedModule} from '../poll/poll-shared.module';
import {OrgService} from './org.service';


@NgModule({
  imports: [
    CommonModule,
    PollSharedModule
  ],
  declarations: [
    OrgBadgeComponent,
    OrgSearchComponent,
  ],
  exports: [
    OrgBadgeComponent,
    OrgSearchComponent
  ]
})
export class OrgSharedModule {
  static forRoot() {
    return {
      ngModule: OrgSharedModule,
      providers: [
        OrgService
      ]
    };
  }

}