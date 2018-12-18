import {Set} from 'immutable';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {select, Store} from '@ngrx/store';

import {ModelService} from '../common/model/model.service';
import {User, userFromJson} from './user.model';
import {CoreState} from '../core/core.state';
import {UserState} from './user.state';
import {AddManyUsers, AddUser, SetLoginUserId} from './user.actions';
import {PaginatedResponseFactory} from '../common/model/pagination.service';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {singleResponseFromJson} from '../common/model/http-response.model';


@Injectable()
export class UserService extends ModelService<User> {
  protected readonly path = '/api/user';
  protected readonly entityState$ = this.store.pipe(select(UserState.fromRoot));
  protected readonly fromJson = userFromJson;

  constructor(
    readonly http: HttpClient,
    readonly pagination: PaginatedResponseFactory<User>,
    readonly store: Store<CoreState>,
  ) {
    super(http, pagination);
  }

  addEntity(entity: User): void {
    this.store.dispatch(new AddUser(entity));

  }

  addManyEntities(entities: Set<User>): void {
    this.store.dispatch(new AddManyUsers(entities));
  }

  getLoginUser(): Observable<User> {
    return this.http.post('/api/user/implicit/', {}).pipe(
      singleResponseFromJson(this.fromJson)
    );
  }

}
