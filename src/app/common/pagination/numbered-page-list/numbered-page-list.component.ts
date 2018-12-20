import {Component, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {PageNumberPagination, PaginatedResponseFactory} from '../pagination.service';
import {BehaviorSubject, combineLatest, Subject} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

@Component({
  selector: 'app-pagination-numbered-page-list',
  templateUrl: './numbered-page-list.component.html',
  exportAs: 'page'
})
export class PaginationNumberedPageListComponent<T> implements OnDestroy {

  private paginationSubject = new Subject<PageNumberPagination<T>>();
  private pageNumberSubject = new BehaviorSubject<number | 'prev' | 'next' | 'last'>(1);

  @Input() set pagination(pagination: PageNumberPagination<T>) {
    console.log('next pagination', pagination);
    this.paginationSubject.next(pagination);
  }

  readonly page$ = this.paginationSubject.pipe(switchMap(pagination => pagination.page$));
  readonly pageResults$ = this.page$.pipe(
    map(page => page.results),
    tap(page => console.log('member-page', page))
  );


  constructor(
    readonly paginationFactory: PaginatedResponseFactory<T>
  ) {
    combineLatest(this.paginationSubject, this.pageNumberSubject).pipe(
      switchMap(([pagination, pageNumber]) => {
        console.log('setting page to ', pageNumber);
        return pagination.setCurrentPage(pageNumber);
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.paginationSubject.complete();
    this.pageNumberSubject.complete();
  }


}
