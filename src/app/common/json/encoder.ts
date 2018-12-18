import {JsonAny, JsonObject} from './json.model';

export type JsonEncoder<T, Json extends JsonAny> = (obj: T) => Json;

export type JsonPropertyEncoder<T, Json extends JsonAny> = (value: T, key: keyof T) => Json;
export function toJsonObject<T>(
  properties: {[k in keyof T]: JsonPropertyEncoder<T, JsonObject>}
): JsonEncoder<T, JsonObject> {
  return function (t: T) {
    const tKeys = Object.keys(t) as (keyof T)[];

    // For each key, call `encodeProperties[key]` with the value `t[key]` and the key itself.
    const partials = tKeys.map((k) => properties[k](t, k));
    return Object.assign({}, ...partials) as JsonObject;
  };
}
