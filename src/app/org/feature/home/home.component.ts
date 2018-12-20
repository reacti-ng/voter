import {Component, OnInit} from '@angular/core';
import {createSelector, select, Store} from '@ngrx/store';
import {OrgState} from '../../org.state';
import {filter} from 'rxjs/operators';
import {Org} from '../../org.model';
import {selectDetailOrg} from '../feature.state';

@Component({
  selector: 'app-org-home',
  templateUrl: './home.component.html',
  styleUrls: [
    './home.component.scss'
  ]
})
export class OrgHomeComponent implements OnInit {
  constructor(
    readonly store: Store<object>
  ) {}

  readonly detail$ = this.store.pipe(
    select(selectDetailOrg),
    filter((org): org is Org => org !== undefined)
  );

  ngOnInit() {
    console.log('init');
    this.detail$.subscribe(detail => {
      console.log('has detail', detail);
    });
  }

}
