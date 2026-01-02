import { Suspense } from "react";
import SearchResults from "./searchServer";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SearchResultsSkeleton } from "./searchSkeleton";

interface SearchPageProps {
  searchParams: { query?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params?.query || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {query ? 'Search Results' : 'Search Books'}
        </h1>
        {query && (
          <p className="text-muted-foreground">Showing results for "{query}"</p>
        )}
      </div>

      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults query={query} />
      </Suspense>

      <section className="mt-16">
        <h2 className="text-3xl font-bold mb-8">Browse by Subject</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            'Computer Science','Mathematics','Physics','Chemistry','Biology',
            'Psychology','Business','Engineering','Literature','History',
            'Economics','Philosophy'
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
