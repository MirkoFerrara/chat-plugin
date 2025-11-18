export interface ChatInputDataModel {
  text: string | null;
  files: File[];
  messageParts: { type: 'text' | 'file'; content?: string; file?: File }[];
}