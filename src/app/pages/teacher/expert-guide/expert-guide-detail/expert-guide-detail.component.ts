import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { IHeaderAnimeImage } from '../../../../shared/interfaces/header/header';
import { ILiyYdmsGuide } from '../../../../shared/interfaces/models/liy.ydms.guide';
import { LiyYdmsGuideService } from '../../../../services/models/liy.ydms.guide.service';
import { AreaOfExpertise } from '../../../../shared/enums/area-of-expertise';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-expert-guide-detail',
  templateUrl: './expert-guide-detail.component.html',
  styleUrls: ['./expert-guide-detail.component.scss'],
  standalone: false,
})
export class ExpertGuideDetailComponent implements OnInit {

  // HTML Templates
  private static readonly VIDEO_EMBED_TEMPLATE = `
    <div class="video-embed-container mb-4">
      <iframe
        src="{{embedUrl}}"
        frameborder="0"
        allowfullscreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        class="w-full h-64 md:h-80 rounded-lg">
      </iframe>
    </div>
  `;

  private static readonly IMAGE_CONTAINER_TEMPLATE = `
    <div class="image-container my-4">
      <img{{beforeSrc}}{{fullImageUrl}}{{afterSrc}}
           class="max-w-full h-auto rounded-lg"
           loading="lazy"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
      <div class="image-error-fallback hidden p-4 border border-gray-300 rounded-lg text-center">
        <i class="fas fa-image text-4xl text-gray-400 mb-2"></i>
      </div>
    </div>
  `;



