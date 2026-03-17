import { HttpClient } from '@angular/common/http';

import { ContentService } from './content.service';

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(() => {
    service = new ContentService({} as HttpClient);
  });

  it('returns empty string when image value is missing', () => {
    expect(service.getImageUrl(undefined)).toBe('');
  });

  it('returns absolute and data URLs unchanged', () => {
    const absolute = 'https://cdn.example.com/image.png';
    const dataUrl = 'data:image/png;base64,AAAA';

    expect(service.getImageUrl(absolute)).toBe(absolute);
    expect(service.getImageUrl(dataUrl)).toBe(dataUrl);
  });
});
