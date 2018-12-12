import {NgModule} from '@angular/core';
import {PollSharedModule} from './poll-shared.module';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {pollRoutes} from './poll.routes';


@NgModule({
  imports: [
    CommonModule,
    PollSharedModule,
    RouterModule.forChild(pollRoutes)
  ],
  declarations: []
})
export class PollFeatureModule {
}
