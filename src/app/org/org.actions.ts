import {Set} from 'immutable';
import {Org} from './org.model';
import {ModelRef} from '../common/model/model-ref.model';

export const RESOLVE_ORGS = 'features.org: resolve orgs';
export class ResolveOrgs {
  readonly type = RESOLVE_ORGS;

  constructor(readonly orgs: Set<ModelRef<Org>>) {}
}

export const ADD_ORG = 'features.org: add org';
export class AddOrg {
  readonly type = ADD_ORG;

  constructor(readonly org: Org) {}
}

export const ADD_ORGS = 'features.org: add orgs';
export class AddOrgs {
  readonly type = ADD_ORGS;

  constructor(readonly orgs: Set<Org>) {}
}

export const UPSERT_ORGS = 'features.org: upsert orgs';
export class UpsertOrgs {
  readonly type = UPSERT_ORGS;

  constructor(readonly orgs: Set<Org>) {}
}

export const SET_ORG_PAGE_SUBJECT = 'features.org: set page subject';
export class SetOrgPageSubject {
  readonly type = SET_ORG_PAGE_SUBJECT;
  constructor(readonly org: ModelRef<Org>) {}
}

export type OrgAction
  = AddOrg
  | AddOrgs
  | UpsertOrgs
  | ResolveOrgs
  | SetOrgPageSubject;
