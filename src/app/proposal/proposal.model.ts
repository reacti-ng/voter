import {List, Set} from 'immutable';
import {User} from '../user/user.model';

import {differenceInSeconds, parse as parseDate} from 'date-fns';
import {Org} from '../org/org.model';
import {ModelRef} from '../common/model/model-ref.model';
import {isJsonObject, JsonObject} from '../common/json/json.model';
import {isString, Mutable} from '../common/common.types';
import {DateTime} from '../common/date/date-time.model';

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

function proposalFromJson(json: JsonObject): Proposal {
  const result: Mutable<Proposal> = {};

  const {id, groups} = json;
  if (typeof id !== 'string') {
    throw new Error(`Object has no id: ${json}`);
  }
  result.id = id;
  if (Array.isArray(groups)) {
    result.orgs = Set(groups.map((group) => ModelRef.fromJson(Org.fromJson, group)));
  }

  const {by, nominees} = json;
  if (isString(by) || isJsonObject(by)) {
    result.by = ModelRef.fromJson(User.fromJson, by);
  }
  if (Array.isArray(nominees)) {
    result.nominees = List(nominees.map(nominee => ModelRef.fromJson(User.fromJson, nominee)));
  }

  const {voteAt, proposedAt, countAt} = json;
  if (isString(voteAt)) {
    result.voteAt = parseDate(voteAt);
  }
  if (isString(proposedAt)) {
    result.proposedAt = parseDate(proposedAt);
  }
  if (isString(countAt)) {
    result.countAt = parseDate(countAt);
  }

  const {description} = json;
  if (typeof description === 'string') {
    result.description = description;
  }

  return result as Proposal;
}

function proposalToJson(proposal: Partial<Proposal>): JsonObject {
  return {
    id: proposal.id || null,
    groups: (proposal.orgs || Set()).map((group) => ModelRef.toJson(group)),
    proposedAt: proposal.proposedAt && proposal.proposedAt.toISOString() || null,
    voteAt: proposal.voteAt && proposal.voteAt.toISOString() || null,
    countAt: proposal.countAt && proposal.countAt.toISOString() || null,
    description: proposal.description || null,

    by: proposal.by && ModelRef.toJson(proposal.by) || null,
    nominees: (proposal.nominees && proposal.nominees.map(nominee => ModelRef.toJson(nominee))) || null
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
      orgs: createRequest.orgs.map(ModelRef.toJson).toArray(),
      description: createRequest.description,
      voteAt: createRequest.voteAt && DateTime.toJson(createRequest.voteAt)
    };
  }
};

