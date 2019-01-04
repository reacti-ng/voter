import {NgModule} from '@angular/core';
import {UserService} from './user.service';
import {CommonModule} from '@angular/common';
import {DEFAULT_AVATAR_HREF, UserAvatarComponent} from './avatar/avatar.component';

import {environment} from '../../environments/environment';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    UserAvatarComponent
  ],
  exports: [
    UserAvatarComponent
  ]
})
export class UserModule {
  static forRoot() {
    return {
      ngModule: UserModule,
      providers: [
        UserService,
        {provide: DEFAULT_AVATAR_HREF, useValue: environment.features.user.defaultAvatarHref}
      ]
    };
  }
}
