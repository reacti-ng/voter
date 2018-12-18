import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Ballot} from '../../ballot/ballot.model';


@Component({
  selector: 'app-poll-create',
  templateUrl: './create.component.html',
  styleUrls: [
    './create.component.scss'
  ]
})
export class PollCreateComponent {
  readonly form = new FormGroup({
    proposal: new FormControl(undefined, {
      validators: [Validators.nullValidator]
    })
  });


}
