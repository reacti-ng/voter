import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {PublicHeaderComponent} from './header/header.component';
import {publicRoutes} from './public.routes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(publicRoutes)
  ],
  declarations: [
    PublicHeaderComponent
  ]
})
export class PublicModule {}
