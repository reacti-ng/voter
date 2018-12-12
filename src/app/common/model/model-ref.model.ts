import {isString} from '../common.types';
import {isJsonObject, JsonAny, JsonObject, JsonTypeError} from '../json/json.model';
import {Ident} from './ident.model';

export type ModelRef<T extends Ident> = string | T;
export function isModelRef<T extends Ident>(obj: any): obj is ModelRef<T> {
  return typeof obj === 'string' || isJsonObject(obj);
}
export function isJsonModelRef(obj: JsonAny): obj is string | JsonObject {
  return isString(obj) || isJsonObject(obj);
}


export const ModelRef = {
  toJson: <T extends Ident>(ref: ModelRef<T>) => isString(ref) ? ref : ref.id,
  fromJson: <T extends Ident>(decodeObject: (obj: JsonObject) => T, json: JsonAny) => {
    if (isString(json)) {
      return json as string;
    }
    if (isJsonObject(json) && typeof json.id === 'string') {
      return decodeObject(json);
    }
    throw new JsonTypeError('JsonObject | string', json);
  }
};
