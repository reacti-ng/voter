import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserLoginPageComponent} from './login-page.component';
import {RouterModule} from '@angular/router';
import {loginRoutes} from './login.routes';
import {ReactiveFormsModule} from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(loginRoutes)
  ],
  declarations: [
    UserLoginPageComponent
  ]
})
export class UserLoginFeatureModule {}
