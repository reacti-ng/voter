import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {OrgMembershipInfoComponent} from './info.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  declarations: [
    OrgMembershipInfoComponent
  ],
  exports: [
    OrgMembershipInfoComponent
  ]
})
export class OrgMembershipInfoModule {}
