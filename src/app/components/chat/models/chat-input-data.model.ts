export interface ChatInputData {
  text: string | null;
  files: File[];
  messageParts: { type: 'text' | 'file'; content?: string; file?: File }[];
}