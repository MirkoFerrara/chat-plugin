import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-attachments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-attachments.component.html',
  styleUrls: ['./chat-attachments.component.css']
})
export class ChatAttachmentsComponent {
  @Input() files: File[] = [];
  @Input() previews = new Map<string, string>();
  @Output() remove = new EventEmitter<number>();

  showPopup = false;

  togglePopup() {
    this.showPopup = !this.showPopup;
  }

  closePopup() {
    this.showPopup = false;
  }

  isImage(name: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  }

  openFullPreview(url: string, name: string) {
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9999',
    cursor: 'zoom-out'
  });

  const img = document.createElement('img');
  img.src = url;
  img.alt = name;
  Object.assign(img.style, {
    maxWidth: '90vw',
    maxHeight: '90vh',
    borderRadius: '12px',
    boxShadow: '0 4px 30px rgba(0,0,0,0.6)'
  });

  overlay.appendChild(img);
  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
}

}
