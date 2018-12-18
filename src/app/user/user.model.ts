import {Set} from 'immutable';
import {JsonPointer} from 'json-pointer';

import {JsonArray, JsonObject} from '../common/json/json.model';
import {fromJsonArray, fromJsonObject} from '../common/json/decoder';

import {Org, orgFromJson} from '../org/org.model';
import {ModelRef, modelRefFromJson, modelRefToJson} from '../common/model/model-ref.model';


export interface User {
  readonly type: 'user';

  readonly id: string;
  readonly name: string;

  readonly memberOf: Set<ModelRef<Org>>;
}

export function userToJson(user: Partial<User>): JsonObject {
  const json: JsonObject = {};
  if (user.id) {
    json['id'] = user.id;
  }
  if (user.name) {
    json['name'] = user.name;
  }
  if (user.memberOf) {
    json['memberOf'] = user.memberOf.map(orgRef => modelRefToJson()(orgRef)).toArray();
  }
  return json;
}


export const userFromJson = fromJsonObject<User>({
  type: {value: 'user'},
  id:  {string: true, ifNull: 'throw'},
  name: {string: true, ifNull: 'throw'},
  memberOf: {
    source: 'member_of',
    array: (json: JsonArray, pointer?: JsonPointer) => {
      const memberOfArr = fromJsonArray(modelRefFromJson(orgFromJson))(json, pointer);
      return Set(memberOfArr);
    },
    ifNull: Set()
  }
});

