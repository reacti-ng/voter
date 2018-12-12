import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-org-member-details-page',
  templateUrl: './member-details.component.html',
  styleUrls: [
    './member-details.component.scss'
  ]
})
export class OrgMemberDetailsPageComponent {

  constructor(readonly activatedRoute: ActivatedRoute) {}


}
