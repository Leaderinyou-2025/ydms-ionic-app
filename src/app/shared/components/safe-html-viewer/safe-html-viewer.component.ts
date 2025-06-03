import { Component, ElementRef, Input, OnChanges, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-safe-html-viewer',
  templateUrl: './safe-html-viewer.component.html',
  styleUrls: ['./safe-html-viewer.component.scss'],
  standalone: false,
})
export class SafeHtmlViewerComponent implements OnChanges {

  @Input() htmlData!: string;
  @ViewChild('innerHtmlContentContainer', {static: true}) containerRef!: ElementRef;

  constructor(
    private renderer: Renderer2
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['htmlData']) {
      this.renderHtmlContent();
    }
  }

  /**
   * renderHtmlContent
   * @private
   */
  private renderHtmlContent(): void {
    const container = this.containerRef.nativeElement;
    container.innerHTML = ''; // Clear old content

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.htmlData;

    Array.from(tempDiv.childNodes).forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;

        // Xử lý embedded video
        if (element.getAttribute('data-embedded') === 'video') {
          const propsStr = element.getAttribute('data-embedded-props');
          if (propsStr) {
            try {
              const props = JSON.parse(propsStr);
              const iframe = this.createIframeFromProps(props);
              if (iframe) {
                container.appendChild(iframe);
              }
            } catch (e) {
              console.error('Lỗi parse video:', e);
            }
          }
        } else {
          this.processLinks(element); // Xử lý link
          container.appendChild(element);
        }
      } else {
        container.appendChild(node);
      }
    });
  }

  /**
   * createIframeFromProps
   * @param props
   * @private
   */
  private createIframeFromProps(props: any): HTMLIFrameElement | null {
    let src = '';
    const params = new URLSearchParams(props.params || {}).toString();

    switch (props.platform) {
      case 'youtube':
        src = `https://www.youtube.com/embed/${props.videoId}?${params}`;
        break;
      case 'vimeo':
        src = `https://player.vimeo.com/video/${props.videoId}?${params}`;
        break;
      case 'dailymotion':
        src = `https://www.dailymotion.com/embed/video/${props.videoId}?${params}`;
        break;
      default:
        return null;
    }

    const iframe = this.renderer.createElement('iframe');
    this.renderer.setAttribute(iframe, 'src', src);
    this.renderer.setAttribute(iframe, 'width', '100%');
    this.renderer.setAttribute(iframe, 'height', '400');
    this.renderer.setAttribute(iframe, 'frameborder', '0');
    this.renderer.setAttribute(iframe, 'allowfullscreen', 'true');

    return iframe;
  }

  /**
   * Xử lý khi click vào link trên thiết bị native
   * @param element
   * @private
   */
  private processLinks(element: HTMLElement) {
    const links = element.querySelectorAll('a');
    links.forEach((link: HTMLAnchorElement) => {
      this.renderer.listen(link, 'click', (event: Event) => {
        event.preventDefault();
        const url = link.href;
        if (url) {
          Browser.open({url}).catch((err) =>
            console.error('Không mở được trình duyệt:', err)
          );
        }
      });
    });
  }
}
