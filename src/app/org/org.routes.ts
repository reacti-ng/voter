import {Routes} from '@angular/router';
import {OrgMembershipPageComponent} from './features/membership/membership.component';
import {OrgMemberDetailsPageComponent} from './features/member-details/member-details.component';
import {OrgActivityPageComponent} from './features/activity/activity.component';


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
  },
  {
    path: 'activity',
    component: OrgActivityPageComponent
  }
];
