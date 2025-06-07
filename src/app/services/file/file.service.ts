import { Injectable } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';

import { IFileData } from '../../shared/interfaces/function-data/file-data';
import { FileMimeType } from '../../shared/enums/file-mime-type';
import { CommonConstants } from '../../shared/classes/common-constants';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private platform: Platform,
    private loadingController: LoadingController,
  ) {
  }

  /**
   * Chọn file upload
   */
  public async selectFile(): Promise<IFileData | undefined> {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx';

      return new Promise((resolve) => {
        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) {
            resolve(undefined);
            return;
          }

          // Kiểm tra dung lượng
          if (file.size > 10_485_760) {
            resolve(undefined);
            return;
          }

          // Kiểm tra định dạng
          const allowedTypes = Object.values(FileMimeType);
          if (!allowedTypes.includes(file.type as FileMimeType)) {
            resolve(undefined);
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({base64, mimeType: file.type as FileMimeType, fileName: file.name});
          };
          reader.onerror = () => resolve(undefined);
          reader.readAsDataURL(file);
        };
        input.click();
      });
    } catch (error) {
      console.error('Error selecting file:', error);
      return;
    }
  }

  /**
   * Download file tử base64
   * @param fileData
   */
  public async downloadFile(fileData: IFileData): Promise<void> {
    if (!fileData.base64 || !fileData.mimeType || !fileData.fileName) {
      throw new Error('Invalid file data');
    }

    const {base64, mimeType, fileName} = fileData;

    if (!this.platform.is('mobileweb')) {
      // Mobile (Capacitor)
      const blob = CommonConstants.b64toBlob(base64, mimeType);
      const loading = await this.loadingController.create();
      await loading.present();

      try {
        const result = await Filesystem.writeFile({
          path: fileName,
          directory: Directory.Documents,
          data: base64
        });

        if (result.uri) {
          await FileOpener.open({filePath: result.uri, contentType: mimeType});
        }
      } finally {
        await loading.dismiss();
      }
    } else {
      // Web
      const mediaType = `data:${mimeType};base64,`;
      const a = document.createElement('a');
      a.href = mediaType + base64;
      a.download = fileName;
      a.textContent = 'Tải xuống tệp';
      a.click();
    }
  }
}
