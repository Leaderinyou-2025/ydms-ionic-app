import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeenagerSharedEmotionPage } from './teenager-shared-emotion.page';

describe('TeenagerSharedEmotionPage', () => {
  let component: TeenagerSharedEmotionPage;
  let fixture: ComponentFixture<TeenagerSharedEmotionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TeenagerSharedEmotionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
