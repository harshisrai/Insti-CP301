'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DEPARTMENTS, BATCHES } from '@/lib/constants'

type UserRole = 'student' | 'faculty' | 'staff' | 'alumni'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'student' as UserRole,
    department: '',
    batch: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          department: formData.department || undefined,
          batch: formData.batch || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || 'Signup failed. Please try again.')
        return
      }

      router.push('/')
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-serif font-bold text-2xl text-center text-foreground">
          Create Account
        </CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          Join the IIT Ropar Community
        </p>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-foreground mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-foreground mb-2">
              User Type
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
              disabled={loading}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="staff">Staff</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-foreground mb-2">
              Department
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
              disabled={loading}
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Batch (for students/alumni) */}
          {(formData.role === 'student' || formData.role === 'alumni') && (
            <div>
              <label htmlFor="batch" className="block text-sm font-medium text-foreground mb-2">
                Batch
              </label>
              <select
                id="batch"
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                disabled={loading}
              >
                <option value="">Select batch</option>
                {BATCHES.map((batch) => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>
          )}

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                required
                minLength={8}
                disabled={loading}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-foreground mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                required
                minLength={8}
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={loading}
            disabled={loading}
          >
            Create Account
          </Button>
        </form>

        {/* Login link */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400">
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
