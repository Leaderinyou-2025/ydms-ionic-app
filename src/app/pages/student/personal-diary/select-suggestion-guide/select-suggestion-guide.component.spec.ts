import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectSuggestionGuideComponent } from './select-suggestion-guide.component';

describe('SelectSuggestionGuideComponent', () => {
  let component: SelectSuggestionGuideComponent;
  let fixture: ComponentFixture<SelectSuggestionGuideComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectSuggestionGuideComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectSuggestionGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
