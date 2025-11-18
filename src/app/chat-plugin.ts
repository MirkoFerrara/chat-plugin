import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from './services/login.service';
import { ChatService } from './services/chat.service';
import { UserService } from './services/user.service';
import { ChatRoomComponent } from './components/chat/chat-room/chat-room.component';
import { UserListComponent } from './components/read-all-users/user-list.component';

@Component({
  selector: 'app-chat-plugin',
  imports: [CommonModule, ChatRoomComponent, UserListComponent],
  template: `
    <div class="chat-plugin-container">
      
      <!-- 📋 VISTA: Lista Utenti (default) -->
      <div *ngIf="!chatId" class="user-list-view">
        <h3>💬 Seleziona un utente per chattare</h3>
        <app-user-list (userSelected)="onUserSelected($event)"></app-user-list>
      </div>

      <!-- 💬 VISTA: Chat Room (quando c'è chatId) -->
      <div *ngIf="chatId" class="chat-room-view">
        <div class="chat-header">
          <button class="back-btn" (click)="backToUserList()">← Indietro</button>
          <h3>Chat con {{ selectedUsername || 'Utente' }}</h3>
        </div>
        
        <app-chat-room [chatId]="chatId"></app-chat-room>
      </div>

    </div>
  `,
  styles: [`
    .chat-plugin-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #f5f5f5;
    }
    
    .user-list-view,
    .chat-room-view {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-list-view h3 {
      padding: 20px;
      margin: 0;
      background: white;
      border-bottom: 2px solid #e0e0e0;
      color: #333;
      text-align: center;
    }

    .chat-header {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px 20px;
      background: white;
      border-bottom: 2px solid #e0e0e0;
    }

    .back-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }

    .back-btn:hover {
      background: #5568d3;
    }

    .chat-header h3 {
      margin: 0;
      color: #333;
      flex: 1;
    }
  `]
})
export class ChatPlugin implements OnInit, OnDestroy {
  // ⭐ INPUT CONFIGURABILI
  @Input() userId?: string;
  @Input() token?: string;
  @Input() apiUrl?: string; 
  @Input() wsUrl?: string; 

  @Output() chatReady = new EventEmitter<void>();
  @Output() chatError = new EventEmitter<string>();

  chatId?: string;
  selectedUsername?: string;

  constructor(
    private loginService: LoginService,
    private chatService: ChatService,
    private userService: UserService
  ) {}

  ngOnInit() {
    console.log('🚀🚀🚀 CHAT PLUGIN v2.0 - NUOVA VERSIONE! 🚀🚀🚀');
    console.log('💬 Chat Plugin - Inizializzato con parametri:', {
      userId: this.userId,
      token: this.token ? '***' : 'MANCANTE',
      apiUrl: this.apiUrl,
      wsUrl: this.wsUrl
    });

    // ✅ Configura le credenziali
    if (this.userId && this.token) {
      this.loginService.setCredentials(this.userId, this.token);
      console.log('✅ Credenziali configurate per userId:', this.userId);
    } else {
      console.error('❌ userId o token MANCANTI!');
    }

    // ✅ Configura gli URL dinamicamente
    if (this.apiUrl && this.wsUrl) {
      this.chatService.configureUrls(this.apiUrl, this.wsUrl);
      this.userService.configureUrl(this.apiUrl);
      console.log('✅ URLs configurati:', { apiUrl: this.apiUrl, wsUrl: this.wsUrl });
    } else {
      console.warn('⚠️ apiUrl e wsUrl non forniti, uso environment di default');
      console.warn('⚠️ apiUrl:', this.apiUrl);
      console.warn('⚠️ wsUrl:', this.wsUrl);
    }

    console.log('📋 Mostrando vista: Lista Utenti (chatId=' + this.chatId + ')');
    this.chatReady.emit();
  }

  onUserSelected(event: { userId: string; username: string }) {
    console.log('👤👤👤 Utente selezionato dalla lista:', event);
    this.selectedUsername = event.username;
    
    console.log('🔄 Apertura chat con userId:', event.userId);
    this.chatService.openChat(event.userId).subscribe({
      next: (chatRoom) => {
        console.log('✅✅✅ Chat aperta con successo! chatId:', chatRoom.id);
        this.chatId = chatRoom.id;
        console.log('📋 Cambio vista: Chat Room');
      },
      error: (err) => {
        console.error('❌❌❌ Errore apertura chat:', err);
        this.chatError.emit('Impossibile aprire la chat');
      }
    });
  }

  backToUserList() {
    console.log('⬅️ Torna alla lista utenti');
    this.chatId = undefined;
    this.selectedUsername = undefined;
    console.log('📋 Cambio vista: Lista Utenti');
  }

  ngOnDestroy() {
    console.log('💬 Chat Plugin - Distrutto, chiudo connessioni');
    this.chatService.disconnectAll();
  }
}