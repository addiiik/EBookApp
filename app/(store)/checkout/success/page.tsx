import { getUserFromToken } from "@/app/actions/auth";
import { validateCheckoutSession } from "@/app/actions/checkout";
import { Button } from "@/components/ui/button";
import { CheckCircle, Library, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CheckoutSuccess() {
  const payload = await getUserFromToken();
  if (!payload) redirect("/");

  const session = await validateCheckoutSession(payload.id)
  if (!session) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-linear-to-b from-green-50 to-white">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full blur-xl opacity-50"></div>
              <CheckCircle className="relative h-20 w-20 text-green-500" strokeWidth={2} />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Purchase Successful!
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Thank you for your purchase. Your e-books are now ready to read.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start space-x-3">
            <div className="shrink-0 mt-1">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Library className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Digital Delivery</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your e-books are now available in your library. 
                Access them anytime from any device.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <Button asChild className="w-full" size="lg">
            <Link href="/library" className="flex items-center justify-center">
              <Library className="h-4 w-4 mr-2" />
              View Library
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full" size="lg">
            <Link href="/" className="flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Browse More Books
            </Link>
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team or check your purchase history in your account.
          </p>
        </div>
      </div>
    </div>
  );
}