import {Component, Input} from '@angular/core';
import {Org} from '../../org.model';


@Component({
  selector: 'app-org-membership-badge',
  templateUrl: './badge.component.html',
  styleUrls: [
    './badge.component.scss'
  ]
})
export class OrgBadgeComponent {
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'lg';
  @Input() org: Org | undefined;;

}
