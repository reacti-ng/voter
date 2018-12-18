import {OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';
import {JsonPointer} from 'json-pointer';

import {fromJsonAny, fromJsonArray, fromJsonObject, JsonDecoder} from '../json/decoder';
import {JsonAny, JsonArray, JsonObject,} from '../json/json.model';

export type Response<T> = SingleResponse<T> | SimplePageResponse<T> | NumberedPageResponse<T> | CursorPageResponse<T> | ErrorResponse;

export type SingleResponse<T> = T;
export function singleResponseFromJson<T>(decodeResult: JsonDecoder<JsonObject, T>): OperatorFunction<JsonObject | object, T> {
  return map((json) => fromJsonAny<T>({
    object: decodeResult,
    ifNull: () => {
      throw new Error(`null cannot be at the root of a json document`);
    }
  })(json));
}


export type PaginationType = 'page-number' | 'cursor' | 'none';

/** For very small data sets */
export interface SimplePageResponse<T> {
  readonly paginationType: 'none';
  readonly results: T[];
}
function resultsFromJson<T>(decodeResult: JsonDecoder<JsonObject, T>, pointer?: JsonPointer): JsonDecoder<JsonArray, T[]> {
  return fromJsonArray(fromJsonAny({object: decodeResult, ifNull: 'throw'}, pointer));
}

export function simplePageResponseFromJson<T>(decodeResult: JsonDecoder<JsonObject, T>): OperatorFunction<JsonAny, SimplePageResponse<T>> {
  return map((json) => fromJsonAny({
    object: fromJsonObject<SimplePageResponse<T>>({
      paginationType: {value: 'none'},
      results: {array: resultsFromJson(decodeResult), ifNull: 'throw'}
    }),
    ifNull: 'throw'
  })(json));
}


/** For stable result sets, not large, but stable and not often edited */
export interface NumberedPageResponse<T> {
  readonly paginationType: 'page-number';

  readonly results: T[];

  // Page numbers are 1-indexed
  readonly pageNumber: number;
  readonly pageTotal: number;

  readonly count: number;
  readonly next: string | null;
  readonly previous: string | null;
}

export function numberedPageResponseFromJson<T>(
  decodeResult: JsonDecoder<JsonObject, T>
): OperatorFunction<JsonAny | object, NumberedPageResponse<T>> {
  return map(json => fromJsonAny<NumberedPageResponse<T>>({
    object: fromJsonObject<NumberedPageResponse<T>>({
      paginationType: {
        value: 'page-number'
      },
      results: {
        array: resultsFromJson(decodeResult)
      },
      pageNumber: {
        source: 'number',
        number: true,
        ifNull: 'throw'
      },
      pageTotal: {
        source: 'total',
        number: true,
        ifNull: 'throw'
      },
      count: {
        source: 'count',
        number: true,
        ifNull: 'throw'
      },
      next: {
        string: true,
        ifNull: null
      },
      previous: {
        string: true,
        ifNull: null
      }
    }),
    ifNull: 'throw'
  })(json));
}

export interface CursorPageResponse<T> {
  readonly paginationType: 'cursor';

  readonly results: T[];
}

export function cursorPageResponseFromJson<T>(decodeResult: JsonDecoder<JsonObject, T>): OperatorFunction<JsonAny | object, CursorPageResponse<T>> {
   return map(json => fromJsonAny<CursorPageResponse<T>>({
     object: fromJsonObject<CursorPageResponse<T>>({
       paginationType: {value: 'cursor'},
       results: {array: resultsFromJson(decodeResult), ifNull: 'throw'}
     }),
     ifNull: 'throw'
  })(json));
}

export interface ErrorResponse {
  readonly error: any;
}
