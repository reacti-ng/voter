import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Resolve, RouterStateSnapshot} from '@angular/router';
import {Org} from '../org.model';
import {Store} from '@ngrx/store';
import {OrgService} from '../org.service';
import {Observable} from 'rxjs';
import {mapTo, tap} from 'rxjs/operators';
import {SetDetailOrg} from './feature.actions';

/* A detail route cannot activate until the detail org has been set */
@Injectable()
export class OrgDetailResolver implements CanActivate {
  constructor(
    readonly store: Store<object>,
    readonly orgService: OrgService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    console.log('resolving');
    const orgId = route.paramMap.get('org');
    if (orgId == null) {
      throw new Error(`No org ':name' parameter in route`);
    }
    return this.orgService.fetch(orgId).pipe(
      tap((org) => {
        console.log('setting detail org', org);
        this.store.dispatch(new SetDetailOrg(org));
      }),
      mapTo(true)
    );
  }
}
