import { FileMimeType } from '../../enums/file-mime-type';

export interface IFileData {
  base64: string;
  mimeType: FileMimeType;
  fileName: string;
}
