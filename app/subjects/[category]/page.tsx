import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
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

async function getBooksByCategory(category: string): Promise<Book[]> {
  return await prisma.book.findMany({
    where: {
      category: category
    },
    orderBy: {
      title: 'asc'
    }
  });
}

export default async function SubjectPage({ params }: { params: { category: string } }) {
  const cat_params = await params;
  const category = decodeURIComponent(cat_params.category);
  const session = await auth();

  const allCategories = [
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
    "Philosophy",
  ];

  if (!allCategories.includes(category)) {
    notFound();
  }

  const [books, purchasedBookIds] = await Promise.all([
    getBooksByCategory(category),
    getUserPurchasedBookIds(session?.user?.id || null)
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category}</h1>
        <p className="text-muted-foreground">
          {books.length} book{books.length !== 1 ? 's' : ''} available in this category
        </p>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No books found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookComponent 
              key={book.id} 
              book={book} 
              showWishlistButton
              isPurchased={purchasedBookIds.has(book.id)}
            />
          ))}
        </div>
      )}
      
      <section className="mt-16">
        <h2 className="text-3xl font-bold mb-8">Browse other categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {allCategories.map((cat) => (
            <Link key={cat} href={`/subjects/${encodeURIComponent(cat)}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold text-sm">{cat}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}