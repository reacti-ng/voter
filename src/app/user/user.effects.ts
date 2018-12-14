import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {UserService} from './user.service';
import {SET_AUTH_TOKEN, SetAuthToken} from '../common/auth/auth.actions';
import {concatMap, filter, switchMap} from 'rxjs/operators';
import {SetLoginUserId, UpsertUser} from './user.actions';
import {concat, of} from 'rxjs';
import {AuthService} from '../common/auth/auth.service';


@Injectable()
export class UserEffects {
  constructor(
    readonly action$: Actions,
    readonly authService: AuthService<any>,
    readonly userService: UserService
  ) {}


  @Effect()
  readonly setLoginUserOnGrantChange$ = this.action$.pipe(
    ofType<SetAuthToken>(SET_AUTH_TOKEN),
    // Only apply to the default application
    filter(action => this.authService.appForKey(action.app) === this.authService.defaultApp),
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

