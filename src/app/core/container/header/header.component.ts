import {Component} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {UserState} from '../../../user/user.state';
import {Observable} from 'rxjs';
import {User} from '../../../user/user.model';
import {AuthService} from '../../../common/auth/auth.service';
import {tap} from 'rxjs/operators';


@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss']
})
export class AppHeaderComponent {
  constructor(
    readonly store: Store<object>,
    readonly authService: AuthService<any>
  ) {}


  readonly loginUser$: Observable<User | undefined> = this.store.pipe(
    select(UserState.selectLoginUser)
  );

  private _ = this.loginUser$.subscribe((loginUser) => console.log('login user', loginUser));

  navigateToLogin() {
    // Temporarily redirect everyone to /org/activity. Thats where initial work is going
    this.authService.setLoginRedirect(['/home'], {app: 'org'});
    this.authService.beginAuthCodeGrantFlow().subscribe((request) => {
      console.log('request', request);
    });
  }

  logoutUser() {
    this.authService.logout();
  }
}
