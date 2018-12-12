import {createEntityAdapter, EntityState} from '@ngrx/entity';
import {createFeatureSelector, Selector} from '@ngrx/store';
import {Proposal} from './proposal.model';
import {ProposalAction, UPSERT_PROPOSAL} from './proposal.actions';
import {InjectionToken} from '@angular/core';

export interface ProposalState extends EntityState<Proposal> {
}

const stateAdaptor = createEntityAdapter<Proposal>();
const initialProposalState = stateAdaptor.getInitialState({});


export function reduceProposalState(state = initialProposalState, action: ProposalAction) {
  switch (action.type) {
    case UPSERT_PROPOSAL:
      return stateAdaptor.upsertOne(action.proposal, state);
    default:
      return state;
  }
}

export const ProposalState = {
  fromRoot: createFeatureSelector<ProposalState>('features.proposal'),

  ...stateAdaptor.getSelectors()

};

