import {JsonAny, JsonObject} from './json.model';

export type JsonEncoder<T, Json extends JsonAny> = (obj: T) => Json;

export type PropertyEncoder<T, Prop extends keyof T, Json extends JsonAny> = (value: T, key: Prop) => Json;
export function encodeProperties<T>(properties: {[k in keyof T]: PropertyEncoder<T[k], keyof T[k], JsonObject>}): JsonEncoder<T, JsonObject> {
  return function (t: T) {
    const tKeys = Object.keys(t) as (keyof T)[];

    // For each key, call `encodeProperties[key]` with the value `t[key]` and the key itself.
    const partials = tKeys.map((k: keyof T) => properties[k](t[k], k));
    return Object.assign({}, ...partials) as JsonObject;
  };
}
