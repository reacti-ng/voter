import {List, Set} from 'immutable';
import {JsonPointer} from 'json-pointer';

import {JsonArray} from '../common/json/json.model';
import {fromJsonAny, fromJsonArray, fromObjectProperties} from '../common/json/decoder';
import {listFromJson} from '../common/json/collections';


export interface UserProposal {
  readonly id: string;
  readonly code: string;
  readonly description: string;
}

export const userProposalFromJson = fromObjectProperties<UserProposal>({
  id: {string: true, ifNull: 'throw'},
  code: {string: true, ifNull: 'throw'},
  description: {string: true, ifNull: 'throw'},
});

export interface MemberOfOrg {
  readonly orgId: string;
  readonly orgName: string;

  readonly createdProposals: List<UserProposal>;
}

export const memberOfOrgFromJson = fromObjectProperties<MemberOfOrg>({
  orgId: {string: true, ifNull: 'throw', source: 'org_id'},
  orgName: {string: true, ifNull: 'throw', source: 'org_name'},
  createdProposals: {
    source: 'created_proposals',
    array: listFromJson({object: userProposalFromJson, ifNull: 'throw'}),
    ifNull: 'throw'
  }
});

export interface User {
  readonly id: string;
  readonly name: string;
  readonly avatarHref: string;

  readonly memberOf: Set<MemberOfOrg>;
}

export const userFromJson = fromObjectProperties<User>({
  id:  {string: true, ifNull: 'throw'},
  name: {string: true, ifNull: 'throw'},
  avatarHref: {string: true, ifNull: null, source: 'avatar_href'},
  memberOf: {
    source: 'member_of',
    array: (json: JsonArray, pointer?: JsonPointer) => {
      const memberOfArr = fromJsonArray(fromJsonAny({object: memberOfOrgFromJson, ifNull: 'throw'}))(json, pointer);
      return Set(memberOfArr);
    },
    ifNull: Set()
  }
});

