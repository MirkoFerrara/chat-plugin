import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from './services/login.service';
import { ChatService } from './services/chat.service';
import { ChatRoomComponent } from './components/chat/chat-room/chat-room.component';
import { UserListComponent } from './components/read-all-users/user-list.component';
@Component({
  selector: 'app-chat-plugin',
  imports: [CommonModule, ChatRoomComponent, UserListComponent],
  templateUrl: './chat-plugin.html',
  styleUrls: ['./chat-plugin.css'] 
})
export class ChatPlugin implements OnInit, OnDestroy {
  // ⭐ INPUT CONFIGURABILI
  @Input() userId?: string;
  @Input() token?: string;
  @Input() apiUrl?: string;      // ⭐ NUOVO
  @Input() wsUrl?: string;        // ⭐ NUOVO

  @Output() chatReady = new EventEmitter<void>();
  @Output() chatError = new EventEmitter<string>();

  chatId?: string;
  selectedUsername?: string;

  constructor(
    private loginService: LoginService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    console.log('💬 Chat Plugin - Inizializzato', {
      userId: this.userId,
      apiUrl: this.apiUrl,
      wsUrl: this.wsUrl
    });

    // ✅ Configura le credenziali
    if (this.userId && this.token) {
      this.loginService.setCredentials(this.userId, this.token);
    }

    // ✅ Configura gli URL dinamicamente
    if (this.apiUrl && this.wsUrl) {
      this.chatService.configureUrls(this.apiUrl, this.wsUrl);
      console.log('✅ URLs configurati:', { apiUrl: this.apiUrl, wsUrl: this.wsUrl });
    } else {
      console.warn('⚠️ apiUrl e wsUrl non forniti, uso environment di default');
    }

    this.chatReady.emit();
  }

  onUserSelected(event: { userId: string; username: string }) {
    console.log('👤 Utente selezionato:', event);
    this.selectedUsername = event.username;
    
    this.chatService.openChat(event.userId).subscribe({
      next: (chatRoom) => {
        console.log('✅ Chat aperta:', chatRoom.id);
        this.chatId = chatRoom.id;
      },
      error: (err) => {
        console.error('❌ Errore apertura chat:', err);
        this.chatError.emit('Impossibile aprire la chat');
      }
    });
  }

  backToUserList() {
    this.chatId = undefined;
    this.selectedUsername = undefined;
  }

  ngOnDestroy() {
    console.log('💬 Chat Plugin - Distrutto');
    this.chatService.disconnectAll();
  }
}