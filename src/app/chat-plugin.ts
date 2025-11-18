import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
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
    :host {
      display: block;
      width: 100%;
      height: 600px;
      min-height: 400px;
    }

    .chat-plugin-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #f5f5f5;
      border-radius: 12px;
      overflow: hidden;
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      font-size: 20px;
      font-weight: 600;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .chat-header {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .back-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid white;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
      backdrop-filter: blur(10px);
    }

    .back-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateX(-3px);
    }

    .chat-header h3 {
      margin: 0;
      flex: 1;
      font-size: 18px;
      font-weight: 600;
    }
  `]
})
export class ChatPlugin implements OnInit, OnChanges, OnDestroy {
  // ⭐ INPUT CONFIGURABILI
  @Input() userId?: string;
  @Input() token?: string;
  @Input() apiUrl?: string; 
  @Input() wsUrl?: string; 

  @Output() chatReady = new EventEmitter<void>();
  @Output() chatError = new EventEmitter<string>();

  chatId?: string;
  selectedUsername?: string;
  private initialized = false;

  constructor(
    private loginService: LoginService,
    private chatService: ChatService,
    private userService: UserService
  ) {}

  ngOnInit() {
    console.log('🔌 Chat Plugin - ngOnInit chiamato');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.userId && this.token && this.apiUrl && this.wsUrl && !this.initialized) {
      this.initializePlugin();
    }
  }

  private initializePlugin() {
    if (this.initialized) return;
    
    console.log('🚀🚀🚀 CHAT PLUGIN v3.0 - INIZIALIZZAZIONE! 🚀🚀🚀');

    // ✅ Configura credenziali
    if (this.userId && this.token) {
      this.loginService.setCredentials(this.userId, this.token);
      
      // ⭐ NUOVO: Configura auth nei service
      this.chatService.configureAuth(this.userId, this.token);
      this.userService.configureAuth(this.userId, this.token);
      
      console.log('✅ Credenziali configurate');
    }

    // ✅ Configura URLs
    if (this.apiUrl && this.wsUrl) {
      this.chatService.configureUrls(this.apiUrl, this.wsUrl);
      this.userService.configureUrl(this.apiUrl);
      console.log('✅ URLs configurati');
    }

    this.initialized = true;
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