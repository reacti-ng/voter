import {Component, ViewEncapsulation} from '@angular/core';


@Component({
  selector: 'app-header',
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand">Voter</a>
      <ng-content></ng-content>
    </nav>
  `
})
export class AppHeaderComponent {

}
