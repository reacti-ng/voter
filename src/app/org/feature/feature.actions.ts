import {Org} from '../org.model';
import {List} from 'immutable';
import {OrgMembership} from '../membership/membership.model';


export const SET_DETAIL_ORG = 'org.feature: set detail org';
export class SetDetailOrg {
  readonly type = SET_DETAIL_ORG;
  constructor(readonly org: Org | undefined) {}
}

export const SET_MEMBERSHIP_PAGE_RESULTS = 'org.feature: set membership-page-results';
export class SetMembershipPageResults {
  readonly type = SET_MEMBERSHIP_PAGE_RESULTS;
  constructor(readonly results: List<OrgMembership>) {}
}

export type OrgFeatureAction = SetDetailOrg | SetMembershipPageResults;
