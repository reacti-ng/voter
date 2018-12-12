import {isJsonDocument, JsonArray, JsonDocument, JsonObject, notAJsonDocumentError} from './json.model';
import {OperatorFunction, pipe} from 'rxjs';
import {map} from 'rxjs/operators';

export function fromJson<T>(decode: {ifObj?: (obj: JsonObject) => T}): OperatorFunction<object, T>;
export function fromJson<T>(decode: {ifArr?: (arr: JsonArray) => T}): OperatorFunction<any[], T>;
export function fromJson<T>(decode: {ifObj?: (obj: JsonObject) => T, ifArr?: (arr: JsonArray) => T}) {
  return map((obj) => {
    if (!isJsonDocument(obj)) {
      throw notAJsonDocumentError(obj);
    }
    return JsonDocument.fromJson(decode, obj);
  });
}
