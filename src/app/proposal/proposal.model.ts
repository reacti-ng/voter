import {List, Set} from 'immutable';
import {JsonPointer} from 'json-pointer';

import {ModelRef, modelRefFromJson, modelRefToJson} from '../common/model/model-ref.model';
import {dateTimeFromJson} from '../common/date/date-time.model';
import {fromJsonAny, fromJsonArray, fromJsonObject} from '../common/json/decoder';
import {JsonArray, JsonObject} from '../common/json/json.model';

import {User, userFromJson} from '../user/user.model';
import {Org, orgFromJson} from '../org/org.model';

export interface Proposal {
  readonly id: string;
  readonly orgs: Set<ModelRef<Org>>;
  readonly proposedAt: Date;
  readonly voteAt: Date;
  readonly countAt: Date;

  readonly description: string;
  readonly by: ModelRef<User>;

  readonly nominees: List<ModelRef<User>>;
  readonly isNominated: boolean;
}


const nomineesFromJson = fromJsonAny<List<ModelRef<User>>>({

});

export const proposalFromJson = fromJsonObject<Proposal>({
  id: {string: true, ifNull: 'throw'},
  orgs: {
    source: 'groups',
    array: (json: JsonArray, pointer?: JsonPointer) => {
      const groupArr = fromJsonArray(modelRefFromJson(orgFromJson))(json, pointer);
      return Set(groupArr);
    },
    ifNull: Set<Org>(),
  },
  by: {
    object: modelRefFromJson(userFromJson),
    ifNull: 'throw'
  },
  nominees: {
    array: (json: JsonArray, pointer?: JsonPointer) => {
      const groupArr = fromJsonArray(modelRefFromJson(userFromJson))(json, pointer);
      return List(groupArr);
    },
    ifNull: List()
  },
  isNominated: {
    source: 'nominees',
    array: (arr: JsonArray) => arr.length > 1
  },
  voteAt: {
    source: 'vote_at',
    string: dateTimeFromJson,
    ifNull: 'throw'
  },
  proposedAt: {
    source: 'proposed_at',
    string: dateTimeFromJson,
    ifNull: 'throw'
  },
  countAt: {
    string: dateTimeFromJson,
    ifNull: 'throw'
  },
  description: {
    string: true,
    ifNull: 'throw'
  }
});

function proposalToJson(proposal: Partial<Proposal>): JsonObject {
  return {
    id: proposal.id || null,
    groups: (proposal.orgs || Set()).map((group) => modelRefToJson()(group)),
    proposedAt: proposal.proposedAt && proposal.proposedAt.toISOString() || null,
    voteAt: proposal.voteAt && proposal.voteAt.toISOString() || null,
    countAt: proposal.countAt && proposal.countAt.toISOString() || null,
    description: proposal.description || null,

    by: proposal.by && modelRefToJson()(proposal.by) || null,
    nominees: (proposal.nominees && proposal.nominees.map(nominee => modelRefToJson()(nominee))) || null
  };
}

export const Proposal = {
  fromJson: proposalFromJson,
  toJson: proposalToJson
};

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


