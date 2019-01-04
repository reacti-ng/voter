import {Set} from 'immutable';
import {JsonPointer} from 'json-pointer';

import {JsonArray, JsonObject} from '../common/json/json.model';
import {fromJsonAny, fromJsonArray, fromObjectProperties} from '../common/json/decoder';


export interface Org {
  readonly id: string;
  // Human readable name for the organisation
  readonly name: string;
}

export const orgFromJson = fromObjectProperties<Org>({
  id: {string: true, ifNull: 'throw'},
  name: {string: true, ifNull: 'throw'},
});
export function orgToJson(org: Org) {
  return {
    id: org.id,
    name: org.name
  } as JsonObject;
}
