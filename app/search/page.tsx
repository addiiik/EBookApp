import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import BookComponent from '@/components/BookComponent';
import { auth } from '@/auth';
import { getUserPurchasedBookIds } from '@/lib/book/BookUtils';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  discountedPrice?: number | null;
  rating: number;
}

interface SearchPageProps {
  searchParams: { query?: string };
}

async function getSearchResults(query: string): Promise<Book[]> {
  'use server'
  if (!query || query.trim() === '') {
    return [];
  }

  return await prisma.book.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { author: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: [
      { rating: 'desc' },
      { title: 'asc' }
    ]
  });
}

async function SearchResults({ query }: { query: string }) {
  'use server'
  const session = await auth();
  
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

  const [books, purchasedBookIds] = await Promise.all([
    getSearchResults(query),
    getUserPurchasedBookIds(session?.user?.id || null)
  ]);

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No results found</h2>
        <p className="text-muted-foreground mb-4">
          We couldn't find any books matching "{query}". Try searching with different keywords.
        </p>
        <div className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
          <p>• Check your spelling</p>
          <p>• Try more general keywords</p>
          <p>• Search by author name or subject</p>
        </div>
      </div>
    );
  }

  const booksByCategory = books.reduce((acc, book) => {
    if (!acc[book.category]) {
      acc[book.category] = [];
    }
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
            isPurchased={purchasedBookIds.has(book.id)} />
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
                    isPurchased={purchasedBookIds.has(book.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-6 bg-muted rounded w-20 animate-pulse" />
          <div className="h-6 bg-muted rounded w-24 animate-pulse" />
          <div className="h-6 bg-muted rounded w-16 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="h-96">
            <div className="p-4">
              <div className="aspect-[3/4] bg-muted rounded-md mb-4 animate-pulse" />
              <div className="h-6 bg-muted rounded w-16 mb-2 animate-pulse" />
              <div className="h-5 bg-muted rounded w-full mb-2 animate-pulse" />
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const searchparams = await searchParams;
  const query = searchparams.query || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {query ? `Search Results` : 'Search Books'}
        </h1>
        {query && (
          <p className="text-muted-foreground">
            Showing results for "{query}"
          </p>
        )}
      </div>

      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults query={query} />
      </Suspense>

      <section className="mt-16">
        <h2 className="text-3xl font-bold mb-8">Browse by Subject</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            "Computer Science",
            "Mathematics",
            "Physics",
            "Chemistry",
            "Biology",
            "Psychology",
            "Business",
            "Engineering",
            "Literature",
            "History",
            "Economics",
            "Philosophy"
          ].map((category) => (
            <Link key={category} href={`/subjects/${encodeURIComponent(category)}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold text-sm">{category}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}