  isLoading: boolean = true;
  animeImage!: IHeaderAnimeImage;
  guideDetail?: ILiyYdmsGuide;
  sanitizedContent?: SafeHtml;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly AreaOfExpertise = AreaOfExpertise;

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private guideService: LiyYdmsGuideService,
    private sanitizer: DomSanitizer,
  ) {
  }

  async ngOnInit() {
    this.initHeader();
    await this.loadGuideDetail();
  }

  /**
   * Khởi tạo header
   */
  private initHeader(): void {
    this.animeImage = {
      name: 'expert-guide',
      imageUrl: '/assets/images/self-discovery-survey.png',
      width: '200px',
      height: 'auto',
      position: {
        position: 'absolute',
        right: '-50px',
        bottom: '-5px'
      }
    };
  }



  /**
   * Tải chi tiết hướng dẫn từ service
   */
  private async loadGuideDetail(): Promise<void> {
    const id = this.activeRoute.snapshot.paramMap.get('id');
    if (!id) {
      return this.navigateBack();
    }

    try {
      this.guideDetail = await this.guideService.getGuideById(+id);
      if (this.guideDetail?.guide_content) {
        const processedContent = this.processHtmlContent(this.guideDetail.guide_content);
        this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(processedContent);
      }
    } catch (error) {
      console.error('ERROR:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Quay lại danh sách hướng dẫn
   */
  private async navigateBack(): Promise<void> {
    await this.router.navigateByUrl(PageRoutes.EXPERT_GUIDE);
  }

  /**
   * Lấy tên danh mục
   */
  getCategoryNames(): string {
    if (!this.guideDetail?.category_ids || this.guideDetail.category_ids.length === 0) {
      return '';
    }
    return this.guideDetail.category_ids.map(cat => cat.name).join(', ');
  }

  /**
   * Lấy translation key cho area of expertise
   */
  getAreaOfExpertiseTranslationKey(): string {
    if (!this.guideDetail?.area_of_expertise) return '';

    switch (this.guideDetail.area_of_expertise) {
      case AreaOfExpertise.EMOTION:
        return TranslateKeys.AREA_OF_EXPERTISE_EMOTION;
      case AreaOfExpertise.CONFLICT:
        return TranslateKeys.AREA_OF_EXPERTISE_CONFLICT;
      case AreaOfExpertise.COMMUNICATION:
        return TranslateKeys.AREA_OF_EXPERTISE_COMMUNICATION;
      case AreaOfExpertise.DISCOVERY:
        return TranslateKeys.AREA_OF_EXPERTISE_DISCOVERY;
      default:
        return this.guideDetail.area_of_expertise;
    }
  }

  /**
   * Xử lý HTML content để convert video embeds và images
   */
  private processHtmlContent(content: string): string {
    if (!content) return '';

    let processedContent = this.processVideoEmbeds(content);

    processedContent = this.processImages(processedContent);

    return processedContent;
  }

  /**
   * Xử lý video embeds từ format data-embedded thành iframe
   */
  private processVideoEmbeds(content: string): string {
    const videoEmbedRegex = /<div\s+data-embedded="video"\s+data-embedded-props='([^']+)'><\/div>/g;

    return content.replace(videoEmbedRegex, (match, propsJson) => {
      try {
        const props = JSON.parse(propsJson);

        // Chỉ xử lý 4 platform chính: YouTube, Vimeo, Dailymotion, Youku
        if (props.platform && props.videoId) {
          const embedResult = this.createPlatformEmbed(props);
          return embedResult || match; // Nếu không tạo được embed thì trả về original
        }
      } catch (error) {
        console.error('Error parsing video embed props:', error);
      }

      return match; // Trả về original nếu không parse được
    });
  }

  /**
   * Tạo embed iframe cho các platform khác nhau
   */
  private createPlatformEmbed(props: any): string {
    const { platform, videoId, params = {} } = props;

    let embedUrl = '';
    let allowFullscreen = true;

    switch (platform.toLowerCase()) {
      case 'youtube':
        embedUrl = this.buildYouTubeUrl(videoId, params);
        break;
      case 'vimeo':
        embedUrl = this.buildVimeoUrl(videoId, params);
        break;
      case 'dailymotion':
        embedUrl = this.buildDailymotionUrl(videoId, params);
        break;
      case 'youku':
        embedUrl = this.buildYoukuUrl(videoId, params);
        break;
      default:
        console.warn(`Unsupported video platform: ${platform}`);
        return '';
    }

    if (!embedUrl) {
      return '';
    }

    return this.replaceTemplate(ExpertGuideDetailComponent.VIDEO_EMBED_TEMPLATE, {
      embedUrl
    });
  }

  /**
   * Tạo YouTube embed URL
   */
  private buildYouTubeUrl(videoId: string, params: any): string {
    const paramString = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `https://www.youtube.com/embed/${videoId}${paramString ? '?' + paramString : ''}`;
  }

  /**
   * Tạo Vimeo embed URL
   */
  private buildVimeoUrl(videoId: string, params: any): string {
    const paramString = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `https://player.vimeo.com/video/${videoId}${paramString ? '?' + paramString : ''}`;
  }

  /**
   * Tạo Dailymotion embed URL
   */
  private buildDailymotionUrl(videoId: string, params: any): string {
    const paramString = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `https://www.dailymotion.com/embed/video/${videoId}${paramString ? '?' + paramString : ''}`;
  }

  /**
   * Tạo Youku embed URL
   */
  private buildYoukuUrl(videoId: string, params: any): string {
    const paramString = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `https://player.youku.com/embed/${videoId}${paramString ? '?' + paramString : ''}`;
  }



  /**
   * Xử lý images để đảm bảo responsive và xử lý Odoo images
   */
  private processImages(content: string): string {
    let processedContent = content.replace(
      /<img([^>]+)>/g,
      (match, attributes) => {
        if (attributes.includes('class=')) {
          return match.replace(
            /class="([^"]*)"/,
            'class="$1 max-w-full h-auto rounded-lg my-4"'
          );
        } else {
          return `<img${attributes} class="max-w-full h-auto rounded-lg my-4" loading="lazy">`;
        }
      }
    );

    processedContent = processedContent.replace(
      /<img([^>]*src=")(\/web\/image\/[^"]*)("[^>]*)>/g,
      (match, beforeSrc, imagePath, afterSrc) => {
        const baseUrl = this.getBaseUrl();
        const fullImageUrl = baseUrl + imagePath;

        return this.replaceTemplate(ExpertGuideDetailComponent.IMAGE_CONTAINER_TEMPLATE, {
          beforeSrc,
          fullImageUrl,
          afterSrc
        });
      }
    );

    return processedContent;
  }

  /**
   * Lấy base URL từ environment
   */
  private getBaseUrl(): string {
    return environment.serverUrl.replace('/jsonrpc', '');
  }

  /**
   * Thay thế placeholders trong template với giá trị thực tế
   */
  private replaceTemplate(template: string, replacements: { [key: string]: string }): string {
    let result = template;
    Object.keys(replacements).forEach(key => {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), replacements[key]);
    });
    return result;
  }


}
