import {Org} from './org.model';
import {createEntityAdapter, Dictionary, EntityState} from '@ngrx/entity';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {ADD_ORG, ADD_ORGS, OrgAction} from './org.actions';
import {List} from 'immutable';


export interface OrgState extends EntityState<Org> {
  searchCandidates: List<Org>;
  currentId: string;
}

const orgStateAdaptor = createEntityAdapter<Org>();
const initialOrgState = orgStateAdaptor.getInitialState();

export const OrgState = {
  fromRoot: createFeatureSelector<OrgState>('features.org'),
  ...orgStateAdaptor.getSelectors(),

  current: createSelector(
    orgStateAdaptor.getSelectors().selectEntities,
    (orgState: OrgState) => orgState.currentId,
    (entities: Dictionary<Org>, currentId: string) => currentId && entities[currentId] || undefined
  ),
};

export function orgStateReducer(orgState = initialOrgState, action: OrgAction) {
  switch (action.type) {
    case ADD_ORG:
      return orgStateAdaptor.addOne(action.org, orgState);

    case ADD_ORGS:
      return orgStateAdaptor.addAll(action.orgs.toArray(), orgState);

  }
}
