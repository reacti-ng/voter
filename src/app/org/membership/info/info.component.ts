import {Component, Input, OnInit, TemplateRef} from '@angular/core';
import {OrgMembership} from '../membership.model';
import {BehaviorSubject} from 'rxjs';

export interface ListContext {
  readonly membership: OrgMembership;
}


@Component({
  selector: 'app-org-membership-info',
  templateUrl: './info.component.html'
})
export class OrgMembershipInfoComponent implements OnInit {
  @Input() membership: OrgMembership | undefined;
  ngOnInit() { console.log(this.membership); }
}
