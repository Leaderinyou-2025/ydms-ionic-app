import { TaskStatus } from '../../enums/task-status';

export interface TaskProgressUpdate {
  task_percentage_result?: number;
  task_image_result?: string;
  task_text_result?: string;
  status?: TaskStatus;
}
