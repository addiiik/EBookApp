import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Library, Calendar, TrendingUp } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import BookComponent from '@/components/BookComponent';
import SignOutButton from '@/components/buttons/SignOutButton';
import Link from 'next/link';

async function getUserData(userId: string) {
  'use server'
  const [user, purchasedBooks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
    }),
    prisma.purchasedBook.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { purchasedAt: 'desc' },
      take: 4
    }),
  ]);

  return { user, purchasedBooks };
}

export default async function UserPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin?redirect=/user');
  }

  const { user, purchasedBooks } = await getUserData(session.user.id);

  if (!user) {
    redirect('/auth/signin?redirect=/user');
  }

  const latestPurchase = purchasedBooks[0];
  const totalSpent = purchasedBooks.reduce((sum, item) => 
    sum + (item.book.discountedPrice || item.book.price), 0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name || 'User'}!</h1>
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
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Purchase</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestPurchase ? new Date(latestPurchase.purchasedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/library" className="block">
              <Button className="w-full">View My Library</Button>
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
          <h2 className="text-2xl font-bold">Quick Actions</h2>
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
              <h3 className="text-lg font-semibold mb-2">Discover New Books</h3>
              <p className="text-muted-foreground mb-4">
                Explore our collection of textbooks and expand your library.
              </p>
              <Link href="/">
                <Button variant="outline">Browse Books</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}