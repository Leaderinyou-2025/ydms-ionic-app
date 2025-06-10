import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupTasksPage } from './group-tasks.page';

describe('GroupTasksPage', () => {
  let component: GroupTasksPage;
  let fixture: ComponentFixture<GroupTasksPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTasksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
