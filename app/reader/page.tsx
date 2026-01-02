import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, BookMarked, CheckCircle2, Clock } from 'lucide-react';
import BookComponent from '@/components/ui/book';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUserAllPurchasedBooks } from '@/app/actions/user';
import { getUserFromToken } from '@/app/actions/auth';
import { getUserReadingProgresses } from '@/app/actions/reader';

export default async function ReaderPage() {
  const payload = await getUserFromToken();
  if (!payload) {
    redirect("/auth/signin");
  }

  const [purchasedBooks, readingProgresses] = await Promise.all([
    getUserAllPurchasedBooks(payload.id),
    getUserReadingProgresses(payload. id),
  ]);

  const progressMap = new Map(
    readingProgresses.map(p => [p.bookId, p])
  );

  const notStarted = purchasedBooks.filter(
    item => !progressMap.has(item.bookId)
  );

  const currentlyReading = purchasedBooks.filter(item => {
    const progress = progressMap.get(item.bookId);
    return progress && ! progress.finished && progress.page >= 1;
  });

  const finished = purchasedBooks.filter(item => {
    const progress = progressMap.get(item.bookId);
    return progress && progress.finished;
  });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-stone-800">
                My Reader
              </h1>
              <p className="text-stone-600">
                Continue your reading journey
              </p>
            </div>
            
            <div className="flex items-center">
              <Button asChild>
                <Link href="/user">Exit Reader</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {purchasedBooks.length > 0 ? (
            <>
              {currentlyReading.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold text-stone-800">
                      Currently Reading
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentlyReading. map((item) => {
                      return (
                        <div key={item.id} className="space-y-3">
                          <BookComponent 
                            book={item.book}
                            reader={true}
                            progress={progressMap.get(item.bookId)}
                            pages={item.book.pages}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {notStarted.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold text-stone-800">
                      Not Started
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {notStarted.map((item) => (
                      <div key={item.id} className="space-y-3">
                        <BookComponent 
                          book={item.book}
                          reader={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {finished.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold text-stone-800">
                      Finished
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {finished.map((item) => (
                      <div key={item.id} className="space-y-3">
                        <BookComponent 
                          book={item.book}
                          reader={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-3">No Books To Read Yet</h3>
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
    </div>
  );
}