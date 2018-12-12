import {NgModule} from '@angular/core';
import {OrgMembershipPageComponent} from './page/membership/membership.component';
import {RouterModule} from '@angular/router';
import {orgRoutes} from './org.routes';
import {OrgMemberDetailsPageComponent} from './page/member-details/member-details.component';
import {CommonModule} from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {orgStateReducer} from './org.state';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(orgRoutes),
    StoreModule.forFeature('features.org', orgStateReducer)
  ],
  declarations: [
    OrgMembershipPageComponent,
    OrgMemberDetailsPageComponent,

  ]
})
export class OrgFeatureModule {}
