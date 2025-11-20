import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs'; 
import { ChatMessage } from '../models/chat-message.model';
import { ChatInputComponent } from '../input/chat-input/chat-input.component';
import { ChatMessageComponent } from '../messages/message/chat-message.component';
import { ChatInputData } from '../models/chat-input-data.model'; 
import { ChatService } from '../../../services/chat.service';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, ChatInputComponent, ChatMessageComponent],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent
  implements OnInit, OnDestroy, OnChanges, AfterViewChecked
{
  @Input() chatId?: string;
  @ViewChild('msgContainer') container!: ElementRef<HTMLDivElement>;

  messages: ChatMessage[] = [];
  currentUserId: string | null = null;

  private sub?: Subscription;
  private imageCache = new Map<string, string>();
  private mustScrollToBottom = false;

  constructor(
    private chat: ChatService,
    private login: LoginService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.chatId) this.initChat();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['chatId'] && !changes['chatId'].firstChange) {
      this.cleanup();
      if (this.chatId) this.initChat();
    }
  }

  private initChat() {
    this.currentUserId = this.login.getUserId();
    this.chat.connect(this.chatId!);

    this.sub = this.chat.listen(this.chatId!).subscribe(msgs => {
      this.messages = msgs;
      this.loadImages();

      this.mustScrollToBottom = true;
      this.cdRef.detectChanges();
    });
  }

  ngAfterViewChecked() {
    if (this.mustScrollToBottom) {
      this.scrollToBottomInstant();
      this.mustScrollToBottom = false;
    }
  }

  private scrollToBottomInstant() {
    const el = this.container?.nativeElement;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  private scrollToBottomSmooth() {
    const el = this.container?.nativeElement;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }

  onSend(data: ChatInputData) {
    if (!this.chatId) return;

    const messageId = crypto.randomUUID();
    const allParts = data.messageParts.map((p, i) => ({ ...p, sequence: i }));
    const files = allParts.filter(p => p.file).map(p => p.file!);

    if (files.length > 0) {
      this.chat.uploadFiles(this.chatId, files).subscribe({
        next: uploaded => {
          let uploadIndex = 0;
          allParts.forEach(part => {
            if (part.type === 'file') {
              const fileData = uploaded[uploadIndex++];
              this.chat.send(this.chatId!, {
                messageId,
                type: 'file',
                fileUrl: fileData.fileUrl,
                fileName: fileData.fileName,
                sequence: part.sequence
              });
            } else {
              this.chat.send(this.chatId!, {
                messageId,
                type: 'text',
                content: part.content ?? '',
                sequence: part.sequence
              });
            }
          });
        },
        error: err => console.error('❌ Errore upload file:', err)
      });
    } else {
      allParts.forEach(part => {
        this.chat.send(this.chatId!, {
          messageId,
          type: 'text',
          content: part.content ?? '',
          sequence: part.sequence
        });
      });
    }

    setTimeout(() => this.scrollToBottomSmooth(), 80);
  }

  private loadImages() {
    if (!this.chatId) return;

    this.messages.forEach(msg => {
      if (
        msg.type === 'file' &&
        msg.fileName &&
        this.isImage(msg.fileName) &&
        !msg.localUrl
      ) {
        const cached = this.imageCache.get(msg.fileUrl!);
        if (cached) {
          msg.localUrl = cached;
          return;
        }

        this.chat.getFile(this.chatId!, msg.fileUrl!).subscribe({
          next: blob => {
            const url = URL.createObjectURL(blob);
            msg.localUrl = url;
            this.imageCache.set(msg.fileUrl!, url);
            this.mustScrollToBottom = true;
            this.cdRef.detectChanges();
          },
          error: err => console.error('❌ Errore caricamento immagine', err)
        });
      }
    });
  }

  private isImage(name: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  }

  private cleanup() {
    this.sub?.unsubscribe();
    this.sub = undefined;
    this.messages = [];
    this.imageCache.clear();
  }

  ngOnDestroy() {
    this.cleanup();
  }
}
