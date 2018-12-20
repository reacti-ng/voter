import {Org} from '../org.model';


export const SET_DETAIL_ORG = 'org.feature: set detail org';
export class SetDetailOrg {
  readonly type = SET_DETAIL_ORG;
  constructor(readonly org: Org | undefined) {}
}

export type OrgFeatureAction = SetDetailOrg;
