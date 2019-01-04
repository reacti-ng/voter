import {List, Set} from 'immutable';

import {FromAny, fromJsonAny, fromJsonArray, JsonDecoder} from './decoder';
import {JsonAny, JsonArray} from './json.model';

export function setFromJson<Item>(itemFromAny: FromAny<Item>): JsonDecoder<JsonArray, Set<Item>> {
  const decoder = fromJsonAny({array: fromJsonArray(fromJsonAny(itemFromAny)), ifNull: () => []});
  return (json, pointer) => Set(decoder(json, pointer));
}

export function listFromJson<Item>(itemFromAny: FromAny<Item>): JsonDecoder<JsonAny, List<Item>> {
  const decoder = fromJsonAny({array: fromJsonArray(fromJsonAny(itemFromAny)), ifNull: () => []});
  return (json, pointer) => List(decoder(json, pointer));
}
