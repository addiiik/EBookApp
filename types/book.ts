export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  discountedPrice?: number | null;
  rating: number;
}

export interface CartItemWithBook {
  id: string;
  book: {
    id: string;
    title: string;
    author: string;
    category: string;
    price: number;
    discountedPrice: number | null;
    rating: number;
  };
}

export interface WishlistItemWithBook {
  id: string;
  book: {
    id: string;
    title: string;
    author: string;
    category: string;
    price: number;
    discountedPrice: number | null;
    rating: number;
  };
}