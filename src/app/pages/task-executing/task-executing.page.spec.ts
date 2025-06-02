import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskExecutingPage } from './task-executing.page';

describe('TaskExecutingPage', () => {
  let component: TaskExecutingPage;
  let fixture: ComponentFixture<TaskExecutingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskExecutingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
