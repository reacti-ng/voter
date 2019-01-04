import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrgSearchComponent} from './search/org-search.component';
import {OrgBadgeComponent} from './membership/badge/badge.component';
import {PollSharedModule} from '../poll/poll-shared.module';
import {OrgService} from './org.service';
import {CommonPaginationModule} from '../common/pagination/pagination.module';
import {OrgMembershipInfoModule} from './membership/info/info.module';


@NgModule({
  imports: [
    CommonModule,
    CommonPaginationModule,
    PollSharedModule,
    OrgMembershipInfoModule
  ],
  declarations: [
    OrgBadgeComponent,
    OrgSearchComponent,
  ],
  providers: [
    OrgService
  ],
  exports: [
    OrgBadgeComponent,
    OrgSearchComponent,
    OrgMembershipInfoModule
  ]
})
export class OrgSharedModule {
}
