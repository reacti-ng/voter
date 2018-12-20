import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {OrgMembershipListItemComponent} from './item/item.component';
import {OrgMembershipListComponent} from './membership-list.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    OrgMembershipListItemComponent,
    OrgMembershipListComponent
  ],
  exports: [
    OrgMembershipListComponent
  ]
})
export class OrgMembershipListModule {}
