import {Component, Input, TemplateRef} from '@angular/core';
import {List} from 'immutable';
import {OrgMembership} from '../membership.model';
import {User} from '../../../user/user.model';

/**
 * Displays a list of memberships
 */
@Component({
  selector: 'app-org-membership-list',
  templateUrl: './membership-list.component.html',
})
export class OrgMembershipListComponent {
  @Input() memberships = List<OrgMembership>();
  @Input() itemBodyTemplate: TemplateRef<any> | undefined;
}
