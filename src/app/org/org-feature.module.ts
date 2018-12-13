import {NgModule} from '@angular/core';
import {OrgMembershipPageComponent} from './features/membership/membership.component';
import {RouterModule} from '@angular/router';
import {orgRoutes} from './org.routes';
import {OrgMemberDetailsPageComponent} from './features/member-details/member-details.component';
import {CommonModule} from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {orgStateReducer} from './org.state';
import {OrgActivityPageComponent} from './features/activity/activity.component';
import {PollSharedModule} from '../poll/poll-shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(orgRoutes),
    StoreModule.forFeature('features.org', orgStateReducer),

    PollSharedModule
  ],
  declarations: [
    OrgMembershipPageComponent,
    OrgMemberDetailsPageComponent,
    OrgActivityPageComponent
  ]
})
export class OrgFeatureModule {}
