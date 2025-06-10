import { DatePipe, formatDate } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Device } from '@capacitor/device';
import { TranslateService } from '@ngx-translate/core';

import { IBase } from '../interfaces/base/base';
import { environment } from '../../../environments/environment';
import { IAssetsResource } from '../interfaces/settings/assets-resource';
import { AssetResourceCategory } from '../enums/asset-resource-category';
import { SoundKeys } from '../enums/sound-keys';
import { TranslateKeys } from '../enums/translate-keys';

export class CommonConstants {

  constructor(
    private translate: TranslateService
  ) {
  }

  /**
   * Device ID
   */
  public static deviceId: string = '';

  /**
   * Default avatar image
   */
  public static defaultUserAvatarImage: string = '/assets/icons/svg/avatar.svg';
  public static defaultBadgeImage: string = '/assets/images/badges/default-badge.png';

  /**
   * Background image gallery
   */
  public static background_images: Array<IAssetsResource> = [
    {
      id: 1,
      resource_url: 'assets/images/background/pexels-eugene-golovesov-1810803-30980499.jpg',
      name: 'Nụ thường xuân'
    },
    {id: 2, resource_url: 'assets/images/background/beach-5234306_1920.jpg', name: 'Biển Đông'},
    {id: 3, resource_url: 'assets/images/background/bananas-7840213_1920.jpg', name: 'Chuối vườn nhà'},
    {id: 4, resource_url: 'assets/images/background/santa-claus-6845491_1920.jpg', name: 'Ông già Noel'},
    {id: 5, resource_url: 'assets/images/background/city-7629244_1920.jpg', name: 'Thành phố phồn hoa'},
    {id: 6, resource_url: 'assets/images/background/pexels-rahulp9800-1212487.jpg', name: 'Cúc họa mi'},
  ];

  /**
   * Background sound gallery
   */
  public static sound_gallery: Array<IAssetsResource> = [
    {
      id: 1,
      resource_url: 'assets/sounds/touch.mp3',
      name: 'touch',
      category: AssetResourceCategory.EFFECT,
      key: SoundKeys.TOUCH
    },
    {
      id: 2,
      resource_url: 'assets/sounds/reload.mp3',
      name: 'reload',
      category: AssetResourceCategory.EFFECT,
      key: SoundKeys.RELOAD
    },
    {
      id: 3,
      resource_url: 'assets/sounds/loading.mp3',
      name: 'loading',
      category: AssetResourceCategory.EFFECT,
      key: SoundKeys.LOADING
    },
    {
      id: 4,
      resource_url: 'assets/sounds/message.mp3',
      name: 'message',
      category: AssetResourceCategory.EFFECT,
      key: SoundKeys.MESSAGE
    },
    {
      id: 5,
      resource_url: 'assets/sounds/notification.mp3',
      name: 'notification',
      category: AssetResourceCategory.EFFECT,
      key: SoundKeys.NOTIFICATION
    },
    {
      id: 6,
      resource_url: 'assets/sounds/success.mp3',
      name: 'success',
      category: AssetResourceCategory.EFFECT,
      key: SoundKeys.SUCCESS
    },
    {
      id: 7,
      resource_url: 'assets/sounds/fail.mp3',
      name: 'success',
      category: AssetResourceCategory.EFFECT,
      key: SoundKeys.FAILED
    },
    {
      id: 8,
      resource_url: 'assets/sounds/error.mp3',
      name: 'error',
      category: AssetResourceCategory.EFFECT,
      key: SoundKeys.ERROR
    },
    {
      id: 9,
      resource_url: 'assets/sounds/background-default.mp3',
      name: 'Cuộc sống tươi đẹp',
      category: AssetResourceCategory.BACKGROUND
    },
    {
      id: 10,
      resource_url: 'assets/sounds/background-music-soft-calm.mp3',
      name: 'Lạc quan mới',
      category: AssetResourceCategory.BACKGROUND
    },
    {
      id: 11,
      resource_url: 'assets/sounds/background-music-soft-corporate.mp3',
      name: 'Nhịp điệu ngày mới',
      category: AssetResourceCategory.BACKGROUND
    },
  ];

