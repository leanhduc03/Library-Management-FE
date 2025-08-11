export interface Book {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publishDate: Date;
  availableCopies: number;
  totalCopies: number;
  imageUrl?: string; 
}
