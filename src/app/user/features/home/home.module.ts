import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrgMembershipListModule} from '../../../org/membership/membership-list/membership-list.module';
import {UserHomeComponent} from './home.component';
import {RouterModule} from '@angular/router';
import {homeRoutes} from './home.routes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(homeRoutes),
    OrgMembershipListModule
  ],
  declarations: [
    UserHomeComponent
  ]
})
export class UserHomeFeatureModule {}
