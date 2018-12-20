import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {OrgDetailResolver} from './resolver.service';
import {OrgHomeComponent} from './home/home.component';
import {OrgActivityPageComponent} from './activity/activity.component';
import {CommonModule} from '@angular/common';
import {PollTimelineModule} from '../../poll/timeline/timeline.module';
import {OrgMembershipPageComponent} from './membership/membership.component';
import {StoreModule} from '@ngrx/store';
import {OrgFeatureState, reduceOrgFeatureState} from './feature.state';
import {OrgSharedModule} from '../org-shared.module';
import {OrgMembershipListModule} from '../membership/membership-list/membership-list.module';
import {CommonPaginationModule} from '../../common/pagination/pagination.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: ':org',
        canActivate: [OrgDetailResolver],
        component: OrgHomeComponent,
        children: [
          {
            path: 'activity',
            component: OrgActivityPageComponent
          },
          {
            path: 'members',
            component: OrgMembershipPageComponent
          }
        ]
      }
    ]),
    StoreModule.forFeature('org.feature', reduceOrgFeatureState),
    OrgSharedModule,

    CommonPaginationModule,
    OrgMembershipListModule,
    PollTimelineModule
  ],
  declarations: [
    OrgHomeComponent,
    OrgActivityPageComponent,
    OrgMembershipPageComponent
  ],
  providers: [
    OrgDetailResolver
  ]
})
export class OrgFeatureModule {}
