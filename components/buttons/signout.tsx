'use client';

import { signOutAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  async function handleSignOut() {
    try {
      const result = await signOutAction();
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      }
      else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error("Something went wrong");
    }
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