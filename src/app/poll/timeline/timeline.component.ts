import {Component, Input, NgModule, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PollTimelineCardComponent} from '../timeline-card/timeline-card.component';
import {BehaviorSubject, Observable} from 'rxjs';
import {List} from 'immutable';
import {PollService} from '../poll.service';
import {Poll} from '../poll.model';
import {map, switchMap} from 'rxjs/operators';

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

