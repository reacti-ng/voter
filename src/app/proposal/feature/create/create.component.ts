import {Component} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Set} from 'immutable';
import {ProposalService} from '../../proposal.service';
import {Observable} from 'rxjs';
import {ProposalCreateRequest} from '../../proposal.model';

@Component({
  selector: 'app-proposal-create',
  templateUrl: './create.component.html'
})
export class ProposalCreateComponent {
  readonly formGroup = new FormGroup({
    orgs: new FormControl(Set()),
    description: new FormControl(''),
  });

  constructor(
    readonly proposalService: ProposalService
  ) {}

  create(): Observable<any> {
    return this.proposalService.create(this.formGroup.value as ProposalCreateRequest);
  }
}
