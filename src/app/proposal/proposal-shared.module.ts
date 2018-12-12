import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProposalService} from './proposal.service';
import {OrgSharedModule} from '../org/org-shared.module';


@NgModule({
  imports: [
    CommonModule,
    OrgSharedModule
  ],
  declarations: [],
  exports: []
})
export class ProposalSharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ProposalSharedModule,
      providers: [
        ProposalService
      ]
    };
  }
}
