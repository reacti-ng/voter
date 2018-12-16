import {Injectable} from '@angular/core';
import {OrgService} from './org.service';
import {ActivatedRouteSnapshot, Router} from '@angular/router';

function isOrgRoute(routeSnapshot: ActivatedRouteSnapshot) {
  return routeSnapshot.pathFromRoot.some(route => route.routeConfig && route.routeConfig.path === 'org' || false);
}

@Injectable()
export class OrgEffects {
  constructor(
    readonly router: Router,
    readonly orgService: OrgService
  ) {}
}
