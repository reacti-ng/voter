import {isNull} from '../common.types';
import {isDevMode} from '@angular/core';

export type JsonPrimitive = boolean | number | string;
export function isJsonPrimitive(obj: any): obj is JsonPrimitive {
  return ['string', 'number', 'boolean'].includes(typeof obj);
}

export interface JsonObject { [k: string]: JsonPrimitive | object | any[] | null; }
export function isJsonObject(obj: any): obj is JsonObject {
  return typeof obj === 'object' && obj != null
    // Get rid of this check at production.
    && (isDevMode() ? Object.keys(obj).every((key) => isJsonAny(obj[key])) : true);
}

export type JsonArray = (JsonPrimitive | JsonObject | any[] | null)[];
export function isJsonArray(obj: any): obj is JsonArray {
  return Array.isArray(obj)
      // Get rid of this check in prod.
      && (isDevMode() ? obj.every(item => isJsonAny(item)) : true);
}

export type JsonAny = JsonPrimitive | JsonObject | JsonArray | object | null;
export function isJsonAny(obj: any): obj is JsonAny {
  return isNull(obj) || isJsonPrimitive(obj) || isJsonObject(obj) || isJsonArray(obj);
}

export type JsonDocument = JsonObject | JsonArray;
export function isJsonDocument(obj: any): obj is JsonDocument { return isJsonArray(obj) || isJsonObject(obj); }



