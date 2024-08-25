import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateRecordComponentComponent } from './rate-record.component';

describe('RateRecordComponentComponent', () => {
  let component: RateRecordComponentComponent;
  let fixture: ComponentFixture<RateRecordComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateRecordComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RateRecordComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
