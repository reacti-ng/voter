import {JsonPointer} from 'json-pointer';
import {JsonAny} from '../json/json.model';
import {dateTimeFromJson} from './date-time.model';
import {getDate, getMonth, getYear} from 'date-fns';
import {decodeNullable, Default, JsonDecoder} from '../json/decoder';
import {JsonParseError} from '../json/parse-errors';

export interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly date: number;
}

const calendarDateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;

export function calendarDateFromJson(json: string, pointer?: JsonPointer) {
  const dateTime = dateTimeFromJson(json, pointer);
  return {year: getYear(dateTime), month: getMonth(dateTime), date: getDate(dateTime)};
}

export function calendarDateToISOString(calendarDate: CalendarDate): string {
  const {date, month, year} = calendarDate;
  return `${format(year)}-${format(month + 1 /* months are 0-indexed */)}-${format(date)}`;

  function format(num: number) {
    const digits = num.toFixed(0);
    return digits.length < 2 ? '0' + digits : digits;
  }
}

