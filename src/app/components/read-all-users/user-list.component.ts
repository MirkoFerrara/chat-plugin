import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserRest } from '../../services/user.service'; 
import { ContextMenuComponent } from '../context-menu.component.ts/context-menu.component';
import { ContextMenuConfig } from '../context-menu.component.ts/models/context-menu-config.model';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, ContextMenuComponent],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  @Output() userSelected = new EventEmitter<{ userId: string; username: string }>();

  isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  // Dati utenti
  userList: UserRest[] = [];
  error: any = null;
  loading = false;

  // Context Menu State
  contextMenuVisible = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextMenuConfig: ContextMenuConfig | null = null;
  selectedUser: UserRest | null = null; 

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.readAllUsers();
  }

  public readAllUsers() {
    console.log('📋 Caricamento utenti...');
    this.loading = true;

    this.userService.getAllUsers().subscribe({
      next: users => {
        this.userList = users;
        console.log(`✅ ${users.length} utenti caricati`);
        this.error = null;
        this.loading = false;
      },
      error: err => {
        this.error = { detail: err.message || 'Errore generico' };
        console.error('❌ Errore:', err);
        this.loading = false;
      }
    });
  }

  openContextMenu(event: MouseEvent | TouchEvent, user: UserRest) {
    event.preventDefault();
    event.stopPropagation();

    this.selectedUser = user;

    const menuWidth = 220;
    const menuHeight = 280;

    const x = event instanceof MouseEvent 
      ? event.clientX 
      : (event as TouchEvent).touches[0].clientX;

    const y = event instanceof MouseEvent 
      ? event.clientY 
      : (event as TouchEvent).touches[0].clientY;

    this.contextMenuX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
    this.contextMenuY = y + menuHeight > window.innerHeight ? y - menuHeight : y;

    this.contextMenuVisible = true;

    this.contextMenuConfig = {
      header: user.username,
      items: [
        { label: 'Visualizza Profilo', icon: '👤', action: () => this.viewProfile(user) },
        { label: 'Invia Messaggio', icon: '💬', action: () => this.sendMessage(user) },
        { label: 'Aggiungi Amico', icon: '➕', action: () => this.addFriend(user) },
        { divider: true, label: '', action: () => {} },
        { label: 'Blocca Utente', icon: '🚫', danger: true, action: () => this.blockUser(user) },
        { label: 'Segnala', icon: '⚠️', danger: true, action: () => this.reportUser(user) }
      ]
    };
  }

  onContextMenuClosed() {
    this.contextMenuVisible = false;
    this.selectedUser = null;
  }

  // ==================== AZIONI MENU ====================

  viewProfile(user: UserRest) {
    console.log('👤 Visualizza profilo:', user.username);
    // TODO: Implementa navigazione al profilo
  }

  /**
   * ✅ Emette evento al componente padre (ChatPlugin)
   */
  sendMessage(user: UserRest) {
    console.log('💬 Richiesta apertura chat con:', user.username);
    
    if (!user.id) {
      alert('Errore: ID utente non disponibile');
      return;
    }

    // ⭐ EMETTI EVENTO
    this.userSelected.emit({ 
      userId: user.id, 
      username: user.username 
    });
  }

  // ❌ RIMUOVI QUESTO METODO:
  // closeChat() { ... }

  addFriend(user: UserRest) {
    console.log('➕ Aggiungi amico:', user.username);
    // TODO: Implementa aggiunta amico
  }

  blockUser(user: UserRest) {
    const confirmed = confirm(`Vuoi davvero bloccare ${user.username}?`);
    if (confirmed) {
      console.log('🚫 Blocca utente:', user.username);
      // TODO: Implementa blocco
    }
  }

  reportUser(user: UserRest) {
    const confirmed = confirm(`Vuoi segnalare ${user.username}?`);
    if (confirmed) {
      console.log('⚠️ Segnala utente:', user.username);
      // TODO: Implementa segnalazione
    }
  }
}