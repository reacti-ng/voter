import {Component} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {selectProfileUser} from './profile.state';


@Component({
  selector: 'app-user-profile',
  templateUrl: 'profile.component.html',
  styleUrls: [
    'profile.component.scss'
  ]
})
export class AppUserProfileComponent {
  constructor(
      readonly store: Store<object>
  ) {}

  readonly profileUser$ = this.store.pipe(
    select(selectProfileUser)
  );
}
