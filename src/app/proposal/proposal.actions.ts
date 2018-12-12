import {Set} from 'immutable';
import {Proposal} from './proposal.model';

export const ADD_PROPOSAL = 'features.proposal: add proposal';
export class AddProposal {
  readonly type = ADD_PROPOSAL;
  constructor(readonly proposal: Proposal) {}
}

export const ADD_MANY_PROPOSALS = 'features.proposal: add many proposals';
export class AddManyProposals {
  readonly type = ADD_MANY_PROPOSALS;
  constructor(readonly proposals: Set<Proposal>) {}
}

export const UPSERT_PROPOSAL = '[proposal] upsert proposal';
export class UpsertProposal {
  readonly type = UPSERT_PROPOSAL;
  constructor(readonly proposal: Proposal) {}
}

export type ProposalAction
  = AddProposal
  | AddManyProposals
  | UpsertProposal;

