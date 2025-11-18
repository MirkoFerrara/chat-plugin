import { ContextMenuItem } from "./context-menu.model";

export interface ContextMenuConfig {
  items: ContextMenuItem[];
  header?: string;
}