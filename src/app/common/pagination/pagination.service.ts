
import {List} from 'immutable';
import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {BehaviorSubject, noop, Observable, of} from 'rxjs';
import {filter, first, map, scan, shareReplay, switchMap} from 'rxjs/operators';

import {JsonObject} from '../json/json.model';
import {
  CursorPageResponse,
  cursorPageResponseFromJson,
  NumberedPageResponse,
  numberedPageResponseFromJson,
  PaginationType
} from './http-response-page.model';

@Injectable()
export class PaginatedResponseFactory<T> {
  constructor(readonly http: HttpClient) {}

  create(url: string, destroy$: Observable<void>, options: {
    readonly paginationType?: 'none'
    readonly params?: HttpParams | {[k: string]: string | string[]},
    readonly decodeResult: (json: JsonObject) => T,
  }): Observable<List<T>>;

  create(url: string, destroy$: Observable<void>, options: {
    readonly paginationType?: 'page-number',
    readonly params?: HttpParams | {[k: string]: string | string[]},
    readonly decodeResult: (json: JsonObject) => T,
  }): PageNumberPagination<T>;

  create(url: string, destroy$: Observable<void>, options: {
    readonly paginationType?: 'cursor',
    readonly params?: HttpParams | {[k: string]: string | string[]},
    readonly decodeResult: (json: JsonObject) => T,
  }): PageCursorPagination<T>;

  create(url: string, destroy$: Observable<void>, options: {
    readonly paginationType?: PaginationType,
    readonly params?: HttpParams | {[k: string]: string | string[]},
    readonly decodeResult: (json: JsonObject) => T
  }): PaginatedResponse<T> {
    switch (options.paginationType || 'none') {
      case 'none':
        return this.http.get(url, {params: options.params}).pipe(
          numberedPageResponseFromJson(options.decodeResult),
          map((simplePage) => List(simplePage.results))
        );
      case 'page-number':
        return new PageNumberPagination(this.http, url, destroy$, options);
      case 'cursor':
        return new PageCursorPagination(this.http, url, destroy$, options);
      default:
        throw new Error(`Unrecognised pagination type: (${options.paginationType})`);
    }
  }
}

export class PageNumberPagination<T> {
  readonly paginationType = 'page-number';
  readonly params: HttpParams;
  readonly decodeResult: (json: JsonObject) => T;

  constructor(
    protected readonly http: HttpClient,
    readonly url: string,
    destroy$: Observable<void>,
    options: Readonly<{
      params?: HttpParams | {[k: string]: string | string[] },
      decodeResult: (json: JsonObject) => T,
    }>
  ) {
    this.params = asHttpParams(options.params);
    if (this.params.get('page') !== null) {
      throw new Error(`page param should not be present in pagination constructor params`);
    }
    this.decodeResult = options.decodeResult;
    destroy$.subscribe(noop, noop, () => {
      this.pageNumberSubject.complete();
    });
  }

  protected readonly pageNumberSubject = new BehaviorSubject<number | 'last'>(1);
  readonly page$ = this.pageNumberSubject.pipe(
    map(pageNumber => ({params: this.params.set('page', `${pageNumber}`) })),
    switchMap((request) => this.http.get(this.url, {params: request.params})),
    numberedPageResponseFromJson(this.decodeResult),
  );
  readonly pageResults$ = this.page$.pipe(map(page => page.results));

  first(): Observable<List<T>> {
    this.pageNumberSubject.next(1);
    return this.waitForPage(1);
  }

  last(): Observable<List<T>> {
    this.pageNumberSubject.next('last');
    return this.waitForPage('last');
  }

  next(): Observable<List<T>> {
    return this.page$.pipe(
      first(),
      switchMap(({next}) => next != null ? this.setCurrentPage(next) : of(List()))
    );
  }

  prev(): Observable<List<T>> {
    return this.page$.pipe(
      first(),
      switchMap(({prev}) => prev != null ? this.setCurrentPage(prev) : List())
    );
  }

  setCurrentPage(pageIndex: number | 'last' | 'next' | 'prev'): Observable<List<T>> {
    console.log('set current page', pageIndex);
    switch (pageIndex) {
      case 'next':
        return this.next();
      case 'prev':
        return this.prev();
      default:
        this.pageNumberSubject.next(pageIndex);
        return this.waitForPage(pageIndex);
    }
  }

  protected waitForPage(waitForIndex: number | 'last'): Observable<List<T>> {
    return this.page$.pipe(
      filter(page => {
        if (waitForIndex === 'last') {
          // pages are 1-indexed
          return page.number === page.total;
        }
        return page.number === waitForIndex;
      }),
      map(page => List(page.results)),
      first()
    );
  }
}

export class PageCursorPagination<T> {
  readonly paginationType = 'cursor';

  constructor(
    protected readonly http: HttpClient,
    readonly url: string,
    destroy$: Observable<void>,
    readonly options: Readonly<{
      params?: HttpParams | {[k: string]: string | string[]},
      decodeResult: (obj: JsonObject) => T
    }>
  ) {
    destroy$.subscribe(noop, noop, () => {
      this.cursorSubject.complete();
    });
  }

  readonly params = asHttpParams(this.options.params);
  readonly decodeResult = this.options.decodeResult;
  private cursorSubject = new BehaviorSubject<string | undefined>(undefined);

  readonly currentPage$: Observable<CursorPageResponse<T>> = this.cursorSubject.pipe(
    map(cursor => cursor !== undefined ? this.params.set('cursor', cursor) : this.params),
    switchMap(params => this.http.get(this.url, {params})),
    cursorPageResponseFromJson(this.decodeResult),
  );

  readonly results$: Observable<List<T>> = this.currentPage$.pipe(
    scan((results: List<T>, page: CursorPageResponse<T>) => results.concat(page.results), List()),
    shareReplay(1)
  );

}

export type PaginatedResponse<T> = Observable<List<T>> | PageNumberPagination<T> | PageCursorPagination<T>;

function asHttpParams(params: HttpParams | {[k: string]: string | string[]} | undefined): HttpParams {
  return params instanceof HttpParams
        ? params
        : params !== undefined
            ? new HttpParams({fromObject: params})
            : new HttpParams();
}


