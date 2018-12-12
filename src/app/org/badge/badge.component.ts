import {Component, Input} from '@angular/core';


@Component({
  selector: 'app-org-badge',
  templateUrl: './badge.component.html',
  styleUrls: [
    './badge.component.scss'
  ]

})
export class OrgBadgeComponent {
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'lg';

}
