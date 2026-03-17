import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface ResumeInfo {
  available: boolean;
  fileName?: string;
  downloadName?: string;
  uploadedAt?: string;
  size?: number;
}

export interface UploadProgress {
  type: 'progress' | 'complete' | 'error';
  percent?: number;
  result?: { message: string; fileName: string; size: number };
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class ResumeService {
  private http = inject(HttpClient);

  private base = `${environment.api.baseUrl}/resume`;

  getInfo(): Observable<ResumeInfo> {
    return this.http.get<ResumeInfo>(`${this.base}/info`);
  }

  getDownloadUrl(): string {
    return `${this.base}/download`;
  }

  updateDownloadName(downloadName: string): Observable<any> {
    return this.http.patch(`${this.base}/download-name`, { downloadName });
  }

  /**
   * Upload resume with real XHR progress tracking.
   * Emits { type:'progress', percent } → { type:'complete', result } | { type:'error', error }
   */
  uploadResumeWithProgress(file: File, token: string): Observable<UploadProgress> {
    return new Observable((observer) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        const body = JSON.stringify({ fileName: file.name, fileData: base64, fileSize: file.size });

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${this.base}/upload`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        // Upload progress
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            observer.next({ type: 'progress', percent });
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              observer.next({ type: 'complete', result });
              observer.complete();
            } catch {
              observer.error({ type: 'error', error: 'Invalid response' });
            }
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              observer.next({ type: 'error', error: err.message || 'Upload failed' });
            } catch {
              observer.next({ type: 'error', error: `Upload failed (${xhr.status})` });
            }
            observer.complete();
          }
        };

        xhr.onerror = () => {
          observer.next({ type: 'error', error: 'Network error — check backend is running' });
          observer.complete();
        };

        xhr.send(body);
      };

      reader.onerror = () => {
        observer.next({ type: 'error', error: 'Failed to read file' });
        observer.complete();
      };

      reader.readAsDataURL(file);
    });
  }

  deleteResume(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(this.base);
  }

  formatSize(bytes: number): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
