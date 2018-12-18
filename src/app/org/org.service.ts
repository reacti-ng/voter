import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {select, Store} from '@ngrx/store';
import {Org, orgFromJson} from './org.model';
import {Set} from 'immutable';
import {OrgState} from './org.state';
import {ModelService} from '../common/model/model.service';
import {CoreState} from '../core/core.state';
import {AddOrg, AddOrgs} from './org.actions';
import {PollService} from '../poll/poll.service';
import {Poll} from '../poll/poll.model';
import {PageCursorPagination, PaginatedResponseFactory} from '../common/model/pagination.service';

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

  protected addEntity(org: Org) {
    this.store.dispatch(new AddOrg(org));
  }
  protected addManyEntities(entities: Set<Org>): void {
    this.store.dispatch(new AddOrgs(entities));
  }

  orgPollTimeline(org: Org): PageCursorPagination<Poll> {
    const params = new HttpParams({
        fromObject: {'org': org.id}
    });
    return this.pollService.timeline({params});
  }
}


