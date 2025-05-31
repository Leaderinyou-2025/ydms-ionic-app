import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AlertEmotionCheckinComponent } from './alert-emotion-checkin.component';

describe('AlertEmotionCheckinComponent', () => {
  let component: AlertEmotionCheckinComponent;
  let fixture: ComponentFixture<AlertEmotionCheckinComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertEmotionCheckinComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertEmotionCheckinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
