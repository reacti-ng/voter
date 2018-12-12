import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {UserService} from './user.service';
import {SET_AUTH_TOKEN, SetAuthToken} from '../common/auth/auth.actions';
import {concatMap, switchMap} from 'rxjs/operators';
import {SetLoginUserId, UpsertUser} from './user.actions';
import {concat, of} from 'rxjs';


@Injectable()
export class UserEffects {
  constructor(
    readonly action$: Actions,
    readonly userService: UserService
  ) {}


  @Effect()
  readonly setLoginUserOnGrantChange$ = this.action$.pipe(
    ofType<SetAuthToken>(SET_AUTH_TOKEN),
    switchMap(action => {
      if (action.token === undefined) {
        return [action, new SetLoginUserId(undefined)];
      }
      // The user is logged in, get access to the user
      const user$ = this.userService.getLoginUser();
      return concat(
        of(action),
        user$.pipe(concatMap(user => [new UpsertUser(user), new SetLoginUserId(user.id)]))
      );
    })
  );

}

