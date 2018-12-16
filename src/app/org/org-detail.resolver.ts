import {Org} from './org.model';
import {Injectable} from '@angular/core';
import {OrgService} from './org.service';
import {Store} from '@ngrx/store';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {SetDetailOrg} from './org.actions';


@Injectable()
export class OrgDetailResolver implements Resolve<Org> {
  constructor(
    readonly store: Store<object>,
    readonly orgService: OrgService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Org> {
    const orgId = route.paramMap.get('org');
    if (orgId == null) {
      throw new Error(`No org ':name' parameter in route`);
    }
    return this.orgService.fetch(orgId).pipe(
      tap((org) => this.store.dispatch(new SetDetailOrg(org)))
    );
  }
}
