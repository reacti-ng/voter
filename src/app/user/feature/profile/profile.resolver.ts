import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable, timer} from 'rxjs';
import {UserService} from '../../user.service';
import {mapTo, switchMapTo, tap} from 'rxjs/operators';
import {SetProfileUser} from './profile.action';
import {Store} from '@ngrx/store';
import {List} from 'immutable';


@Injectable()
export class UserProfileResolver implements CanActivate {

  constructor(
    readonly store: Store<object>,
    readonly userService: UserService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const userId = route.paramMap.get('user');
    if (userId == null) {
      throw new Error(`:user param was null`);
    }

    return this.userService.fetch(userId).pipe(
      tap((user) => this.store.dispatch(new SetProfileUser(user))),
      mapTo(true)
    );
  }
}
