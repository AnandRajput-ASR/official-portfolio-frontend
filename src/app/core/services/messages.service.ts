import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MessagesResponse } from '../models/portfolio.model';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private base = `${environment.api.baseUrl}/messages`;

  constructor(private http: HttpClient) {}

  // Public — submit contact form
  sendMessage(payload: ContactPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.base, payload);
  }

  // Admin — get all messages
  getMessages(): Observable<MessagesResponse> {
    return this.http.get<MessagesResponse>(this.base);
  }

  // Admin — mark one as read
  markRead(id: string): Observable<any> {
    return this.http.patch(`${this.base}/${id}/read`, {});
  }

  // Admin — toggle star
  toggleStar(id: string): Observable<any> {
    return this.http.patch(`${this.base}/${id}/star`, {});
  }

  // Admin — delete
  deleteMessage(id: string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }

  // Admin — mark all read
  markAllRead(): Observable<any> {
    return this.http.patch(`${this.base}/mark-all-read`, {});
  }
}
