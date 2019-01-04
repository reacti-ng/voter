import {JsonPointer} from 'json-pointer';
import {fromObjectProperties} from '../../common/json/decoder';
import {JsonObject} from '../../common/json/json.model';
import {DateTime, dateTimeFromJson} from '../../common/date/date-time.model';
import {userFromJson} from '../../user/user.model';

export interface OrgMembership {
  readonly id: string;
  readonly user: {
    readonly id: string;
    readonly name: string;
    readonly avatarHref: string;
  };
  readonly createdAt: DateTime;
}


export function orgMembershipFromJson(json: JsonObject, pointer?: JsonPointer): OrgMembership {
  return fromObjectProperties<OrgMembership>({
    id        : {string: true, ifNull: 'throw'},
    user      : {object: userFromJson, ifNull: 'throw'},
    createdAt : {string: dateTimeFromJson, ifNull: 'throw', source: 'created_at'}
  })(json, pointer);
}

