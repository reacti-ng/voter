import {Routes} from '@angular/router';
import {OrgMembershipPageComponent} from './page/membership/membership.component';
import {OrgMemberDetailsPageComponent} from './page/member-details/member-details.component';


export const orgRoutes: Routes = [
  {
    path: 'members',
    component: OrgMembershipPageComponent,
    children: [
      {
        path: ':id',
        component: OrgMemberDetailsPageComponent
      }
    ]
  }
];
