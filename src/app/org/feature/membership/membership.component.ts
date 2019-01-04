import {Component, OnDestroy} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {filter, map, switchMap} from 'rxjs/operators';
import {selectDetailOrg, selectMembershipPageResults} from '../feature.state';
import {Org} from '../../org.model';
import {OrgService} from '../../org.service';
import {SetMembershipPageResults} from '../feature.actions';
import {List} from 'immutable';
import {OrgMembership} from '../../membership/membership.model';

@Component({
  selector: 'app-org-membership-page',
  templateUrl: './membership.component.html',
})
export class OrgMembershipPageComponent implements OnDestroy {
  readonly destroy$ = new Subject<void>();
  readonly pageNumberSubject = new BehaviorSubject<'next' | 'prev' | 'first' | 'last' | number>(1);

  get pageNumber() {
    return this.pageNumberSubject.value;
  }
  set pageNumber(value: 'next' | 'prev' | 'first' | 'last' | number) {
    this.pageNumberSubject.next(value);
  }

  constructor(
    readonly store: Store<object>,
    readonly orgService: OrgService
  ) {}

  readonly detail$: Observable<Org> = this.store.pipe(
    select(selectDetailOrg),
    filter((org): org is Org => org !== undefined)
  );

  readonly memberPagination$ = this.detail$.pipe(
    map(org => this.orgService.getOrgMembers(org, {notifier: this.destroy$})),
  );

  readonly pageResults$ = this.store.pipe(select(selectMembershipPageResults));

  readonly pageResultsSubscription = combineLatest(this.memberPagination$, this.pageNumberSubject).pipe(
    switchMap(([pagination, pageNumber]) => pagination.setCurrentPage(pageNumber))
  ).subscribe((results) => this.store.dispatch(new SetMembershipPageResults(results)));

  ngOnDestroy() {
    this.destroy$.complete();
    this.pageResultsSubscription.unsubscribe();
  }
}
