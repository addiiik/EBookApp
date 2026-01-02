import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import BookComponent from '@/components/ui/book';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUserAllPurchasedBooks } from '@/app/actions/user';
import { getUserFromToken } from '@/app/actions/auth';

export default async function LibraryPage() {
  const payload = await getUserFromToken();
  if (!payload) {
    redirect("/auth/signin");
  }

  const purchasedBooks = await getUserAllPurchasedBooks(payload.id)

  const categories = [...new Set(purchasedBooks.map(item => item.book.category))];

  const booksByCategory = purchasedBooks.reduce((acc, item) => {
    const category = item.book.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof purchasedBooks>);

  const sortedCategories = categories.sort();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Library</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {purchasedBooks.length} book{purchasedBooks.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {purchasedBooks.length > 0 ? (
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-semibold mb-6">All Books</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {purchasedBooks.map((item) => (
                  <div key={item.id} className="space-y-3">
                    <BookComponent 
                      book={item.book}
                      inLibrary={true}
                      purchasedAt={item.purchasedAt}
                      isPurchased={true}
                    />
                  </div>
                ))}
              </div>
            </div>

            {categories.length > 1 && (
              <div className="space-y-12">
                <hr className="my-8" />
                <h2 className="text-2xl font-semibold mb-6">Books by Category</h2>
                {sortedCategories.map((category) => (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-medium">{category}</h3>
                      <Badge variant="outline" className="text-xs">
                        {booksByCategory[category].length} book{booksByCategory[category].length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {booksByCategory[category].map((item) => (
                        <div key={`${category}-${item.id}`} className="space-y-3">
                          <BookComponent 
                            book={item.book}
                            inLibrary={true}
                            purchasedAt={item.purchasedAt}
                            isPurchased={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-3">Your library is empty</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start building your digital library by purchasing textbooks. 
                All your books will appear here for easy access.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button>Browse Books</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}