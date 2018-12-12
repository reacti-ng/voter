import {Component} from '@angular/core';
import {createSelector, select, Store} from '@ngrx/store';
import {OrgService} from '../../org.service';
import {Observable} from 'rxjs';
import {Org} from '../../org.model';
import {OrgState} from '../../org.state';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-org-activity-page',
  templateUrl: './activity.component.html'
})
export class OrgActivityPageComponent {
  constructor(
    protected readonly store: Store<object>,
    protected readonly orgService: OrgService
  ) {}

  readonly current$: Observable<Org | undefined> = this.store.pipe(
    select(createSelector(OrgState.fromRoot, OrgState.current))
  );

  readonly pollFilters$ = this.current$.pipe(
    map(org => org && {org: org.id})
  );

}
