import {Component, Input, TemplateRef} from '@angular/core';
import {OrgMembership} from '../../membership.model';
import {OrgMembershipListComponent} from '../membership-list.component';
import {OrgService} from '../../../org.service';
import {BehaviorSubject} from 'rxjs';
import {isNotUndefined} from '../../../../common/common.types';
import {filter, switchMap} from 'rxjs/operators';
import {UserService} from '../../../../user/user.service';
import {User} from '../../../../user/user.model';

export interface ListContext {
  readonly membership: OrgMembership;
  readonly index: number;
}


@Component({
  selector: 'app-org-membership-list-item',
  templateUrl: './item.component.html'
})
export class OrgMembershipListItemComponent {
  private membershipSubject = new BehaviorSubject<OrgMembership | undefined>(undefined);

  @Input()
  get membership() { return this.membershipSubject.value; }
  set membership(orgMembership: OrgMembership | undefined) {
    this.membershipSubject.next(orgMembership);
  }

  @Input() bodyTemplate: TemplateRef<ListContext> | undefined;
  constructor(
    readonly userService: UserService,
    readonly orgService: OrgService,
    readonly orgMembershipList: OrgMembershipListComponent
  ) {}

  readonly org$ = this.membershipSubject.pipe(
    filter((item): item is OrgMembership => item !== undefined),
    switchMap(membership => this.orgService.resolve(membership.org))
  );

  get context() {
    return {
      membership: this.membership,
      index: this.membership ? this.orgMembershipList.memberships.indexOf(this.membership) : -1
    };
  }
}
