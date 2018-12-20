import {Set} from 'immutable';
import {JsonPointer} from 'json-pointer';

import {JsonArray, JsonObject} from '../common/json/json.model';
import {fromJsonAny, fromJsonArray, fromJsonObject} from '../common/json/decoder';

import {modelRefToJson} from '../common/model/model-ref.model';
import {OrgMembership, orgMembershipFromJson} from '../org/membership/membership.model';


export interface User {
  readonly type: 'user';

  readonly id: string;
  readonly name: string;

  readonly memberOf: Set<OrgMembership>;
}

export const userFromJson = fromJsonObject<User>({
  type: {value: 'user'},
  id:  {string: true, ifNull: 'throw'},
  name: {string: true, ifNull: 'throw'},
  memberOf: {
    source: 'member_of',
    array: (json: JsonArray, pointer?: JsonPointer): Set<OrgMembership> => {
      const memberOfArr = fromJsonArray(fromJsonAny({object: orgMembershipFromJson, ifNull: 'throw'}))(json, pointer);
      return Set(memberOfArr);
    },
    ifNull: Set()
  }
});

