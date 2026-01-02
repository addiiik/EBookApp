import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from "next/navigation";
import { BookOpen, Calendar, Library, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import BookComponent from '@/components/ui/book';
import SignOutButton from '@/components/buttons/signout';
import { formatPricePLN } from '@/lib/utils';
import { getUserFromToken } from '@/app/actions/auth';
import { getUserAllPurchasedBooks, getUserInfo } from '@/app/actions/user';
import { getUserReadingProgresses } from '@/app/actions/reader';

export default async function UserPage() {
  const payload = await getUserFromToken();

  if (!payload) {
    redirect("/auth/signin");
  }

  const [ user, purchasedBooks, readingProgresses ] = await Promise.all([
    getUserInfo(payload.id),
    getUserAllPurchasedBooks(payload.id),
    getUserReadingProgresses(payload.id),
  ]);

  if (!user) {
    redirect("/auth/signin");
  }

  const latestPurchase = purchasedBooks[0];
  const totalSpent = purchasedBooks.reduce((sum, item) => 
    sum + (item.book.discountedPrice || item.book.price), 0
  );

  const startedBooksCount = readingProgresses.length;

  let quickActionLabel = 'View My Library';
  let quickActionHref = '/library';

  if (startedBooksCount === 1 && !readingProgresses[0].finished) {
    quickActionLabel = 'Resume Reading';
    quickActionHref = `/reader/${readingProgresses[0].bookId}`;
  } else if (startedBooksCount === 1 && readingProgresses[0].finished) {
    quickActionLabel = 'Open Reader';
    quickActionHref = '/reader';
  } else if (startedBooksCount > 1) {
    quickActionLabel = 'Open Reader';
    quickActionHref = '/reader';
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <SignOutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books Owned</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchasedBooks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPricePLN(totalSpent)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Purchase</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestPurchase ? new Date(latestPurchase.purchasedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href={quickActionHref} className="block">
              <Button className="w-full">{quickActionLabel}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {purchasedBooks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Latest Purchases</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {purchasedBooks.slice(0, 4).map((purchase) => (
              <BookComponent 
                key={purchase.id}
                book={purchase.book}
                inLibrary={true}
                purchasedAt={purchase.purchasedAt}
                isPurchased={true}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Actions</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <Library className="w-8 h-8 mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Browse Your Library</h3>
              <p className="text-muted-foreground mb-4">
                Access all your purchased books and read them anytime.
              </p>
              <Link href="/library">
                <Button>Open Library</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <BookOpen className="w-8 h-8 mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Read Your Books</h3>
              <p className="text-muted-foreground mb-4">
                Open your reader and dive into your collection of textbooks.
              </p>
              <Link href="/reader">
                <Button variant="outline">Open Reader</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}