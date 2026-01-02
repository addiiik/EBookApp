import { getUserFromToken } from '@/app/actions/auth';
import { checkManyBooksPurchased, getSearchResults } from '@/app/actions/book';
import { Badge } from '@/components/ui/badge';
import BookComponent from '@/components/ui/book';
import { Book } from '@/types/book';
import { Search } from 'lucide-react';
import Link from 'next/link';

interface SearchResultsProps {
  query: string;
}

export default async function SearchResults({ query }: SearchResultsProps) {

  if (!query || query.trim() === '') {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Start your search</h2>
        <p className="text-muted-foreground">
          Enter a book title, author name, or subject to find what you're looking for.
        </p>
      </div>
    );
  }

  const books = await getSearchResults(query)

  const payload = await getUserFromToken();
  const purchasedBookIds = payload
  ? await checkManyBooksPurchased(payload.id, books.map((b) => b.id))
  : new Set();

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No results found</h2>
        <p className="text-muted-foreground mb-4">
          We couldn't find any books matching "{query}".
        </p>
      </div>
    );
  }

  const booksByCategory = books.reduce((acc, book) => {
    if (!acc[book.category]) acc[book.category] = [];
    acc[book.category].push(book);
    return acc;
  }, {} as Record<string, Book[]>);

  const categories = Object.keys(booksByCategory).sort();

return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          {books.length} result{books.length !== 1 ? 's' : ''} found
        </h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge key={category} variant="secondary" className="text-xs">
              {category} ({booksByCategory[category].length})
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {books.map((book) => (
          <BookComponent
            key={book.id}
            book={book}
            showWishlistButton
            isPurchased={purchasedBookIds.has(book.id)}
          />
        ))}
      </div>

      {books.length > 8 && (
        <div className="space-y-12">
          <hr className="my-8" />
          <h3 className="text-xl font-semibold mb-6">Results by Category</h3>
          {categories.map((category) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium">{category}</h4>
                <Link
                  href={`/subjects/${encodeURIComponent(category)}`}
                  className="text-sm text-primary hover:underline"
                >
                  View all in {category} →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {booksByCategory[category].slice(0, 4).map((book) => (
                  <BookComponent
                    key={`${category}-${book.id}`}
                    book={book}
                    showWishlistButton
                    isPurchased={purchasedBookIds.has(book.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
