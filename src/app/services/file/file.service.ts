import { Injectable } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { FilePicker } from '@capawesome/capacitor-file-picker';

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
      // Trường hợp chạy trong ứng dụng Capacitor (iOS/Android)
      if (this.platform.is('capacitor')) {
        const result = await FilePicker.pickFiles({
          types: [
            FileMimeType.PDF,
            FileMimeType.DOC,
            FileMimeType.DOCX,
            FileMimeType.XLS,
            FileMimeType.XLSX,
            FileMimeType.PPT,
            FileMimeType.PPTX
          ],
          limit: 1,
          readData: true
        });

        if (!result.files.length) return;

        const file = result.files[0];

        // Kiểm tra dung lượng (base64 dài hơn khoảng 1.37 lần binary)
        const estimatedSize = (file.data?.length ?? 0) * 3 / 4;
        if (estimatedSize > 10 * 1024 * 1024) return;

        return {
          base64: file.data ?? '',
          mimeType: file.mimeType as FileMimeType,
          fileName: file.name
        };
      }

      // Trường hợp PWA / Web
      return await new Promise<IFileData | undefined>((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx';

        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) return resolve(undefined);

          if (file.size > 10 * 1024 * 1024) return resolve(undefined);

          const allowedTypes = Object.values(FileMimeType);
          if (!allowedTypes.includes(file.type as FileMimeType)) return resolve(undefined);

          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({
              base64,
              mimeType: file.type as FileMimeType,
              fileName: file.name
            });
          };
          reader.onerror = () => resolve(undefined);
          reader.readAsDataURL(file);
        };

        input.click();
      });
    } catch (error) {
      console.error('selectFile error:', error);
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

    // Mobile (Capacitor)
    if (!this.platform.is('mobileweb')) {
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
