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
import { SignInSchema, SignInFormData } from "@/schemas/auth";
import { signInAction } from "@/app/actions/auth";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInInner() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/user";
  const [isDisabled, setIsDisabled] = useState(false);
  const router = useRouter();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignInFormData) {
    setIsDisabled(true);
    try {
      const result = await signInAction(values);
      if (result.success) {
        toast.success(result.message);
        router.push(redirect);
      } else {
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
          <CardTitle className="text-center">Sign In</CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <Button type="submit" className="w-full" disabled={isDisabled}>
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col justify-center">
          <p className="text-sm">Don't have an account?</p>
          <Link
            href={isDisabled ? "" : "/auth/signup"}
            className={`text-sm hover:underline ${isDisabled ? "pointer-events-none opacity-50" : ""}`}
          >
            Sign Up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}