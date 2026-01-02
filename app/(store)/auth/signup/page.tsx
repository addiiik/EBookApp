"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { SignUpSchema, SignUpFormData } from "@/schemas/auth";
import { signUpAction } from "@/app/actions/auth";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [isDisabled, setIsDisabled] = useState(false);
  const router = useRouter();
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
  });

  async function onSubmit(values: SignUpFormData) {
    setIsDisabled(true);
    try {
      const result = await signUpAction(values);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      }
      else {
        toast.error(result.message);
        setIsDisabled(false);
      }
    } catch (error: any) {
      toast.error("Something went wrong");
      setIsDisabled(false);
    }
  }

  return (
    <div className="container mx-auto px-2 py-12 max-w-md">
      <Card className="p-6 shadow-md border rounded-xl">
        <CardHeader>
          <CardTitle className="text-center">Sign Up</CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dutch" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isDisabled}>Sign Up</Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col justify-center">
          <p className="text-sm">Already have an account?</p>
          <Link href={isDisabled ? '' : '/auth/signin'} className={`text-sm hover:underline ${isDisabled ? 'pointer-events-none opacity-50' : ''}`}>Sign In</Link>
        </CardFooter>
      </Card>
    </div>
  );
}
