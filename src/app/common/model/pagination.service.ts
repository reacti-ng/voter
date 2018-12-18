
import {List} from 'immutable';
import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {filter, first, map, shareReplay, switchMap} from 'rxjs/operators';

import {JsonObject} from '../json/json.model';

import {
  CursorPageResponse,
  cursorPageResponseFromJson,
  NumberedPageResponse, numberedPageResponseFromJson,
  PaginationType,
  SimplePageResponse
} from './http-response.model';

@Injectable()
export class PaginatedResponseFactory<T> {
  constructor(readonly http: HttpClient) {}

  create(url: string, options: {
    readonly paginationType: 'none'
    readonly params: HttpParams | {[k: string]: string | string[]},
    readonly decodeResult: (json: JsonObject) => T
  }): Observable<List<T>>;

  create(url: string, options: {
    readonly paginationType: 'page-number',
    readonly params: HttpParams | {[k: string]: string | string[]},
    readonly decodeResult: (json: JsonObject) => T
  }): PageNumberPagination<T>;

  create(url: string, options: {
    readonly paginationType: 'cursor',
    readonly params: HttpParams | {[k: string]: string | string[]},
    readonly decodeResult: (json: JsonObject) => T
  }): PageCursorPagination<T>;

  create(url: string, options: {
    readonly paginationType: PaginationType,
    readonly params: HttpParams | {[k: string]: string | string[]},
    readonly decodeResult: (json: JsonObject) => T
  }): PaginatedResponse<T> {
    switch (options.paginationType || 'none') {
      case 'none':
        return this.http.get(url, {params: options.params}).pipe(
          numberedPageResponseFromJson(options.decodeResult),
          map((simplePage) => List(simplePage.results))
        );
      case 'page-number':
        return new PageNumberPagination(this.http, url, options);
      case 'cursor':
        return new PageCursorPagination(this.http, url, options);
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
    options: Readonly<{
      params: HttpParams | {[k: string]: string | string[] },
      decodeResult: (json: JsonObject) => T
    }>
  ) {
    this.params = asHttpParams(options.params);
    if (this.params.get('page') !== null) {
      throw new Error(`page param should not be present in pagination constructor params`);
    }
    this.decodeResult = options.decodeResult;
  }

  protected readonly pageNumberSubject = new BehaviorSubject<number | 'last'>(1);
  readonly page$ = this.pageNumberSubject.pipe(
    map(pageNumber => ({params: this.params.set('page', `${pageNumber}`) })),
    switchMap((request) => this.http.get(this.url, {params: request.params})),
    numberedPageResponseFromJson(this.decodeResult),
    shareReplay(1)
  );
  // Keep page alive
  private pageSubscription = this.page$.subscribe();

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
      map(({next, pageNumber}: NumberedPageResponse<T>) => next != null ? pageNumber + 1 : null),
      switchMap(nextPageNumber => nextPageNumber != null ? this.setCurrentPage(nextPageNumber) : of(List()))
    );
  }

  prev(): Observable<List<T>> {
    return this.page$.pipe(
      first(),
      map(({previous, pageNumber}) => previous != null ? pageNumber - 1 : null),
      switchMap(prevPageNumber => prevPageNumber != null ? this.setCurrentPage(prevPageNumber) : List())
    );
  }


  destroy() {
    this.pageNumberSubject.complete();
    this.pageSubscription.unsubscribe();
  }

  setCurrentPage(pageIndex: number | 'last'): Observable<List<T>> {
    this.pageNumberSubject.next(pageIndex);
    return this.waitForPage(pageIndex);
  }

  protected waitForPage(waitForIndex: number | 'last'): Observable<List<T>> {
    return this.page$.pipe(
      filter(page => {
        if (waitForIndex === 'last') {
          // pages are 1-indexed
          return page.pageNumber === page.pageTotal;
        }
        return page.pageNumber === waitForIndex;
      }),
      map(page => List(page.results)),
      first()
    );
  }
}

export class PageCursorPagination<T> {
  readonly paginationType = 'cursor';
  readonly params: HttpParams;
  readonly decodeResult: (obj: JsonObject) => T;

  constructor(
    protected readonly http: HttpClient,
    readonly url: string,
    options: Readonly<{
      params?: HttpParams | {[k: string]: string | string[]},
      decodeResult: (obj: JsonObject) => T
    }>
  ) {
    this.params = asHttpParams(options.params);
    this.decodeResult = options.decodeResult;
  }

  readonly currentPage$: Observable<CursorPageResponse<T>> = throwError(new Error('cursor: page$ not implemented'));

  // FIXME: All results loaded so far
  readonly results$: Observable<List<T>> = throwError(new Error('cursor: results$ not implemented' ));
}

export type PaginatedResponse<T> = Observable<List<T>> | PageNumberPagination<T> | PageCursorPagination<T>;

function asHttpParams(params: HttpParams | {[k: string]: string | string[]} | undefined): HttpParams {
  return params instanceof HttpParams
        ? params
        : params !== undefined
            ? new HttpParams({fromObject: params})
            : new HttpParams();

}


