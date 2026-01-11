export interface BookCopy {
  _id: string;
  status: string;
  barcode?: string;
  location?: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  coverImage?: string;
  totalCopies?: number;
  availableCopies?: number;
  copies?: BookCopy[];
}
