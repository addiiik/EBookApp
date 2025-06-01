import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle, Download, Calendar, BookOpen } from 'lucide-react';
import Link from 'next/link';
import WishlistButton from '@/components/buttons/WishlistButton';
import CartButton from '@/components/buttons/CartButton';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  discountedPrice?: number | null;
  rating: number;
}

interface BookComponentProps {
  book: Book;
  showWishlistButton?: boolean;
  inLibrary?: boolean;
  purchasedAt?: Date;
  isPurchased?: boolean;
  isDownloaded?: boolean;
}

function formatPurchaseDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export default function BookComponent({ 
  book, 
  showWishlistButton = false,
  inLibrary = false,
  purchasedAt,
  isPurchased = false,
  isDownloaded = false
}: BookComponentProps) {
  const bookIsPurchased = inLibrary || isPurchased;
  
  return (
    <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 h-full relative">
      <Link href={`/book/${book.id}`} className="block">
        <div className="p-4">
          <div className="aspect-[3/4] bg-muted rounded-md mb-4 flex items-center justify-center relative">
            {!bookIsPurchased && (
              <span className="text-muted-foreground text-lg">Book Cover</span>
            )}
            {bookIsPurchased && (
              <div className="absolute inset-0 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            )}
            {isDownloaded && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                <Download className="w-3 h-3" />
              </div>
            )}
          </div>
          <Badge variant="secondary" className="w-fit mb-2">
            {book.category}
          </Badge>
          <CardTitle className="text-lg line-clamp-2 mb-2">
            {book.title}
          </CardTitle>
          <CardDescription className="text-sm">
            {book.author}
          </CardDescription>
        </div>
      </Link>
      
      <CardContent className="p-4 pt-0 mt-auto">
        <div className="flex items-center justify-between mb-3">
          {!bookIsPurchased && (
            <div className="flex items-center space-x-2">
              {book.discountedPrice ? (
                <>
                  <span className="text-xl font-bold text-primary">
                    ${book.discountedPrice}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    ${book.price}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-primary">
                  ${book.price}
                </span>
              )}
            </div>
          )}
          {!bookIsPurchased && (
            <div className="flex items-center space-x-1 ml-auto">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm">{book.rating}</span>
            </div>
          )}
        </div>
        
        {!bookIsPurchased && (
          showWishlistButton ? (
            <div className="flex gap-2">
              <div className="flex-1">
                <CartButton 
                  bookId={book.id} 
                  size="sm" 
                  className="w-full"
                />
              </div>
              <WishlistButton bookId={book.id} size="sm" className="px-3" />
            </div>
          ) : (
            <CartButton 
              bookId={book.id} 
              size="sm" 
              className="w-full"
            />
          )
        )}
        
        {bookIsPurchased && !inLibrary && (
          <div className="text-center">
            <Badge variant="outline" className="text-green-600 border-green-600 px-6 py-1 text-sm font-medium">
              In Your Library
            </Badge>
          </div>
        )}

        {inLibrary && (
          <div className="space-y-3">
            {purchasedAt && (
              <div className="flex items-center justify-center text-sm text-muted-foreground bg-muted/30 rounded-lg py-2 px-3">
                <Calendar className="w-4 h-4 mr-2" />
                Purchased {formatPurchaseDate(purchasedAt)}
              </div>
            )}
            
            {isDownloaded && (
              <div className="text-center">
                <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                  Downloaded for Offline Reading
                </Badge>
              </div>
            )}
            
            <div className="flex gap-2">
              <Link href={`/reader/${book.id}`} className="flex-1">
                <Button 
                  className="w-full text-white"
                  size="sm"
                  variant="default"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Read Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}