import {Component, OnInit} from '@angular/core';
import {createSelector, select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {Org} from '../../org.model';
import {OrgState} from '../../org.state';
import {filter, map, tap} from 'rxjs/operators';
import {isNotUndefined} from '../../../common/common.types';
import {selectDetailOrg} from '../feature.state';

@Component({
  selector: 'app-org-activity-page',
  templateUrl: './activity.component.html'
})
export class OrgActivityPageComponent {
  constructor(
    protected readonly store: Store<object>,
  ) {}

  readonly detail$: Observable<Org> = this.store.pipe(
    select(selectDetailOrg),
    filter((org): org is Org => org !== undefined)
  );

  readonly pollFilter$ = this.detail$.pipe(
    map(org => ({org: org.id}))
  );
}
