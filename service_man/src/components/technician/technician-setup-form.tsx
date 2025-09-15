"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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

interface ServiceCategory {
  id: string
  name: string
  name_fa: string
}

interface TechnicianSetupFormProps {
  user: User
  profile: Profile
  categories: ServiceCategory[]
}

export function TechnicianSetupForm({ user, profile, categories }: TechnicianSetupFormProps) {
  const [formData, setFormData] = useState({
    bio: "",
    experienceYears: 0,
    hourlyRate: 0,
    serviceAreas: [profile.city || ""].filter(Boolean),
    skills: [] as string[],
    selectedServices: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // Create technician profile
      const { error: profileError } = await supabase.from("technician_profiles").insert({
        id: user.id,
        bio: formData.bio,
        experience_years: formData.experienceYears,
        hourly_rate: formData.hourlyRate,
        service_areas: formData.serviceAreas,
        skills: formData.skills,
        is_verified: false,
        is_available: true,
      })

      if (profileError) throw profileError

      setMessage({ type: "success", text: "پروفایل تکنسین با موفقیت ایجاد شد" })
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
            <CardTitle>اطلاعات تکنسین</CardTitle>
            <CardDescription>اطلاعات حرفه‌ای خود را وارد کنید</CardDescription>
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
          <div className="space-y-2">
            <Label htmlFor="bio">درباره من</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="خودتان و تخصص‌هایتان را معرفی کنید"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experienceYears">سابقه کار (سال)</Label>
              <Input
                id="experienceYears"
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: Number.parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">نرخ ساعتی (تومان)</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: Number.parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceAreas">مناطق خدمات‌رسانی</Label>
            <Input
              id="serviceAreas"
              type="text"
              value={formData.serviceAreas.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  serviceAreas: e.target.value.split(",").map((area) => area.trim()),
                })
              }
              placeholder="تهران, کرج, اسلامشهر"
            />
            <p className="text-xs text-gray-500">شهرها را با کاما از هم جدا کنید</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">مهارت‌ها</Label>
            <Input
              id="skills"
              type="text"
              value={formData.skills.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  skills: e.target.value.split(",").map((skill) => skill.trim()),
                })
              }
              placeholder="تعمیر لوله، نصب شیر آلات، تعمیر توالت"
            />
            <p className="text-xs text-gray-500">مهارت‌ها را با کاما از هم جدا کنید</p>
          </div>

          <div className="space-y-3">
            <Label>دسته‌بندی خدمات</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={category.id}
                    checked={formData.selectedServices.includes(category.id)}
                    onCheckedChange={() => handleServiceToggle(category.id)}
                  />
                  <Label htmlFor={category.id} className="text-sm font-normal">
                    {category.name_fa}
                  </Label>
                </div>
              ))}
            </div>
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
              {isLoading ? "در حال ذخیره..." : "ایجاد پروفایل"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
