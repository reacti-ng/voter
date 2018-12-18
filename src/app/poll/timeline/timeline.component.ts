import {Component, Input, OnDestroy} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {PollService} from '../poll.service';

@Component({
  selector: 'app-poll-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: [
    './timeline.component.scss'
  ]
})
export class PollTimelineComponent implements OnDestroy {
  private filtersSubject = new BehaviorSubject<{[k: string]: string | string[]}>({});

  @Input()
  set filters(filters: {[k: string]: string | string[]}) {
    this.filtersSubject.next(filters);
  }

  readonly pages$ = this.filtersSubject.pipe(map(filter => this.pollService.timeline({params: filter})));
  readonly poll$ = this.pages$.pipe(switchMap(pagination => pagination.results$));

  constructor(
    readonly pollService: PollService
  ) {}

  ngOnDestroy(): void {
    this.filtersSubject.complete();
  }
}

