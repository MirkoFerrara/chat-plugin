import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatInputData } from '../../models/chat-input-data.model';
import { ChatAttachmentsComponent } from '../attachaments/chat-attachments.component';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, ChatAttachmentsComponent],
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.css']
})
export class ChatInputComponent {
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLDivElement>;
  @Output() sendMessage = new EventEmitter<ChatInputData>();

  selectedFiles: File[] = [];
  filePreviews = new Map<string, string>();
  canSend = false;

  onSend() {
    const text = this.messageInput.nativeElement.innerText.trim();
    const files = [...this.selectedFiles];
    if (!text && files.length === 0) return;

    this.sendMessage.emit({
      text,
      files,
      messageParts: [
        ...(text ? [{ type: 'text' as const, content: text }] : []),
        ...files.map(f => ({ type: 'file' as const, file: f }))
      ]
    });

    this.clear();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        // Vai a capo
        return;
      } else {
        // Invia messaggio
        event.preventDefault();
        this.onSend();
      }
    }
  }

  onFilesSelected(input: HTMLInputElement) {
    if (!input.files?.length) return;
    Array.from(input.files).forEach(file => this.addFile(file));
    input.value = '';
  }

  onPaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (!items) return;
    Array.from(items).forEach(item => {
      if (item.type.startsWith('image/')) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) this.addFile(file);
      }
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer?.files?.length) return;
    Array.from(event.dataTransfer.files).forEach(file => this.addFile(file));
  }

  private clear() {
    this.selectedFiles = [];
    this.filePreviews.clear();
    this.messageInput.nativeElement.innerHTML = '';
  }

  isImage(name: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  }

  onTextChanged() {
    const text = this.messageInput.nativeElement.innerText.trim();
    this.canSend = text.length > 0 || this.selectedFiles.length > 0;
  }

  private addFile(file: File) {
    this.selectedFiles.push(file);
    if (this.isImage(file.name)) {
      const reader = new FileReader();
      reader.onload = () => this.filePreviews.set(file.name, reader.result as string);
      reader.readAsDataURL(file);
    }
    this.canSend = true; // ✅ aggiorna stato pulsante
  }

  removeFile(index: number) {
    const file = this.selectedFiles[index];
    this.selectedFiles.splice(index, 1);
    this.filePreviews.delete(file.name);
    this.onTextChanged(); // ✅ aggiorna stato pulsante
  }

}
