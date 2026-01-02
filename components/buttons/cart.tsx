'use client'
import { toggleBookCartState } from '@/app/actions/book';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CartButtonProps {
  bookId: string;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  showText?: boolean;
  cartState?: boolean;
}

export default function CartButton({ 
  bookId, 
  size = "default", 
  className = "",
  variant = "default",
  showText = true,
  cartState = false,
}: CartButtonProps) {

  const router = useRouter();
  async function handleToggle() {
    try {
      const result = await toggleBookCartState(bookId);
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
      variant={cartState ? "outline" : variant}
      size={size}
      onClick={handleToggle}
      className={className}
    >
      {cartState ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          {showText && "In Cart"}
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          {showText && "Add to Cart"}
        </>
      )}
    </Button>
  );
}