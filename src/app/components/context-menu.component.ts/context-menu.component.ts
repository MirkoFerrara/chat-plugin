import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextMenuItem } from './models/context-menu.model';
import { ContextMenuConfig } from './models/context-menu-config.model';

@Component({
  selector: 'app-context-menu',
  imports: [CommonModule],
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.css']
})
export class ContextMenuComponent {
  @Input() visible = false;
  @Input() x = 0;
  @Input() y = 0;
  @Input() config: ContextMenuConfig | null = null;
  
  @Output() closed = new EventEmitter<void>();

  onItemClick(item: ContextMenuItem) {
    if (!item.disabled) {
      item.action();
      this.close();
    }
  }

  close() {
    this.visible = false;
    this.closed.emit();
  }
}