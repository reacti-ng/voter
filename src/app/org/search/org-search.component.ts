import {Set} from 'immutable';
import {Component, Inject, OnDestroy} from '@angular/core';
import {OrgService} from '../org.service';
import {ControlRef} from '../../common/control/control-ref';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {debounceTime, shareReplay, switchMap, takeUntil} from 'rxjs/operators';
import {BehaviorSubject, Subject} from 'rxjs';
import {Org} from '../org.model';


@Component({
  selector: 'app-org-search',
  templateUrl: './org-search.component.html',
  styleUrls: [
    './org-search.component.scss'
  ]
})
export class OrgSearchComponent implements OnDestroy {
  readonly searchControl = new FormControl('');
  readonly selectedCandidatesSubject = new BehaviorSubject(Set());

  readonly candidates$ = this.searchControl.valueChanges.pipe(
    takeUntil(this.selectedCandidatesSubject),
    debounceTime(300),
    switchMap(value => this.orgService.fetchMany({params: {q: value}})),
    shareReplay(1)
  );
  readonly selectedCandidates$ = this.selectedCandidatesSubject.pipe();

  constructor(
    readonly controlRef: ControlRef<OrgSearchComponent, Set<Org>>,
    readonly orgService: OrgService
  ) {}

  ngOnDestroy() {
    this.selectedCandidatesSubject.complete();
  }

  commit() {
    this.controlRef.commit(this.selectedCandidatesSubject.value);
  }
}
