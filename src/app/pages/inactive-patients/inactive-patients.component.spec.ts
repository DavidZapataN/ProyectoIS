import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactivePatientsComponent } from './inactive-patients.component';

describe('InactivePatientsComponent', () => {
  let component: InactivePatientsComponent;
  let fixture: ComponentFixture<InactivePatientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactivePatientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactivePatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
