import { redirect } from 'next/navigation';
import { checkBookPurchased, checkManyBooksPurchased, getBook, getBookCartState, getBookWishlistState, getSimilarBooks } from '@/app/actions/book';
import CartButton from '@/components/buttons/cart';
import WishlistButton from '@/components/buttons/wishlist';
import BookComponent from '@/components/ui/book';
import { BookOpen, CheckCircle, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getUserFromToken } from '@/app/actions/auth';
import { formatPricePLN } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getBookCoverColor } from '@/lib/book/colors';

export default async function BookPage({ params }: { params:  { id: string } }) {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    redirect('/');
  }

  const similarBooks = await getSimilarBooks(book.category, book.id);
  const payload = await getUserFromToken();
  const coverColor = getBookCoverColor(book. id);

  const purchasedSimilarBookIds = payload
  ? await checkManyBooksPurchased(payload. id, similarBooks. map((b) => b.id))
  : new Set();

  const [wishlistState, cartState, isPurchased] = payload
    ? await Promise.all([
        getBookWishlistState(payload.id, book.id),
        getBookCartState(payload.id, book. id),
        checkBookPurchased(payload.id, book.id)
      ])
    : [false, false, false];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="flex justify-center">
          <div 
            className="aspect-3/4 w-full max-w-md rounded-lg flex items-center justify-center p-6"
            style={{ backgroundColor: coverColor }}
          >
            <h2 className="text-white text-center font-bold text-2xl leading-tight drop-shadow-md">
              {book.title}
            </h2>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                {book.category}
              </Badge>
              {isPurchased && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Owned
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-xl text-muted-foreground mb-4">{book.author}</p>
            
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(book.rating)
                        ? 'text-yellow-500 fill-current'
                        :  'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-medium">{book.rating}</span>
            </div>

            {book.pages && (
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {book.pages} pages
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {!isPurchased && (
              <div className="flex items-center space-x-4">
                {book.discountedPrice ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-primary">
                      {formatPricePLN(book. discountedPrice)}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPricePLN(book. price)}
                    </span>
                    <Badge variant="destructive">
                      {Math.round(((book.price - book.discountedPrice) / book.price) * 100)}% OFF
                    </Badge>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {formatPricePLN(book.price)}
                  </span>
                )}
              </div>
            )}

            {isPurchased ? (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Book Owned</span>
                  </div>
                  <p className="text-sm text-green-700">
                    This book is in your library.  You can read it anytime.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href={`/reader/${book.id}`} className="flex-1">
                    <Button size="lg" className="w-full">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Read Now
                    </Button>
                  </Link>
                  <Link href="/library">
                    <Button size="lg" variant="outline">
                      View Library
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="flex-1">
                  <CartButton 
                    bookId={book.id} 
                    size="lg" 
                    className="w-full"
                    cartState={cartState}
                  />
                </div>
                <WishlistButton bookId={book.id} size="lg" className="px-4" wishlistState={wishlistState}/>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">About this book</h3>
            <p className="text-muted-foreground leading-relaxed">
              {book. description}
            </p>
          </div>
        </div>
      </div>

      {similarBooks.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Similar Books in {book. category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarBooks.map((similarBook) => (
              <BookComponent
                key={similarBook.id}
                book={similarBook}
                showWishlistButton
                isPurchased={purchasedSimilarBookIds.has(similarBook.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}