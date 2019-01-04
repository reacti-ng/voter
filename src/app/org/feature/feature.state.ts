import {createFeatureSelector, createSelector, Selector} from '@ngrx/store';
import {OrgState} from '../org.state';
import {Org} from '../org.model';
import {OrgFeatureAction, SET_DETAIL_ORG, SET_MEMBERSHIP_PAGE_RESULTS} from './feature.actions';
import {List} from 'immutable';
import {OrgMembership} from '../membership/membership.model';


export interface OrgFeatureState {
  readonly detailId: string | undefined;

  readonly membershipPageResults: List<OrgMembership>;
}

const initial: OrgFeatureState = {
  detailId: undefined,
  membershipPageResults: List<OrgMembership>()
};

export const selectOrgFeatureState = createFeatureSelector<OrgFeatureState>('org.feature');
export const selectDetailId: Selector<object, string | undefined> = createSelector(
  selectOrgFeatureState,
  (state) => state.detailId
);

export const selectDetailOrg: Selector<object, Org | undefined> = createSelector(
  OrgState.fromRoot,
  selectOrgFeatureState,
  ({entities}: OrgState, {detailId}: OrgFeatureState) => detailId ? entities[detailId] : undefined
);

export const selectMembershipPageResults = createSelector(
  selectOrgFeatureState,
  (feature) => feature.membershipPageResults
);

export function reduceOrgFeatureState(state = initial, action: OrgFeatureAction): OrgFeatureState {
  switch (action.type) {
    case SET_DETAIL_ORG:
      return {...state, detailId: action.org && action.org.id};
    case SET_MEMBERSHIP_PAGE_RESULTS:
      return {...state, membershipPageResults: action.results };
    default:
      return state;
  }
}
