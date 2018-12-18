import {Component} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {UserState} from '../../../user/user.state';
import {Observable} from 'rxjs';
import {User} from '../../../user/user.model';
import {AuthService} from '../../../common/auth/auth.service';
import {tap} from 'rxjs/operators';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class AppHeaderComponent {
  constructor(
    readonly store: Store<object>,
    readonly authService: AuthService<any>
  ) {}

  readonly loginUser$: Observable<User | undefined> = this.store.pipe(
    select(UserState.selectLoginUser)
  );

  navigateToLogin() {
    // Temporarily redirect everyone to /org/activity. Thats where initial work is going
    this.authService.setLoginRedirect(['/org/e98f85dd-2244-45f7-88ec-9c03f1bf6196/activity'], {app: 'org'});
    this.authService.beginAuthCodeGrantFlow().subscribe((request) => {
      console.log('request', request);
    });
  }
}
