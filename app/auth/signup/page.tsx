import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { auth, signIn } from '@/auth';
import { signupUser } from '@/lib/auth/AuthSignup';
import { redirect } from 'next/navigation';

export default async function SignupPage() {
  const session = await auth();
  
  if (session?.user?.id) {
    redirect(`/`);
  }

  async function handleSignup(formData: FormData) {
    'use server';

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    try {
      await signupUser({ name, email, password, confirmPassword });
    } catch (error) {
      redirect('/auth/signup')
    }
    try {
      await signIn('credentials', {
        email,
        password,
        redirectTo: '/',
      });
    } catch (error) {
      redirect('/auth/signin')
    }
  }
  return (
    <div className="container mx-auto px-4 py-8 max-w-md justify-center">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Sign up to start building your library</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" type="text" placeholder="Your name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Email address" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter password" required />
            </div>
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
