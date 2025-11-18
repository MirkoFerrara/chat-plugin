export interface ContextMenuItem {
  label: string;
  icon?: string;
  action: () => void;
  divider?: boolean;
  danger?: boolean;
  disabled?: boolean;
}