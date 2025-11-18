import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoginService } from './login.service';
import { w3cwebsocket as W3CWebSocket } from 'websocket'; 
import { ChatRoomResponse } from '../components/chat/models/char-room-response.model';
import { ChatMessage } from '../components/chat/models/chat-message.model';
import { ChatRoomRequest } from '../components/chat/models/chat-room-request.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  
  // ✅ URLs configurabili dinamicamente
  private baseUrl = environment.apiUrl;
  private wsUrl = environment.wsUrl;
  
  private wsMap = new Map<string, W3CWebSocket>();
  private subjects = new Map<string, BehaviorSubject<ChatMessage[]>>();

  constructor(private http: HttpClient, private login: LoginService) {}

  /**
   * ⭐ NUOVO: Configura URLs a runtime
   */
  configureUrls(apiUrl: string, wsUrl: string): void {
    console.log('🔧 Configurazione URLs:', { apiUrl, wsUrl });
    this.baseUrl = apiUrl;
    this.wsUrl = wsUrl;
  }

  private getSubject(chatId: string): BehaviorSubject<ChatMessage[]> {
    if (!this.subjects.has(chatId)) {
      this.subjects.set(chatId, new BehaviorSubject<ChatMessage[]>([]));
    }
    return this.subjects.get(chatId)!;
  }

  openChat(targetUserId: string): Observable<ChatRoomResponse> {
    const currentUserId = this.login.getUserId();
    if (!currentUserId) return throwError(() => new Error('User non loggato'));

    const request: ChatRoomRequest = {
      participantIds: [currentUserId, targetUserId]
    };

    return this.http
      .post<ChatRoomResponse>(`${this.baseUrl}/chat/getChatRoom`, request)
      .pipe(
        tap(chatRoom => {
          console.log('✅ Chat room ottenuta:', chatRoom.id);
          this.connect(chatRoom.id);
        }),
        catchError(err => {
          console.error('❌ Errore apertura chat', err);
          return throwError(() => err);
        })
      );
  }

  connect(chatId: string) {
    const userId = this.login.getUserId();
    const token = this.login.getToken();
    if (!userId || !token) return;

    const existing = this.wsMap.get(chatId);
    if (existing && existing.readyState === existing.OPEN) return;

    const ws = new W3CWebSocket(`${this.wsUrl}/chat?chatId=${chatId}&userId=${userId}&token=${token}`);
    this.wsMap.set(chatId, ws);

    ws.onopen = () => console.log(`✅ WS connesso a ${chatId}`);
    ws.onmessage = e => {
      try {
        const msg: ChatMessage = JSON.parse(e.data.toString());
        if (msg.type === 'heartbeat') return;

        const subj = this.getSubject(chatId);
        const current = subj.value;

        const key = `${msg.messageId}|${msg.sequence}|${msg.type}|${msg.fileUrl ?? msg.content ?? ''}`;
        const already = current.some(m =>
          `${m.messageId}|${m.sequence}|${m.type}|${m.fileUrl ?? m.content ?? ''}` === key
        );

        if (!already) {
          const updated = [...current, msg].sort((a, b) => {
            const t1 = new Date(a.createdAt).getTime();
            const t2 = new Date(b.createdAt).getTime();
            if (t1 !== t2) return t1 - t2;
            if (a.messageId !== b.messageId) return a.messageId.localeCompare(b.messageId);
            return (a.sequence ?? 0) - (b.sequence ?? 0);
          });
          subj.next(updated);
        }
      } catch (err) {
        console.error('❌ Errore parsing messaggio:', err);
      }
    };
    ws.onclose = () => {
      console.warn(`⚠️ WS chiuso per chat ${chatId}`);
      this.wsMap.delete(chatId);
    };
  }

  listen(chatId: string): Observable<ChatMessage[]> {
    return this.getSubject(chatId).asObservable();
  }

  send(chatId: string, msg: Partial<ChatMessage>) {
    const ws = this.wsMap.get(chatId);
    if (!ws || ws.readyState !== ws.OPEN) {
      console.warn(`⚠️ WS non pronta per chat ${chatId}`);
      return;
    }

    ws.send(
      JSON.stringify({
        ...msg,
        chatId,
        senderId: this.login.getUserId(),
        createdAt: new Date().toISOString(),
        messageId: msg.messageId || crypto.randomUUID()
      })
    );
  }

  uploadFiles(chatId: string, files: File[]) {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    return this.http.post<{ fileUrl: string }[]>(`${this.baseUrl}/chat/uploadFiles?chatId=${chatId}`, fd)
      .pipe(map(res => res.map(r => ({
        fileUrl: r.fileUrl,
        fileName: r.fileUrl.split('/').pop()!
      }))));
  }

  getFile(chatId: string, fileUrl: string): Observable<Blob> {
    const clean = fileUrl.replace(/^\/?uploads\//, '');
    return this.http.get(
      `${this.baseUrl}/chat/file/${encodeURIComponent(clean)}?chatId=${chatId}`,
      { responseType: 'blob' }
    );
  }

  disconnectAll() {
    console.log('🔌 Disconnessione di tutte le WebSocket...');
    for (const [chatId, ws] of this.wsMap.entries()) {
      try {
        ws.close();
        console.log(`💤 WS chiusa per chat ${chatId}`);
      } catch (err) {
        console.warn(`⚠️ Errore chiusura WS per ${chatId}`, err);
      }
    }
    this.wsMap.clear();
    this.subjects.clear();
  }
}