  /**
   * Prefixes for base64 image formats
   */
  public static IMAGE_PNG_BASE64_PREFIX = 'data:image/png;base64,';
  public static IMAGE_JPEG_BASE64_PREFIX = 'data:image/jpeg;base64,';
  public static IMAGE_GIF_BASE64_PREFIX = 'data:image/gif;base64,';
  public static IMAGE_WEBP_BASE64_PREFIX = 'data:image/webp;base64,';
  public static IMAGE_BMP_BASE64_PREFIX = 'data:image/bmp;base64,';
  public static IMAGE_SVG_BASE64_PREFIX = 'data:image/svg+xml;base64,';
  public static IMAGE_ICO_BASE64_PREFIX = 'data:image/x-icon;base64,';

  public static signaturesMineTypes: { [key: string]: string } = {
    iVBORw0KGgo: CommonConstants.IMAGE_PNG_BASE64_PREFIX, // PNG
    '/9j/': CommonConstants.IMAGE_JPEG_BASE64_PREFIX, // JPEG
    R0lGODlh: CommonConstants.IMAGE_GIF_BASE64_PREFIX, // GIF (GIF89a)
    R0lGODdh: CommonConstants.IMAGE_GIF_BASE64_PREFIX, // GIF (GIF87a)
    UklGR: CommonConstants.IMAGE_WEBP_BASE64_PREFIX, // WebP
    Qk1: CommonConstants.IMAGE_BMP_BASE64_PREFIX, // BMP
    AAAB: CommonConstants.IMAGE_ICO_BASE64_PREFIX, // ICO
    PD94: CommonConstants.IMAGE_SVG_BASE64_PREFIX, // SVG (<?xml)
    PHN2Zy: CommonConstants.IMAGE_SVG_BASE64_PREFIX // SVG (<svg)
  };

  public static detectMimeType(b64: string): string | undefined {
    for (let key in CommonConstants.signaturesMineTypes) {
      if (b64.indexOf(key) === 0) {
        return CommonConstants.signaturesMineTypes[key];
      }
    }
    return undefined;
  }

  public static formatBase64ImageUrl(
    b64Resource: string,
    defaultImage: string = CommonConstants.defaultUserAvatarImage
  ): string {
    const mimeType = CommonConstants.detectMimeType(b64Resource);
    if (!mimeType) return defaultImage || CommonConstants.defaultUserAvatarImage;
    return `${mimeType}${b64Resource}`;
  }

  /**
   * Load device identifier
   */
  public static async loadDeviceId(): Promise<void> {
    if (CommonConstants.deviceId?.length > 0) return;
    const deviceId = await Device.getId();
    CommonConstants.deviceId = deviceId.identifier;
  }

  /**
   * Url of language flag images
   */
  public static languageFlagImageUrls = {
    vn: '/assets/icons/flags/vn-flag.png',
    en: '/assets/icons/flags/en-flag.png'
  };

  /**
   * Return random hex code color
   */
  public static randomHexColor(): string {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return '#' + randomColor;
  }

  /**
   * Convert Vietnamese char to English char
   * @param str
   */
  public static normalize(str: string) {
    if (!str) return;
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }

  /**
   * Validate a string is url
   * @param str
   */
  public static validURL(str: string): boolean {
    let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return pattern.test(str);
  }

  /**
   * Merge 2 arrays object by id
   * @param oldArrObj
   * @param newArrObj
   */
  public static mergeArrayObjectById<T extends IBase>(oldArrObj: Array<T>, newArrObj: Array<T>): Array<T> | undefined {
    if (!oldArrObj || oldArrObj?.length == 0) return newArrObj;

    if (!newArrObj || newArrObj?.length == 0) return oldArrObj;

    const objsFiltered = oldArrObj.filter((el) => {
      return !newArrObj.find(u => u.id == el.id);
    });

    if (!objsFiltered || objsFiltered?.length == 0) return newArrObj;

    return newArrObj.concat(objsFiltered || []);
  }

