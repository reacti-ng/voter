import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {select, Store} from '@ngrx/store';
import {Org, orgFromJson} from './org.model';
import {Set} from 'immutable';
import {OrgState} from './org.state';
import {ModelService} from '../common/model/model.service';
import {CoreState} from '../core/core.state';
import {AddOrg, AddOrgs} from './org.actions';
import {PollService} from '../poll/poll.service';
import {PageNumberPagination, PaginatedResponseFactory} from '../common/pagination/pagination.service';
import {Observable} from 'rxjs';

@Injectable()
export class OrgService extends ModelService<Org> {
  protected readonly path = '/api/org';
  protected readonly fromJson = orgFromJson;
  protected readonly entityState$ = this.store.pipe(select(OrgState.fromRoot));

  constructor(
    http: HttpClient,
    pagination: PaginatedResponseFactory<Org>,
    readonly store: Store<CoreState & object>,
    readonly pollService: PollService
  ) {
    super(http, pagination);
  }

  getOrgMembers(destroy$: Observable<void>, org: Org): PageNumberPagination<Org> {
    return this.pagination.create(`/api/org/${org.id}/members`, destroy$, {
      paginationType: 'page-number',
      decodeResult: this.fromJson
    });
  }

  protected addEntity(org: Org) {
    this.store.dispatch(new AddOrg(org));
  }
  protected addManyEntities(entities: Set<Org>): void {
    this.store.dispatch(new AddOrgs(entities));
  }
}


