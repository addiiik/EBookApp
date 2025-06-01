'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
    });
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleSignOut}
      className="flex items-center space-x-2"
    >
      <LogOut className="h-4 w-4" />
      <span>Sign Out</span>
    </Button>
  );
}