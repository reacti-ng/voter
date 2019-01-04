import {Component} from '@angular/core';
import {UserService} from '../../user.service';
import {Store} from '@ngrx/store';
import {UserState} from '../../user.state';


@Component({
  selector: 'app-user-home',
  templateUrl: 'home.component.html'
})
export class UserHomeComponent {
  readonly loginUser$ = this.store.select(UserState.selectLoginUser);
  constructor(readonly store: Store<object>) {
    this.loginUser$.subscribe(console.log);
  }



}
