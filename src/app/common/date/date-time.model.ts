import {isValid, parse as parseDate} from 'date-fns';
import {JsonPointer} from 'json-pointer';

import {decodeNullable, Default, fromJsonAny, JsonDecoder} from '../json/decoder';
import {JsonParseError} from '../json/parse-errors';
import {Observable} from 'rxjs';
import {JsonAny} from '../json/json.model';

export type DateTime = Date;

export function dateTimeFromJson(rawDate: string, pointer?: JsonPointer) {
  const maybeDate = parseDate(rawDate);
  if (!isValid(maybeDate)) {
    throw new JsonParseError('an ISO 8601 string', maybeDate, pointer);
  }
  return maybeDate;
}

