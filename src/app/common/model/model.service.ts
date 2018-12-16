import {Collection, List, Set} from 'immutable';
import {EntityState} from '@ngrx/entity';
import {NEVER, Observable, of, race} from 'rxjs';
import {filter, first, map, switchMap, tap} from 'rxjs/operators';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Ident} from './ident.model';
import {ModelResolver} from './model-resolver.service';
import {isJsonObject, JsonObject} from '../json/json.model';
import {ModelRef} from './model-ref.model';
import {isString} from '../common.types';
import {fromJson} from '../json/from-json.operator';
import {SimplePageResponse} from './http-response.model';
import {Injectable} from '@angular/core';
import {PageCursorPagination, PageNumberPagination, PaginatedResponseFactory} from './pagination.service';

interface PartiallyResolved<T extends Ident> {
  resolved: Set<T>;
  remainingIds: Set<string>;
}


@Injectable()
export abstract class ModelService<T extends Ident> implements ModelResolver<T> {

  protected abstract readonly path: string;
  protected abstract readonly fromJson: (json: JsonObject) => T;
  protected abstract readonly entityState$: Observable<EntityState<T>>;

  protected abstract addEntity(entity: T): void;
  protected abstract addManyEntities(entities: Set<T>): void;

  protected constructor(
    readonly http: HttpClient,
    readonly pagination: PaginatedResponseFactory<T>
  ) {}


  fetch(id: string, options = {ignoreCache: false}): Observable<T> {
    const fromCache$ = options.ignoreCache ? NEVER : this.entityState$.pipe(
      map(state => state.entities[id]),
      filter(entity => entity !== undefined)
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

    return race(fromCache$, fromServer$);
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
          fromJson({ifObj: (json) => SimplePageResponse.fromJson(this.fromJson, json).results }),
          map(entities => Set(entities)),
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

  fetchMany(options?: {params: HttpParams | {[k: string]: string | string[]}}): Observable<List<T>> {
    options = options || {params: new HttpParams()};
    return this.pagination.create(this.path, {
      paginationType: 'none',
      params: options.params,
      decodeResult: this.fromJson
    });
  }

  search(options?: { params: HttpParams | {[k: string]: string | string[]} }): PageNumberPagination<T> {
    options = options || {params: new HttpParams()};
    return this.pagination.create(this.path, {
      paginationType: 'page-number',
      params: options.params,
      decodeResult: this.fromJson
    });
  }

  timeline(options?: { params: HttpParams | {[k: string]: string | string[]} }): PageCursorPagination<T> {
    options = options || {params: new HttpParams()};
    return this.pagination.create(this.path, {
      paginationType: 'cursor',
      params: options.params,
      decodeResult: this.fromJson
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
