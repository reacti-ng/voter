import {ActivatedRouteSnapshot, RouterStateSnapshot, Routes} from '@angular/router';
import {OrgMembershipPageComponent} from './features/membership/membership.component';
import {OrgMemberDetailsPageComponent} from './features/member-details/member-details.component';
import {OrgActivityPageComponent} from './features/activity/activity.component';
import {Injectable} from '@angular/core';
import {OrgService} from './org.service';
import {Org} from './org.model';
import {Resolver} from '@angular/core/testing/src/resolvers';
import {Observable} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {OrgDetailResolver} from './org-detail.resolver';


export const orgRoutes: Routes = [
  {
    path: ':org',
    children: [
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
    ],
    resolve: [OrgDetailResolver]
  },
];

