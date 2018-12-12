import {NgModule} from '@angular/core';
import {UserService} from './user.service';
import {CommonModule} from '@angular/common';


@NgModule({
  imports: [
    CommonModule
  ]
})
export class UserModule {
  static forRoot() {
    return {
      ngModule: UserModule,
      providers: [
        UserService
      ]
    };
  }
}
