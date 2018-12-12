import {Observable} from 'rxjs';
import {Collection} from 'immutable';
import {ModelRef} from './model-ref.model';
import {Ident} from './ident.model';

export interface ModelResolver<T extends Ident> {
  resolve(ref: ModelRef<T>): Observable<T>;
  resolveMany(refs: Iterable<ModelRef<T>>): Observable<Collection.Indexed<T>>;
}
