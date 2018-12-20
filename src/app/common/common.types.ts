/* tslint:disable: max-line-length */

import {parse as parseDate} from 'date-fns';

import {Observable, OperatorFunction} from 'rxjs';
import {Collection, List} from 'immutable';
import {map} from 'rxjs/operators';


export function isNull(obj: any): obj is null {
  return obj === null;
}
export function isNotNull<T>(obj: any): obj is Exclude<T, null> {
  return obj !== null;
}

export function isUndefined(obj: any): obj is undefined {
  return obj === undefined;
}
export function isNotUndefined<T>(obj: any): obj is Exclude<T, undefined> {
  return obj !== undefined;
}

export function isNullOrUndefined(obj: any): obj is (null | undefined) {
  return obj == null;
}
export function isNotNullOrUndefined<T>(obj: any): obj is Exclude<T, null | undefined> {
  return obj != null;
}

export function isString(obj: any): obj is string { return typeof obj === 'string'; }
export function isNumber(obj: any): obj is number {
  return typeof obj === 'number';
}

export function isJsonSafeNumber(obj: any): obj is number {
  return isNumber(obj) && !Number.isNaN(obj) && Number.isFinite(obj);
}

export function isBoolean(obj: any): obj is boolean { return typeof obj === 'boolean'; }


export type Mutable<T> = {-readonly [K in keyof T]?: T[K] };