  /**
   * Convert related field form array to object
   * member_id: [1, 'Member 1'] --> member_id: {id: 1, name: 'Member 1'}
   * @param data
   */
  public static convertArr2ListItem(data: Array<any>): Array<any> {
    const result = data?.length ? [...data] : [];
    let datePipe = new DatePipe('vi-VN');

    for (let item of result) {
      for (let key in item) {
        if (item[key] == false || item[key] == 'false' || item[key] == 'False') {
          item[key] = key.includes('_ids') ? [] : null;
          continue;
        }

        if (typeof item[key]?.[0] == 'number' && typeof item[key]?.[1] == 'string') {
          item[key] = {id: item[key][0], name: item[key][1]};
          continue;
        }

        // Format create_date and write_date, make create_time and write_time
        if (key == 'create_date' || key == 'write_date') {
          let time = datePipe.transform(((item[key].replace(' ', 'T')) + '.000Z'), 'HH:mm');
          item[key] = datePipe.transform(((item[key].replace(' ', 'T')) + '.000Z'), 'yyyy-MM-dd');
          item[key.replace('date', 'time')] = time;
        }
      }
    }
    return result;
  }

  /**
   * Convert related field form object to id (number)
   * member_id: {id: 1, name: 'Member 1'} -> member_id: 1
   * @param data
   */
  public static convertListItem2Number<T>(data: any): T {
    const result = {...data};

    for (let key in result) {
      if (typeof result[key] == 'object' && result[key]?.id && result[key]?.name) result[key] = +result[key]?.id;
      if (typeof result[key] == 'object' && result[key]?.id === null && result[key]?.name === null) result[key] = null;
      // Clean timestamp
      if (key == 'create_date' || key == 'create_time' || key == 'write_date' || key == 'write_time') delete result[key];
    }
    return result;
  }

