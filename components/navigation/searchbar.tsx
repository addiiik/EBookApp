'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarClientProps {
  isMobile?: boolean;
  showMobileSearch?: boolean;
  onToggleMobileSearch?: () => void;
}

export function SearchBar({ 
  isMobile = false, 
  showMobileSearch = false, 
  onToggleMobileSearch 
}: SearchBarClientProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&limit=4`);
      const data = await res.json();
      setResults(data);
      setShowResults(true);
    }, 300);
  }, [query]);
  
  useEffect(() => {
    if (showMobileSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showMobileSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!query) {
        return;
      }
      setShowResults(false);
      router.push(`/search?query=${encodeURIComponent(query)}`);
      setQuery('');
      if (isMobile && onToggleMobileSearch) {
        onToggleMobileSearch();
      }
    }
    if (e.key === 'Escape' && isMobile && onToggleMobileSearch) {
      onToggleMobileSearch();
      setQuery('');
      setShowResults(false);
    }
  };

  const handleSearchClick = (bookId: string) => {
    setShowResults(false);
    router.push(`/book/${bookId}`);
    if (isMobile && onToggleMobileSearch) {
      onToggleMobileSearch();
    }
  };

  const handleViewAllResults = () => {
    setShowResults(false);
    router.push(`/search?query=${encodeURIComponent(query)}`);
    setQuery('');
    if (isMobile && onToggleMobileSearch) {
      onToggleMobileSearch();
    }
  };

  if (isMobile) {
    return (
      <div className={`absolute inset-0 bg-background z-50 transition-transform duration-200 ${
        showMobileSearch ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="container mx-auto px-4 h-16 flex items-center">
          <div className="flex-1 relative mr-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search for books, authors or subjects"
              className="pl-11 w-full focus-visible:ring-1"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => results.length > 0 && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
            />
            {showResults && results.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-10 overflow-hidden">
                {results.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => handleSearchClick(book.id)}
                    className="block px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="font-semibold text-sm truncate">{book.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {book.author} • {book.category}
                    </div>
                  </div>
                ))}
                {results.length >= 4 && (
                  <div 
                    onClick={handleViewAllResults}
                    className="px-4 py-3 text-center text-sm text-primary hover:bg-gray-50 cursor-pointer border-t bg-gray-50/50"
                  >
                    View all results for "{query}"
                  </div>
                )}
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={onToggleMobileSearch}
          >
            <X className="size-4!" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 md:max-w-md relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
      <Input
        type="search"
        placeholder="Search for books, authors or subjects"
        className="pl-11 w-full focus-visible:ring-1"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
      />
      {showResults && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-10 overflow-hidden">
          {results.map((book) => (
            <div
              key={book.id}
              onClick={() => handleSearchClick(book.id)}
              className="block px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
            >
              <div className="font-semibold text-sm truncate">{book.title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {book.author} • {book.category}
              </div>
            </div>
          ))}
          {results.length >= 4 && (
            <div 
              onClick={handleViewAllResults}
              className="px-4 py-3 text-center text-sm text-primary hover:bg-gray-50 cursor-pointer border-t bg-gray-50/50"
            >
              View all results for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}