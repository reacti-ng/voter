import {
  isJsonObject,
  JsonDocument,
  JsonObject, notAJsonArrayError,
  notAJsonObjectError
} from '../json/json.model';
import {isNumber, isString, notANumberError, notAStringError} from '../common.types';

export type Response<T> = SingleResponse<T> | SimplePageResponse<T> | NumberedPageResponse<T> | CursorPageResponse<T> | ErrorResponse;

export type SingleResponse<T> = T;
export const SingleResponse = { fromJson: JsonDocument.fromJson };

export type PaginationType = 'page-number' | 'cursor' | 'none';

/** For very small data sets */
export interface SimplePageResponse<T> {
  readonly paginationType: 'none';
  readonly results: T[];
}
export const SimplePageResponse = {
  fromJson: <T>(decodeResult: (json: JsonObject) => T, json: JsonObject) => {
    return JsonObject.fromJson<SimplePageResponse<T>>({
      paginationType: () => 'none',
      results: ({results}) => {
        if (Array.isArray(results)) {
          const errObj = results.find(result => !isJsonObject(result));
          if (errObj !== undefined) {
            throw notAJsonObjectError(errObj);
          }
          return results.map(result => decodeResult(result as JsonObject));
        } else {
          throw notAJsonArrayError(results);
        }
      }
    }, json);
  }
};


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

export const NumberedPageResponse = {
  fromJson: <T>(decodeResult: (json: JsonObject) => T, json: JsonObject) => {
    return JsonObject.fromJson<NumberedPageResponse<T>>({
      paginationType: () => 'page-number',
      results: () => SimplePageResponse.fromJson(decodeResult, json).results,
      pageNumber: ({number}) => {
        if (!isNumber(number)) { throw notANumberError('pageNumber', json); }
        return number;
      },
      pageTotal: ({number}) => {
        if (!isNumber(number)) { throw notANumberError('pageTotal', json); }
        return number;
      },
      count: ({count}) => {
        if (!isNumber(count)) { throw notANumberError('count', json); }
        return count;
      },
      next: ({next}) => {
        if (next != null && !isString(next)) { throw notAStringError('next', json); }
        return next;
      },
      previous: ({previous}) => {
        if (previous != null && !isString(previous)) { throw notAStringError('previous', json); }
        return previous;
      }
    }, json);
  }
};

export interface CursorPageResponse<T> extends SimplePageResponse<T> {
  readonly pageType: 'cursor';
}

export interface ErrorResponse {
  readonly error: any;
}
