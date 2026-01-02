'use client';

import { User, ShoppingCart, Heart, BookOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { SearchBar } from './searchbar';

interface NavbarProps {
  session?: any;
  wishlistCount: number;
  cartItemsCount: number;
}

export function Navbar({ wishlistCount, cartItemsCount }: NavbarProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center relative">
        <div className="hidden md:flex items-center w-full">
          <div className="flex items-center space-x-2 flex-1">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">E-Book Store</span>
            </Link>
          </div>

          <SearchBar />

          <div className="flex items-center space-x-4 flex-1 justify-end">
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="size-5!" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="size-5!" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/user">
              <Button variant="ghost" size="icon">
                <User className="size-5!" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex md:hidden items-center justify-between w-full">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-primary">E-Book Store</span>
          </Link>

          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={toggleMobileSearch}
            >
              <Search className="size-4!" />
            </Button>

            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <Heart className="size-4!" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <ShoppingCart className="size-4!" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/user">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <User className="size-4!" />
              </Button>
            </Link>
          </div>
        </div>

        <SearchBar 
          isMobile={true}
          showMobileSearch={showMobileSearch}
          onToggleMobileSearch={toggleMobileSearch}
        />
      </div>
    </nav>
  );
}