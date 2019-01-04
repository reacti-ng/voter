import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AppUserProfileComponent} from './profile.component';
import {RouterModule} from '@angular/router';
import {UserProfileResolver} from './profile.resolver';
import {StoreModule} from '@ngrx/store';
import {initialUserProfileState, reduceUserProfileState} from './profile.state';
import {UserModule} from '../../user.module';


@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('user.feature.profile', reduceUserProfileState, {
      initialState: initialUserProfileState
    }),
    RouterModule.forChild([
      {
        path: ':user',
        component: AppUserProfileComponent,
        canActivate: [
          UserProfileResolver
        ]
      }
    ]),
    UserModule
  ],
  declarations: [
    AppUserProfileComponent
  ],
  providers: [
    UserProfileResolver
  ],
  exports: [
    AppUserProfileComponent
  ]
})
export class UserProfileFeatureModule {
}
