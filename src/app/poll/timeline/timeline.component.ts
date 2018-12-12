import {Component, Input, NgModule, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PollTimelineCardComponent} from '../timeline-card/timeline-card.component';
import {BehaviorSubject} from 'rxjs';
import {List} from 'immutable';

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

  ngOnDestroy(): void {
    this.filtersSubject.complete();
  }
}

