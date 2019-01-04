import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {AppHeaderComponent} from './header/header.component';
import {AppFooterComponent} from './footer/footer.component';
import {UserModule} from '../../user/user.module';
import {NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgbDropdownModule,
    UserModule
  ],
  declarations: [
    AppHeaderComponent,
    AppFooterComponent
  ],
  exports: [
    AppHeaderComponent,
    AppFooterComponent
  ]
})
export class ContainerModule {}
