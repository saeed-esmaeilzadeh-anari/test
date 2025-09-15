"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Shield, Mail, Lock, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-secondary p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 space-x-reverse mb-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-soft">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">خدمت از ما</h1>
          </div>
          <p className="text-muted-foreground">به پلتفرم معتبر خدمات خانگی خوش آمدید</p>
        </div>

        <Card className="shadow-medium border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-foreground">ورود به سیستم</CardTitle>
            <CardDescription className="text-muted-foreground">برای ادامه وارد حساب کاربری خود شوید</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  ایمیل
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10 text-right border-border focus:ring-2 focus:ring-primary/20"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  رمز عبور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 border-border focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full gradient-primary shadow-soft hover:shadow-medium transition-all py-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>در حال ورود...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span>ورود</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>
            <div className="mt-8 text-center text-sm">
              <span className="text-muted-foreground">حساب کاربری ندارید؟ </span>
              <Link href="/auth/register" className="text-primary hover:text-accent font-medium transition-colors">
                ثبت نام کنید
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
