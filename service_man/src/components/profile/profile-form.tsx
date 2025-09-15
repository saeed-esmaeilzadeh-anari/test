"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Profile {
  id: string
  role: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  address: string | null
  city: string | null
}

interface User {
  id: string
  email: string
}

interface ProfileFormProps {
  user: User
  profile: Profile
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    firstName: profile.first_name || "",
    lastName: profile.last_name || "",
    phone: profile.phone || "",
    address: profile.address || "",
    city: profile.city || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setMessage({ type: "success", text: "پروفایل با موفقیت به‌روزرسانی شد" })
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "خطایی رخ داده است",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>اطلاعات شخصی</CardTitle>
            <CardDescription>اطلاعات حساب کاربری خود را ویرایش کنید</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 ml-2" />
              بازگشت
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">نام</Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">نام خانوادگی</Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input id="email" type="email" value={user.email} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-500">ایمیل قابل تغییر نیست</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">شماره تلفن</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="09123456789"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">شهر</Label>
            <Input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="تهران"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">آدرس</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="آدرس کامل خود را وارد کنید"
              rows={3}
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex justify-end space-x-4 space-x-reverse">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard">لغو</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
