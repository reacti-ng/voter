import {JsonPointer} from 'json-pointer';
import {CalendarDate, calendarDateFromJson} from '../../common/date/calendar-date.model';
import {fromJsonObject} from '../../common/json/decoder';
import {Org, orgFromJson} from '../org.model';
import {JsonObject} from '../../common/json/json.model';

export interface OrgMembership {
  readonly org: Org;
  created: CalendarDate;
}

export function orgMembershipFromJson(json: JsonObject, pointer?: JsonPointer): OrgMembership {
  return fromJsonObject<OrgMembership>({
    org: {string: true, object: orgFromJson, ifNull: 'throw'},
    created: {string: calendarDateFromJson, ifNull: 'throw'}
  })(json, pointer);
}

