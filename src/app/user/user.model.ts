import {Set} from 'immutable';
import {Org} from '../org/org.model';
import {ModelRef} from '../common/model/model-ref.model';
import {JsonObject} from '../common/json/json.model';
import {notAStringError} from '../common/common.types';
import {Ident} from '../common/model/ident.model';


export interface User {
  readonly type: 'user';

  readonly id: string;
  readonly name: string;

  readonly memberOf: Set<ModelRef<Org>>;
}

function userToJson(user: Partial<User>): JsonObject {
  const json: JsonObject = {};
  if (user.id) {
    json['id'] = user.id;
  }
  if (user.name) {
    json['name'] = user.name;
  }
  if (user.memberOf) {
    json['memberOf'] = user.memberOf.map(orgRef => ModelRef.toJson(orgRef)).toArray();
  }
  return json;
}

export const User = {
  toJson: userToJson,
  fromJson: (json: JsonObject): User => JsonObject.fromJson<User>({
    type: () => 'user',
    id: () => Ident.fromJson(json).id,
    name: ({name}) => {
      if (typeof name !== 'string') {
        throw notAStringError('name', name);
      }
      return name;
    },
    memberOf: ({memberOf}) => {
      return Array.isArray(memberOf)
        ? Set(memberOf.map(orgRef => ModelRef.fromJson(Org.fromJson, orgRef)))
        : Set();
    }
  }, json)
};

