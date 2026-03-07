'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading, error: authError } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await signIn({
        email: formData.email,
        password: formData.password,
      });
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-serif text-center text-foreground">
          Welcome Back
        </CardTitle>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Sign in to your IIT Ropar account
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error message */}
          {(error || authError) && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-300 text-sm">
              {error || authError}
            </div>
          )}

          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-input focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-transparent transition-all">
              <Mail size={18} className="text-muted-foreground" />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-input focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-transparent transition-all">
              <Lock size={18} className="text-muted-foreground" />
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={isSubmitting || loading}
            disabled={isSubmitting || loading}
          >
            Sign In
          </Button>

          {/* Forgot password link */}
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </form>

        {/* Sign up link */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/signup" className="font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400">
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
