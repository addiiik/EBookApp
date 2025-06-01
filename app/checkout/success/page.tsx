import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, Library, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface CheckoutSuccessPageProps {
  searchParams: {
    books?: string;
  };
}

async function getPurchasedBooks(bookIds: string[]) {
  return prisma.book.findMany({
    where: {
      id: { in: bookIds }
    },
    orderBy: { title: 'asc' }
  });
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const session = await auth();
  const searchparams = await searchParams;

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }
  const bookIdsParam = searchparams.books;
  if (!bookIdsParam) {
    redirect('/library');
  }

  const bookIds = bookIdsParam.split(',');
  const purchasedBooks = await getPurchasedBooks(bookIds);

  if (purchasedBooks.length === 0) {
    redirect('/library');
  }

  const totalPrice = purchasedBooks.reduce((total, book) => {
    const price = book.discountedPrice ?? book.price;
    return total + price;
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Purchase Successful!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your ebooks are now available in your library.
          </p>
        </div>

        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Order Summary</h2>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Completed
            </Badge>
          </div>

          <div className="space-y-3 mb-4">
            {purchasedBooks.map((book) => {
              const price = book.discountedPrice ?? book.price;
              const hasDiscount = book.discountedPrice !== null;
              
              return (
                <div key={book.id} className="flex justify-between items-start py-3 border-b last:border-b-0">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm truncate pr-4">{book.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      by {book.author} • {book.category}
                    </p>
                    <div className="flex items-center mt-2">
                      <Download className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600 font-medium">Ready for download</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {hasDiscount ? (
                      <div>
                        <span className="text-sm font-semibold">${price.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground line-through ml-2">
                          ${book.price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold">${price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Paid</span>
              <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Download className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Digital Delivery</h3>
              <p className="text-sm text-blue-700">
                Your ebooks are now available for immediate download in your library. 
                You can access them anytime from any device.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1" size="lg">
            <Link href="/library">
              <Library className="h-4 w-4 mr-2" />
              View Library
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="flex-1" size="lg">
            <Link href="/books">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Browse More Books
            </Link>
          </Button>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Need help? Contact our support team or check your purchase history in your account.
          </p>
        </div>
      </div>
    </div>
  );
}