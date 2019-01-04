import {List, Set} from 'immutable';
import {JsonPointer} from 'json-pointer';

import {ModelRef, modelRefFromJson, modelRefToJson} from '../common/model/model-ref.model';
import {DateTime, dateTimeFromJson} from '../common/date/date-time.model';
import {fromJsonAny, fromJsonArray, fromObjectProperties, JsonDecoder} from '../common/json/decoder';
import {JsonArray, JsonObject} from '../common/json/json.model';

import {User, userFromJson} from '../user/user.model';
import {Org, orgFromJson} from '../org/org.model';

export interface Proposal {
  readonly id: string;
  readonly org: Org | string;
  readonly by: User | string;

  readonly createdAt: DateTime;

  readonly code: string;
  readonly description: string;

  readonly markdownContent: string;

  readonly previous: Proposal | string | null;
}

export const proposalFromJson: JsonDecoder<JsonObject, Proposal> = fromObjectProperties<Proposal>({
  id: {string: true, ifNull: 'throw'},
  org: {string: true, object: orgFromJson, ifNull: 'throw'},
  by: {string: true, object: userFromJson, ifNull: 'throw'},

  createdAt: {string: dateTimeFromJson, ifNull: 'throw', source: 'created_at'},
  code: {string: true, ifNull: 'throw'},
  description: {string: true, ifNull: 'throw'},

  markdownContent: {string: true, ifNull: 'throw', source: 'content_md'},
  previous: {string: true, object: (obj, pointer) => proposalFromJson(obj, pointer), ifNull: 'throw'}
});


export interface ProposalCreateRequest {
  orgs: Set<ModelRef<Org>>;
  description: string;
  voteAt: Date | null;
  countAt: Date | null;
}

export const ProposalCreateRequest = {
  toJson: function (createRequest: ProposalCreateRequest): JsonObject {
    return {
      orgs: createRequest.orgs.map(modelRefToJson()).toArray(),
      description: createRequest.description,
      voteAt: createRequest.voteAt && createRequest.voteAt.toISOString()
    };
  }
};


