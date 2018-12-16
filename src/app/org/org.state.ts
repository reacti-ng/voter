import {Org} from './org.model';
import {createEntityAdapter, Dictionary, EntityState} from '@ngrx/entity';
import {Action, createFeatureSelector, createSelector} from '@ngrx/store';
import {ADD_ORG, ADD_ORGS, isOrgAction, OrgAction} from './org.actions';
import {List} from 'immutable';

export interface OrgState extends EntityState<Org> {
  searchCandidates: List<Org>;

  // The org of the current page, if the current page is a 'detail' page
  detailId: string | undefined;
}

export interface OrgDetailState {
  detailId: string | undefined;
}

const orgStateAdaptor = createEntityAdapter<Org>();
const initialOrgState: OrgState = orgStateAdaptor.getInitialState({
  searchCandidates: List(),
  detailId: undefined
});

export const OrgState = {
  fromRoot: createFeatureSelector<OrgState>('org'),
  ...orgStateAdaptor.getSelectors(),

  detail: (state: OrgState) => state.detailId && state.entities[state.detailId]
};

export function reduceOrgState(state = initialOrgState, action: Action): OrgState {
  if (!isOrgAction(action)) {
    return state;
  }
  switch (action.type) {
    case ADD_ORG:
      return orgStateAdaptor.addOne(action.org, state);
    case ADD_ORGS:
      return orgStateAdaptor.addAll(action.orgs.toArray(), state);
    default:
      return state;
  }
}
