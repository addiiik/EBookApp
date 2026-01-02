import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Calendar, BookOpen } from 'lucide-react';
import Link from 'next/link';
import WishlistButton from '@/components/buttons/wishlist';
import CartButton from '@/components/buttons/cart';
import { Book } from '@/types/book';
import { getBookWishlistState } from '@/app/actions/book';
import { getBookCartState } from '@/app/actions/book';
import { getUserFromToken } from '@/app/actions/auth';
import { formatPricePLN } from '@/lib/utils';
import { getBookCoverColor } from '@/lib/book/colors';

interface BookComponentProps {
  book: Book;
  showWishlistButton?:  boolean;
  inLibrary?: boolean;
  purchasedAt?: Date;
  isPurchased?: boolean;
  reader?: boolean;
  pages?: number;
  progress?: { page: number; finished: boolean };
}

function formatPurchaseDate(date:  Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month:  'short',
    day: 'numeric'
  }).format(date);
}

export default async function BookComponent({ 
  book, 
  showWishlistButton = false,
  inLibrary = false,
  purchasedAt,
  isPurchased = false,
  reader = false,
  pages,
  progress,
}: BookComponentProps) {

  const bookIsPurchased = inLibrary || isPurchased;
  const payload = await getUserFromToken();
  const coverColor = getBookCoverColor(book. id);

  const [wishlistState, cartState] = payload && ! reader
    ? await Promise.all([
        getBookWishlistState(payload.id, book.id),
        getBookCartState(payload.id, book. id),
      ])
    : [false, false];

  if (reader) {
    const progressPercent = progress && pages
      ? Math.round((progress. page / pages) * 100)
      : 0;

    return (
      <Link href={`/reader/${book.id}`} className="block group">
        <div 
          className="flex flex-col aspect-3/4 w-full cursor-pointer transition-transform duration-300 group-hover:scale-[1.02] rounded-lg p-4 shadow-sm"
          style={{ backgroundColor: coverColor }}
        >
          <div className="flex flex-col justify-center items-center flex-1 mb-4">
            <h3 className="text-lg font-semibold text-center text-white drop-shadow-md line-clamp-2">
              {book.title}
            </h3>
            <p className="text-sm text-center text-white drop-shadow-md">
              {book.author}
            </p>
          </div>

          {progress && pages && (
            <div className="w-full mt-auto">
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>Page {progress.page} of {pages}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Link>
    );
  }
  
  return (
    <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 h-full relative">
      <Link href={`/book/${book.id}`} className="block">
        <div className="p-4">
          <div 
            className="aspect-3/4 rounded-md mb-4 flex flex-col items-center justify-center relative p-4"
            style={{ backgroundColor: coverColor }}
          >
            <h3 className="text-white text-center font-bold text-lg leading-tight line-clamp-4 drop-shadow-md">
              {book. title}
            </h3>
          </div>
          <Badge variant="secondary" className="w-fit mb-2">
            {book.category}
          </Badge>
          <CardTitle className="text-lg line-clamp-2 mb-2">
            {book.title}
          </CardTitle>
          <CardDescription className="text-sm">
            {book. author}
          </CardDescription>
        </div>
      </Link>
      
      <CardContent className="p-4 pt-0 mt-auto">
        <div className="flex items-center justify-between mb-3">
          {!bookIsPurchased && (
            <div className="flex items-center space-x-2">
              {book.discountedPrice ?  (
                <>
                  <span className="text-xl font-bold text-primary">
                    {formatPricePLN(book.discountedPrice)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPricePLN(book.price)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-primary">
                  {formatPricePLN(book.price)}
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
          showWishlistButton ?  (
            <div className="flex gap-2">
              <div className="flex-1">
                <CartButton 
                  bookId={book.id} 
                  size="sm" 
                  className="w-full"
                  cartState={cartState}
                />
              </div>
              <WishlistButton bookId={book. id} size="sm" className="px-3" wishlistState={wishlistState} />
            </div>
          ) : (
            <CartButton 
              bookId={book.id} 
              size="sm" 
              className="w-full"
              cartState={cartState}
            />
          )
        )}
        
        {bookIsPurchased && ! inLibrary && (
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