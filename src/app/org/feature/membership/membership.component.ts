import {Component, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {createSelector, select, Store} from '@ngrx/store';
import {Org} from '../../org.model';
import {OrgState} from '../../org.state';
import {filter, ignoreElements, map, switchMap} from 'rxjs/operators';
import {selectDetailOrg} from '../feature.state';
import {OrgService} from '../../org.service';
import {List} from 'immutable';

@Component({
  selector: 'app-org-membership-page',
  templateUrl: './membership.component.html',
})
export class OrgMembershipPageComponent implements OnDestroy {
  readonly destroy$ = new Subject<void>();

  constructor(
    readonly store: Store<object>,
    readonly orgService: OrgService
  ) {}

  readonly detail$: Observable<Org> = this.store.pipe(
    select(selectDetailOrg),
    filter((org): org is Org => org !== undefined)
  );

  readonly memberPagination$ = this.detail$.pipe(
    map(org => this.orgService.getOrgMembers(this.destroy$, org))
  );

  ngOnDestroy() {
    this.destroy$.complete();
  }
}
