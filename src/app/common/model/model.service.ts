import {Collection, List, Set} from 'immutable';
import {EntityState} from '@ngrx/entity';
import {concat, NEVER, Observable, of, race, timer} from 'rxjs';
import {concatMapTo, filter, first, map, switchMap, switchMapTo, tap} from 'rxjs/operators';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Ident} from './ident.model';
import {ModelResolver} from './model-resolver.service';
import {isJsonObject, JsonObject} from '../json/json.model';
import {ModelRef} from './model-ref.model';
import {isString} from '../common.types';
import {Injectable} from '@angular/core';
import {PageCursorPagination, PageNumberPagination, PaginatedResponseFactory} from '../pagination/pagination.service';
import {simplePageResponseFromJson} from '../pagination/http-response-page.model';

/** TODO: This should be split into a number of smaller mixins which are provided to services using injection */

@Injectable()
export abstract class ModelService<T extends Ident> implements ModelResolver<T> {

  protected abstract readonly path: string;
  protected abstract readonly fromJson: (json: JsonObject) => T;
  protected abstract readonly entityState$: Observable<EntityState<T>>;

  protected abstract addEntity(entity: T): void;
  protected abstract addManyEntities(entities: Set<T>): void;

  protected constructor(
    readonly http: HttpClient,
    readonly pagination: PaginatedResponseFactory
  ) {}

  fetch(id: string, options = {ignoreCache: false}): Observable<T> {
    const fromCache$ = options.ignoreCache ? NEVER : this.entityState$.pipe(
      map(state => state.entities[id]),
      filter(entity => entity !== undefined)
    );

    // A  http request _might_ be performed, we don't want to return synchronously
    // sometimes and async other times.
    // The principle of least surprise is that `fetch` will _always_ return
    // asynchronously, even if reading from the store.
    const asyncFromCache$ = timer(0).pipe(
      concatMapTo(fromCache$)
    );

    const fromServer$ = this.http.get(`${this.path}/${id}`).pipe(
      map(json => {
        if (isJsonObject(json)) {
          return this.fromJson(json);
        }
        throw new Error(`Response was not a json object: ${json}`);
      }),
      tap((entity) => this.addEntity(entity))
    );

    return race(asyncFromCache$, fromServer$).pipe(first());
  }

  /**
   * Fetch all the given ids. FetchAll cannot ignore the existing store value, if there
   * is a value for the id in the store, it will be fetched.
   *
   * @param ids: string[]
   * The ids to fetch
   */
  fetchAll(ids: string[]): Observable<Collection.Indexed<T>> {
    return of({resolved: Set(), remaining: Set(ids)}).pipe(
      switchMap(({resolved, remaining}) => {
        return this.entityState$.pipe(
          first(),
          map((state) => {
            const idsInState = Set((state.ids as string[]).filter(entityId => remaining.includes(entityId)));
            resolved = idsInState.map(id => state.entities[id] as T);
            remaining = remaining.subtract(idsInState);
            return {resolved, remaining};
          })
        );
      }),
      switchMap(({resolved, remaining}) => {
        return this.http.get<JsonObject>(this.path, {params: {in: remaining.join(',')}}).pipe(
          simplePageResponseFromJson<T>(this.fromJson),
          map(entities => Set(entities.results)),
          tap(fetchedEntities => this.addManyEntities(fetchedEntities)),
          map(fetchedEntities => ({
            resolved: resolved.union(fetchedEntities),
            remaining: remaining.subtract(fetchedEntities.map(ent => ent.id))
          }))
        );
      }),
      switchMap(({resolved, remaining}) => {
        if (!remaining.isEmpty()) {
          throw new Error(`Could not resolve refs: ${remaining.map(id => `'${id}'`).join(',')}`);
        }
        return List(resolved).sort((r1, r2) => Math.sign(ids.indexOf(r1.id) - ids.indexOf(r2.id)));
      })
    );
  }

  fetchMany(destroy$: Observable<void>, options?: {params: HttpParams | {[k: string]: string | string[]}, notifyDestroy?: Observable<void>}): Observable<List<T>> {
    options = options || {params: new HttpParams()};
    return this.pagination.create(this.path, {
      paginationType: 'none',
      params: options && options.params,
      decodeResult: this.fromJson,
      notifier: options && options.notifyDestroy
    });
  }

  search(options?: { params: HttpParams | {[k: string]: string | string[]}, notifyDestroy?: Observable<void>}): PageNumberPagination<T> {
    options = options || {params: new HttpParams()};
    return this.pagination.create(this.path, {
      paginationType: 'page-number',
      params: options && options.params,
      decodeResult: this.fromJson,
      notifier: options && options.notifyDestroy
    });
  }

  timeline(destroy$: Observable<void>, options?: { params: HttpParams | {[k: string]: string | string[]}, notifyDestroy?: Observable<void> }): PageCursorPagination<T> {
    options = options || {params: new HttpParams()};
    return this.pagination.create(this.path, {
      paginationType: 'cursor',
      params: options.params,
      decodeResult: this.fromJson,
      notifier: options && options.notifyDestroy
    });
  }

  resolve(ref: ModelRef<T>): Observable<T> {
    return typeof ref === 'string' ? this.fetch(ref) : of(ref);
  }

  resolveMany(refs: Iterable<ModelRef<T>>): Observable<Collection.Indexed<T>> {
    const ids = List(refs).map(ref => isString(ref) ? ref : ref.id);
    return this.fetchAll(ids.toArray());
  }
}
