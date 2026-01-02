import { getUserCartItems } from "@/app/actions/user";
import { redirect } from "next/navigation";
import Checkout from "./checkout";
import { getUserFromToken } from "@/app/actions/auth";

export default async function CheckoutPage() {
  const payload = await getUserFromToken();
  if (!payload) {
    redirect("/auth/signin");
  }
  const cartItems = await getUserCartItems(payload.id);

  if (cartItems.length === 0) {
    redirect("/");
  }

  return (
    <Checkout cartItems={cartItems}/>
  );
}