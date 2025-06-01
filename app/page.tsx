import { Card, CardContent } from '@/components/ui/card';
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

async function getFeaturedBooks(): Promise<Book[]> {
  'use server';

  const today = new Date().toISOString().split('T')[0];

  return await prisma.$queryRaw<Book[]>`
    SELECT * FROM "Book"
    ORDER BY md5(concat(${today}, "id"))
    LIMIT 4
  `;
}

export default async function Home() {
  const session = await auth();
  const featuredBooks = await getFeaturedBooks();
  
  const purchasedBookIds = await getUserPurchasedBookIds(session?.user?.id || null);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center py-12 mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Your Digital Library for Academic Excellence
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover thousands of e-books for your college courses. Affordable, accessible, and always available.
        </p>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-8">Featured Textbooks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBooks.map((book) => (
            <BookComponent 
              key={book.id} 
              book={book} 
              showWishlistButton 
              isPurchased={purchasedBookIds.has(book.id)}
            />
          ))}
        </div>
      </section>

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