import { IBase } from '../base/base';

export interface IAssetsResource extends IBase {
  resource_url: string;
  resource_string?: string;
}

export interface ISoundResource extends IAssetsResource {
  progress: number,
  duration: number,
  currentTime: string,
  durationTime: string
}
