import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import {RouterTestingModule} from '@angular/router/testing';
import {CommonModule} from '@angular/common';
import {ContainerModule} from './core/container/container.module';
import {StoreModule} from '@ngrx/store';
import {AuthService} from './common/auth/auth.service';
import {Injectable} from '@angular/core';

@Injectable()
class MockAuthService {
}

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        StoreModule.forRoot({ }),
        RouterTestingModule,
        ContainerModule
      ],
      declarations: [
        AppComponent,
      ],
      providers: [
        {provide: AuthService, useClass: MockAuthService}
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'voter'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('voter');
  });
});
