import {Component, ViewEncapsulation} from '@angular/core';
import {createSelector, select, Store} from '@ngrx/store';
import {UserState} from '../../../user/user.state';
import {Observable} from 'rxjs';
import {User} from '../../../user/user.model';
import {BeginAuthorizationCodeGrant} from '../../../common/auth/auth.actions';
import {AuthService} from '../../../common/auth/auth.service';
import {first} from 'rxjs/operators';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class AppHeaderComponent {
  constructor(
    readonly store: Store<any>,
    protected readonly authService: AuthService
  ) {}

  readonly loginUser$: Observable<User | undefined> = this.store.pipe(
    select(UserState.selectLoginUser)
  );

  navigateToLogin() {
    this.authService.login();
  }
}
