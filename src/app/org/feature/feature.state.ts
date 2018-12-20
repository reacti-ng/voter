import {createFeatureSelector, createSelector, Selector} from '@ngrx/store';
import {OrgState} from '../org.state';
import {Org} from '../org.model';
import {OrgFeatureAction, SET_DETAIL_ORG} from './feature.actions';


export interface OrgFeatureState {
  readonly detailId: string | undefined;
}

const initial: OrgFeatureState = {
  detailId: undefined
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

export function reduceOrgFeatureState(state = initial, action: OrgFeatureAction): OrgFeatureState {
  switch (action.type) {
    case SET_DETAIL_ORG:
      return {...state, detailId: action.org && action.org.id};
    default:
      return state;
  }

}
