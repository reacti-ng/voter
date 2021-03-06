import {Set} from 'immutable';

import {Injectable} from '@angular/core';
import {ModelService} from '../common/model/model.service';
import {Poll, pollFromJson} from './poll.model';
import {select, Store} from '@ngrx/store';
import {HttpClient} from '@angular/common/http';
import {AddManyPolls, AddPoll} from './poll.action';
import {PaginatedResponseFactory} from '../common/pagination/pagination.service';
import {PollState} from './poll.state';

@Injectable()
export class PollService extends ModelService<Poll> {
  protected readonly path = '/api/poll';
  protected readonly entityState$ = this.store.pipe(select(PollState.fromRoot));
  protected readonly fromJson = pollFromJson;

  constructor(
    http: HttpClient,
    pagination: PaginatedResponseFactory,
    readonly store: Store<object>) {
    super(http, pagination);
  }

  protected addEntity(entity: Poll): void {
    this.store.dispatch(new AddPoll(entity));
  }

  protected addManyEntities(entities: Set<Poll>): void {
    this.store.dispatch(new AddManyPolls(entities));
  }


}

