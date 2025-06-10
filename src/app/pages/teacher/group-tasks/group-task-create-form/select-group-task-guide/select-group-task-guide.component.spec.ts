import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectGroupTaskGuideComponent } from './select-group-task-guide.component';

describe('SelectGroupTaskGuideComponent', () => {
  let component: SelectGroupTaskGuideComponent;
  let fixture: ComponentFixture<SelectGroupTaskGuideComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectGroupTaskGuideComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectGroupTaskGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
