import {Component} from '@angular/core';
import {createSelector, select, Store} from '@ngrx/store';
import {OrgState} from '../org.state';
import {map, switchMap} from 'rxjs/operators';
import {OrgService} from '../org.service';
import {EMPTY, Observable} from 'rxjs';
import {PageCursorPagination} from '../../common/model/pagination.service';
import {Poll} from '../../poll/poll.model';
import {Org} from '../org.model';
import {ActivatedRoute} from '@angular/router';


@Component({
  selector: 'app-org-poll-timeline',
  templateUrl: './poll-timeline.component.html'
})
export class OrgPollTimelineComponent {
  constructor(
    readonly store: Store<object>,
    readonly orgService: OrgService
  ) {}

  readonly current$: Observable<Org | undefined> = this.store.pipe(
    select(createSelector(OrgState.fromRoot, OrgState.current))
  );
  readonly pollFilters$ = this.current$.pipe(
    map(org => org && {org: org.id})
  );

}
