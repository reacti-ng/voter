import {OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {fromJsonAny, JsonDecoder} from '../json/decoder';
import {JsonAny, JsonObject} from '../json/json.model';

export type SingleResponse<T> = T;
export function singleResponseFromJson<T>(decodeResult: JsonDecoder<JsonObject, T>): OperatorFunction<JsonAny, T> {
  return map((json) => fromJsonAny<T>({
    object: decodeResult,
    ifNull: () => {
      throw new Error(`null cannot be at the root of a json document`);
    }
  })(json));
}

export interface ErrorResponse {
  readonly error: any;
}
