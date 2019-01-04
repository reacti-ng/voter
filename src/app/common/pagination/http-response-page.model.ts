import {fromJsonAny, fromJsonArray, fromObjectProperties, JsonDecoder} from '../json/decoder';
import {OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';
import {JsonPointer} from 'json-pointer';

import {JsonAny, JsonArray, JsonObject} from '../json/json.model';
import {singleResponseFromJson} from '../model/http-response.model';

export type PaginationType = 'page-number' | 'cursor' | 'none';
export type HttpResponsePage<T> = SimplePageResponse<T> | NumberedPageResponse<T> | CursorPageResponse<T>;

/** For very small data sets */
export interface SimplePageResponse<T> {
  readonly paginationType: 'none';
  readonly results: T[];
}
function resultsFromJson<T>(decodeResult: JsonDecoder<JsonObject, T>, pointer?: JsonPointer): JsonDecoder<JsonArray, T[]> {
  return fromJsonArray(fromJsonAny({object: decodeResult, ifNull: 'throw'}, pointer));
}

export function simplePageResponseFromJson<T>(decodeResult: JsonDecoder<JsonObject, T>): OperatorFunction<JsonAny, SimplePageResponse<T>> {
  return singleResponseFromJson(fromObjectProperties<SimplePageResponse<T>>({
    paginationType: {value: 'none'},
    results: {array: resultsFromJson(decodeResult), ifNull: 'throw'}
  }));
}

/** For stable result sets, not large, but stable and not often edited */
export interface NumberedPageResponse<T> {
  readonly paginationType: 'page-number';

  readonly results: T[];

  // Page numbers are 1-indexed
  readonly number: number;
  readonly total: number;

  readonly next: number | null;
  readonly prev: number | null;
}

export function numberedPageResponseFromJson<T>(
  decodeResult: JsonDecoder<JsonObject, T>
): OperatorFunction<JsonAny, NumberedPageResponse<T>> {
  return singleResponseFromJson(
    fromObjectProperties<NumberedPageResponse<T>>({
      paginationType: { value: 'page-number' },
      results:        { array: resultsFromJson(decodeResult) },
      number:         { number: true, ifNull: 'throw' },
      total:          { number: true, ifNull: 'throw' },
      next:           { number: true, ifNull: null },
      prev:           { number: true, ifNull: null }
    })
  );
}

export interface CursorPageResponse<T> {
  readonly paginationType: 'cursor';

  readonly results: T[];
}

export function cursorPageResponseFromJson<T>(decodeResult: JsonDecoder<JsonObject, T>): OperatorFunction<JsonAny, CursorPageResponse<T>> {
  return singleResponseFromJson(
    fromObjectProperties<CursorPageResponse<T>>({
      paginationType: {value: 'cursor'},
      results: {array: resultsFromJson(decodeResult), ifNull: 'throw'}
    })
  );
}
