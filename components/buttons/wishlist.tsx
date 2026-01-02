'use client';

import { toggleWishlistState } from '@/app/actions/book';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useRouter } from "next/navigation";
import { toast } from 'sonner';

interface WishlistButtonProps {
  bookId: string;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  wishlistState?: boolean;
}

export default function WishlistButton({ 
  bookId, 
  size = "default", 
  className = "",
  wishlistState = false,
}: WishlistButtonProps) {

  const router = useRouter();
  async function handleToggle() {
    try {
      const result = await toggleWishlistState(bookId);
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
      variant={"outline"} 
      size={size}
      onClick={handleToggle}
      className={className}
    >
      <Heart className={`w-4 h-4 ${wishlistState ? 'fill-current' : ''}`} />
    </Button>
  );
}