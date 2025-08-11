export interface Borrow {
  id?: number;
  userId: number;
  bookId: number;
  borrowDate: Date;
  returnDate?: Date;
  status: string;
  username?: string;
  bookTitle?: string;
}
