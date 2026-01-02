import { Card } from '@/components/ui/card';

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-6 bg-muted rounded w-20 animate-pulse" />
          <div className="h-6 bg-muted rounded w-24 animate-pulse" />
          <div className="h-6 bg-muted rounded w-16 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="h-96">
            <div className="p-4">
              <div className="aspect-3/4 bg-muted rounded-md mb-4 animate-pulse" />
              <div className="h-6 bg-muted rounded w-16 mb-2 animate-pulse" />
              <div className="h-5 bg-muted rounded w-full mb-2 animate-pulse" />
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
