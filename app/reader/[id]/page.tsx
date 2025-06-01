import { auth } from "@/auth";
import { checkIfBookPurchased } from "@/lib/book/BookUtils";
import { prisma } from '@/lib/prisma';
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

async function getBook(id: string) {
  'use server'
  return await prisma.book.findUnique({
    where: {
      id: id
    }
  });
}

const loremIpsumContent = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed ullamcorper sit amet arcu id lobortis. Phasellus elementum mauris ut lacus mattis congue. 
Sed efficitur lobortis odio, vel mattis est viverra sit amet. Sed laoreet ultrices varius. 
Proin fermentum nibh lectus, non pellentesque lectus rutrum id. Maecenas vel lacus vel eros cursus iaculis consequat quis eros. 
Donec dictum hendrerit viverra. Quisque id varius urna. Phasellus iaculis turpis vel eros euismod scelerisque. 
Aliquam pellentesque consectetur diam. Pellentesque eget urna id sem lobortis feugiat a id dolor. 
Aenean eu justo tincidunt nulla commodo consequat. Nunc ac tincidunt dolor. 
Etiam pulvinar suscipit libero et dapibus. 
Nulla eget ipsum ac est placerat luctus. 
Sed neque nisi, tempor eu tellus eu, sagittis vulputate arcu.`;

export default async function ReadPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await auth();

  const book = await getBook(id);
  if (!book) {
    redirect('/');
  }

  if (!session?.user?.id) {
    redirect(`/auth/signin?redirect=/reader/${book.id}`);
  }

  const isPurchased = await checkIfBookPurchased(session.user.id, book.id);

  if (!isPurchased) {
    redirect(`/auth/signin?redirect=/book/${book.id}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <div className="h-4 w-px bg-border" />
              <div>
                <h1 className="font-semibold text-lg">{book.title}</h1>
                <p className="text-sm text-muted-foreground">by {book.author}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="lg:col-span-9">
          <Card>
            <CardContent className="p-0">
              <div className="max-w-4xl mx-auto p-8 lg:p-12">
                <div className="prose prose-lg max-w-none leading-relaxed text-justify">
                  {loremIpsumContent.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-6 text-foreground/90 leading-8 first-letter:text-4xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:leading-8">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center max-w-4xl mx-auto">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous Page</span>
                  </Button>
                  
                  <div className="flex space-x-4 text-sm text-muted-foreground">
                    <span>Page 1 of {book.pages}</span>
                  </div>
                  
                  <Button variant="ghost" className="flex space-x-2">
                    <span className="hidden sm:inline">Next Page</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}