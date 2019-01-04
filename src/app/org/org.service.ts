import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {select, Store} from '@ngrx/store';
import {Org, orgFromJson} from './org.model';
import {Set} from 'immutable';
import {OrgState} from './org.state';
import {ModelService} from '../common/model/model.service';
import {CoreState} from '../core/core.state';
import {AddOrg, AddOrgs} from './org.actions';
import {PageNumberPagination, PaginatedResponseFactory} from '../common/pagination/pagination.service';
import {Observable} from 'rxjs';
import {OrgMembership, orgMembershipFromJson} from './membership/membership.model';

@Injectable()
export class OrgService extends ModelService<Org> {
  protected readonly path = '/api/org';
  protected readonly fromJson = orgFromJson;
  protected readonly entityState$ = this.store.pipe(select(OrgState.fromRoot));

  constructor(
    http: HttpClient,
    pagination: PaginatedResponseFactory,
    readonly store: Store<CoreState & object>,
  ) {
    super(http, pagination);
  }

  getOrgMembers(org: Org, options?: {notifier?: Observable<void>}): PageNumberPagination<OrgMembership> {
    return this.pagination.create(`/api/org/${org.id}/members`, {
      paginationType: 'page-number',
      decodeResult: orgMembershipFromJson,
      notifier: options && options.notifier
    });
  }

  protected addEntity(org: Org) {
    this.store.dispatch(new AddOrg(org));
  }
  protected addManyEntities(entities: Set<Org>): void {
    this.store.dispatch(new AddOrgs(entities));
  }
}


