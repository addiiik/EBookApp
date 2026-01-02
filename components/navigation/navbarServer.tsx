import { getUserFromToken } from "@/app/actions/auth";
import { Navbar } from "./navbarClient";
import { getUserCartItemCount, getUserWishlistCount } from "@/app/actions/user";

export async function NavbarServer() {
  const payload = await getUserFromToken();

  const [wishlistCount, cartItemsCount] = payload
    ? await Promise.all([
        getUserWishlistCount(payload.id),
        getUserCartItemCount(payload.id),
      ])
    : [0, 0];

  return <Navbar wishlistCount={wishlistCount} cartItemsCount={cartItemsCount} />;
}