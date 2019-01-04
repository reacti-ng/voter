import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserHomeComponent} from './home.component';
import {RouterModule} from '@angular/router';
import {homeRoutes} from './home.routes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(homeRoutes),
  ],
  declarations: [
    UserHomeComponent
  ]
})
export class UserHomeFeatureModule {}