  /**
   * Return the default request headers
   */
  public static getRequestHeader(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    });
  };

  /**
   * Custom format number
   * @param value
   * @param decimalSeparator
   * @param thousandsSeparator
   */
  public static formatNumber(value: string, decimalSeparator: string = '.', thousandsSeparator: string = ' '): string | undefined {

    let sign: -1 | 1;
    if (value[0] === '-') {
      sign = -1;
    } else {
      sign = 1;
    }

    // Loại bỏ các ký tự không phải số (trừ dấu chấm hoặc dấu phẩy)
    value = value.replace(/(?!^)[^\d.,]/g, '');
    value = value.replaceAll(thousandsSeparator, '');

    if (decimalSeparator !== '.') value = value.replace(decimalSeparator, '.');
    value = value.replace(',', '.');

    // Tách phần nguyên và phần thập phân (nếu có)
    const [integerPart, decimalPart] = value.split(decimalSeparator);

    // Định dạng phần nguyên với dấu phân cách hàng nghìn
    let formattedInteger = '';
    for (let i = integerPart.length - 1, count = 0; i >= 0; i--, count++) {
      formattedInteger = integerPart.charAt(i) + formattedInteger;
      if (count % 3 === 2 && i > 0) {
        formattedInteger = thousandsSeparator + formattedInteger;
      }
    }

    // Kết hợp lại phần nguyên và phần thập phân (nếu có)
    let formattedValue = formattedInteger;
    if (decimalPart !== undefined) {
      formattedValue += decimalSeparator + decimalPart;
    }

    if (!formattedValue) return;

    return (sign === -1 ? '-' : '') + formattedValue;
  }

  /**
   * Return the random string with dynamic length
   * @param length
   */
  public static randomString(length: number) {
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
  }

  /**
   * Get file mime type form extension
   * @param extension
   */
  public static getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
      csv: 'text/csv',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      bmp: 'image/bmp',
      svg: 'image/svg+xml',
      webp: 'image/webp',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      wmv: 'video/x-ms-wmv',
      webm: 'video/webm',
      mkv: 'video/x-matroska',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg'
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Sinh key từ secret + salt sử dụng PBKDF2
   * @param secret Chuỗi nguyên liệu để sinh key (salt + deviceId)
   * @param salt Chuỗi salt hex
   * @returns CryptoKey dùng cho AES-GCM
   */
  private static async generateKey(secret: string, salt: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: this.hex2buf(salt),
        iterations: 1000,
        hash: 'SHA-256',
      },
      baseKey,
      {name: 'AES-GCM', length: 256},
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Mã hóa chuỗi text thành base64 an toàn
   * @param text Chuỗi cần mã hóa
   * @returns Chuỗi base64 chứa ct, iv, s
   */
  public static async encrypt(text: string): Promise<string> {
    await this.loadDeviceId();

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.generateKey(`${environment.salt}${this.deviceId}`, this.buf2hex(salt));

    const encodedText = new TextEncoder().encode(text);
    const cipherBuffer = await crypto.subtle.encrypt(
      {name: 'AES-GCM', iv},
      key,
      encodedText
    );

    const payload = {
      ct: this.buf2hex(new Uint8Array(cipherBuffer)),
      iv: this.buf2hex(iv),
      s: this.buf2hex(salt)
    };

    const jsonStr = JSON.stringify(payload);
    return btoa(jsonStr); // Trả về dạng base64 để lưu
  }

  /**
   * Giải mã chuỗi base64 được tạo bởi encrypt()
   * @param cipherTextBase64 Chuỗi base64 mã hóa
   * @returns Chuỗi gốc đã được giải mã
   */
  public static async decrypt(cipherTextBase64: string): Promise<string> {
    await this.loadDeviceId();

    const jsonStr = atob(cipherTextBase64);
    const json = JSON.parse(jsonStr);

    const iv = this.hex2buf(json.iv);
    const salt = json.s;
    const ciphertext = this.hex2buf(json.ct);

    const key = await this.generateKey(`${environment.salt}${this.deviceId}`, salt);

    const plainBuffer = await crypto.subtle.decrypt(
      {name: 'AES-GCM', iv},
      key,
      ciphertext
    );

    return new TextDecoder().decode(plainBuffer);
  }

  /**
   * Chuyển Uint8Array sang chuỗi hex
   */
  private static buf2hex(buffer: Uint8Array): string {
    return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Chuyển chuỗi hex về Uint8Array
   */
  private static hex2buf(hex: string): Uint8Array {
    return new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  }

  /**
   * Format seconds to time string
   * @param seconds
   */
  public static formatTimeSeconds(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  /**
   * Get day number of the month
   * @param month
   * @param year
   */
  public static getDaysInMonth(month?: number, year?: number): number {
    const current = new Date();
    return new Date(year || current.getFullYear(), month || (current.getMonth() + 1), 0).getDate();
  }

  /**
   * Get first date and last date in month, format to UTC string "yyyy-MM-dd HH:mm:ss"
   * @param month (1 - 12)
   * @param year
   */
  public static getFirstAndLastDateInMonth(month?: number, year?: number): { firstDate: string, lastDate: string } {
    const currentDate = new Date();
    const y = year || currentDate.getFullYear();
    const m = month ? (month - 1) : currentDate.getMonth();

    // Create local dates first
    const firstDay = new Date(y, m, 1, 0, 0, 0);
    const lastDay = new Date(y, m + 1, 0, 23, 59, 59);

    // Convert to UTC and format
    return {
      firstDate: CommonConstants.formatUTC(firstDay),
      lastDate: CommonConstants.formatUTC(lastDay),
    };
  }

  /**
   * Get random a number from 0 to n
   * @param n
   */
  public static randomInt(n: number): number {
    if (n >= 0) return Math.floor(Math.random() * n);
    return 0;
  }

  /**
   * Get current date formated yyyy-MM-dd
   */
  public static getCurrentDateFormated(): string {
    return formatDate(new Date(), 'yyyy-MM-dd', 'en').toString();
  }

  /**
   * Convert datetime to utc and formated (yyyy-MM-dd HH:mm:ss)
   * @param date
   */
  public static formatUTC(date: Date): string {
    const yyyy = date.getUTCFullYear();
    const MM = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    const dd = ('0' + date.getUTCDate()).slice(-2);
    const HH = ('0' + date.getUTCHours()).slice(-2);
    const mm = ('0' + date.getUTCMinutes()).slice(-2);
    const ss = ('0' + date.getUTCSeconds()).slice(-2);
    return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
  }

  /**
   * Chuyển base64 về Blob để tải xuống trên native
   * @param b64Data
   * @param contentType
   */
  public static b64toBlob(b64Data: string, contentType: string): Blob {
    contentType = contentType || '';
    let sliceSize = 512;
    let byteCharacters = atob(b64Data);
    let byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);

      let byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      let byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: contentType});
  }

  /**
   * Xoá html tags
   * @param text
   * @param maxLength
   */
  public static stripHtmlAndTruncate(
    text: string,
    maxLength: number = 360
  ): string {
    // Thay các thẻ block bằng dấu cách, xóa các thẻ khác
    const cleanText = text
      .replace(/<\/?(p|div|br|h[1-6]|li|ul|ol)>/gi, ' ') // Thêm dấu cách cho thẻ block
      .replace(/<[^>]*>/g, '') // Xóa các thẻ HTML còn lại
      .replace(/\s+/g, ' ') // Thay nhiều dấu cách/thẻ trắng bằng một dấu cách
      .trim();

    // Decode HTML entities
    const decodedText = cleanText
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, '\'');

    // Nếu chuỗi đã ngắn hơn maxLength, trả về nguyên vẹn
    if (decodedText.length <= maxLength) {
      return decodedText;
    }

    // Cắt chuỗi đến maxLength, không cắt giữa từ
    let truncated = decodedText.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > 0) {
      truncated = truncated.substring(0, lastSpaceIndex);
    }

    return truncated.trim() + '...';
  }

  /**
   * Weekday names
   */
  public get weekdays(): string[] {
    return [
      this.translate.instant(TranslateKeys.CALENDAR_SUNDAY_SHORT),
      this.translate.instant(TranslateKeys.CALENDAR_MONDAY_SHORT),
      this.translate.instant(TranslateKeys.CALENDAR_TUESDAY_SHORT),
      this.translate.instant(TranslateKeys.CALENDAR_WEDNESDAY_SHORT),
      this.translate.instant(TranslateKeys.CALENDAR_THURSDAY_SHORT),
      this.translate.instant(TranslateKeys.CALENDAR_FRIDAY_SHORT),
      this.translate.instant(TranslateKeys.CALENDAR_SATURDAY_SHORT),
    ];
  }

  /**
   * Month names
   */
  public get monthNames(): string[] {
    return [
      this.translate.instant(TranslateKeys.CALENDAR_JANUARY),
      this.translate.instant(TranslateKeys.CALENDAR_FEBRUARY),
      this.translate.instant(TranslateKeys.CALENDAR_MARCH),
      this.translate.instant(TranslateKeys.CALENDAR_APRIL),
      this.translate.instant(TranslateKeys.CALENDAR_MAY),
      this.translate.instant(TranslateKeys.CALENDAR_JUNE),
      this.translate.instant(TranslateKeys.CALENDAR_JULY),
      this.translate.instant(TranslateKeys.CALENDAR_AUGUST),
      this.translate.instant(TranslateKeys.CALENDAR_SEPTEMBER),
      this.translate.instant(TranslateKeys.CALENDAR_OCTOBER),
      this.translate.instant(TranslateKeys.CALENDAR_NOVEMBER),
      this.translate.instant(TranslateKeys.CALENDAR_DECEMBER),
    ];
  }
}
