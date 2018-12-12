import {Set} from 'immutable';
import {Injectable} from '@angular/core';
import {Actions, ofType} from '@ngrx/effects';
import {OrgService} from './org.service';
import {AddOrg, ResolveOrgs, SET_ORG_PAGE_SUBJECT, SetOrgPageSubject} from './org.actions';
import {filter, map, switchMap} from 'rxjs/operators';
import {isString} from 'util';
import {ActivatedRouteSnapshot, ActivationEnd, Router, Event} from '@angular/router';
import {defer, EMPTY} from 'rxjs';
import {isNotNull} from '../common/common.types';

function isOrgRoute(routeSnapshot: ActivatedRouteSnapshot) {
  return routeSnapshot.pathFromRoot.some(route => route.routeConfig && route.routeConfig.path === 'org' || false);
}

@Injectable()
export class OrgEffects {
  constructor(
    readonly router: Router,
    readonly orgService: OrgService
  ) {}


  /**
   * On .*\/org\/.* routes, if the route contains an `:id` parameter, then load the
   * id onto the state as `currentOrg`
   */
  readonly loadCurrentOrg$ = defer(() => this.router.events.pipe(
    filter(event => event instanceof ActivationEnd && isOrgRoute(event.snapshot)),
    map((event: Event)  => (event as ActivationEnd).snapshot.paramMap.get('id')),
    switchMap((id: string | null) => id != null ? this.orgService.fetch(id) : EMPTY),
    map(org => new AddOrg(org))
  ));




}
