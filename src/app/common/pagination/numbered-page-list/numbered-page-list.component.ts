import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {List} from 'immutable';

import {PageNumberPagination} from '../pagination.service';

@Component({
  selector: 'app-pagination-numbered-page-list',
  templateUrl: './numbered-page-list.component.html',
})
export class PaginationNumberedPageListComponent<T> implements OnDestroy {
  @Input() pagination: PageNumberPagination<T> | undefined;

  private pageNumberSubject = new BehaviorSubject<number | 'prev' | 'next' | 'last'>(1);
  @Input()
  set pageNumber(pageNumber: number | 'prev' | 'next' | 'last') {
    this.pageNumberSubject.next(pageNumber);
  }
  @Output()
  pageNumberChange = this.pageNumberSubject.pipe();

  ngOnDestroy() {
    this.pageNumberSubject.complete();
  }
}
