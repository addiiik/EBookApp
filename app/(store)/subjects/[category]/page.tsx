import { getUserFromToken } from "@/app/actions/auth";
import { checkManyBooksPurchased, getBooksByCategory } from "@/app/actions/book";
import BookComponent from "@/components/ui/book";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SubjectPage({ params }: { params: { category: string } }) {
  const cat_params = await params;
  const category = decodeURIComponent(cat_params.category);

  const books = await getBooksByCategory(category);
  const payload = await getUserFromToken();
  const purchasedBookIds = payload
  ? await checkManyBooksPurchased(payload.id, books.map((b) => b.id))
  : new Set();

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
