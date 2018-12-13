import {Component} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {UserState} from '../../../user/user.state';
import {Observable} from 'rxjs';
import {User} from '../../../user/user.model';
import {AuthService} from '../../../common/auth/auth.service';


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
    this.authService.setLoginRedirectUri('/org/activity', {app: 'org'});
    this.authService.beginAuthCodeGrantFlow().subscribe((request) => {
      console.log('request', request);
    });
  }
}
