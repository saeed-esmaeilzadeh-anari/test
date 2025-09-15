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
import { Switch } from "@/components/ui/switch"
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

interface TechnicianProfile {
  id: string
  bio: string | null
  experience_years: number
  hourly_rate: number | null
  service_areas: string[]
  skills: string[]
  is_verified: boolean
  is_available: boolean
  rating: number
  total_jobs: number
}

interface User {
  id: string
  email: string
}

interface Service {
  id: string
  name: string
  name_fa: string
}

interface ServiceCategory {
  id: string
  name: string
  name_fa: string
  services: Service[]
}

interface TechnicianService {
  service_id: string
  custom_price: number | null
}

interface TechnicianProfileFormProps {
  user: User
  profile: Profile
  technicianProfile: TechnicianProfile | null
  categories: ServiceCategory[]
  technicianServices: TechnicianService[]
}

export function TechnicianProfileForm({
  user,
  profile,
  technicianProfile,
  categories,
  technicianServices,
}: TechnicianProfileFormProps) {
  const [formData, setFormData] = useState({
    bio: technicianProfile?.bio || "",
    experienceYears: technicianProfile?.experience_years || 0,
    hourlyRate: technicianProfile?.hourly_rate || 0,
    serviceAreas: technicianProfile?.service_areas || [profile.city || ""].filter(Boolean),
    skills: technicianProfile?.skills || [],
    isAvailable: technicianProfile?.is_available ?? true,
    selectedServices: technicianServices.map((ts) => ts.service_id) || [],
    servicePrices: technicianServices.reduce(
      (acc, ts) => ({
        ...acc,
        [ts.service_id]: ts.custom_price || "",
      }),
      {} as Record<string, string | number>,
    ),
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

  const handleServicePriceChange = (serviceId: string, price: string) => {
    setFormData((prev) => ({
      ...prev,
      servicePrices: {
        ...prev.servicePrices,
        [serviceId]: price,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // Update or create technician profile
      const profileData = {
        id: user.id,
        bio: formData.bio,
        experience_years: formData.experienceYears,
        hourly_rate: formData.hourlyRate,
        service_areas: formData.serviceAreas,
        skills: formData.skills,
        is_available: formData.isAvailable,
      }

      if (technicianProfile) {
        const { error: profileError } = await supabase.from("technician_profiles").update(profileData).eq("id", user.id)

        if (profileError) throw profileError
      } else {
        const { error: profileError } = await supabase.from("technician_profiles").insert({
          ...profileData,
          is_verified: false,
          rating: 0,
          total_jobs: 0,
        })

        if (profileError) throw profileError
      }

      // Update technician services
      // First, delete existing services
      await supabase.from("technician_services").delete().eq("technician_id", user.id)

      // Then, insert new services
      if (formData.selectedServices.length > 0) {
        const servicesToInsert = formData.selectedServices.map((serviceId) => ({
          technician_id: user.id,
          service_id: serviceId,
          custom_price: formData.servicePrices[serviceId]
            ? Number.parseFloat(formData.servicePrices[serviceId] as string)
            : null,
        }))

        const { error: servicesError } = await supabase.from("technician_services").insert(servicesToInsert)

        if (servicesError) throw servicesError
      }

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
            <CardTitle>اطلاعات تکنسین</CardTitle>
            <CardDescription>اطلاعات حرفه‌ای خود را ویرایش کنید</CardDescription>
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

          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id="isAvailable"
              checked={formData.isAvailable}
              onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
            />
            <Label htmlFor="isAvailable">در دسترس برای کار جدید</Label>
          </div>

          <div className="space-y-4">
            <Label>خدمات و قیمت‌گذاری</Label>
            {categories.map((category) => (
              <div key={category.id} className="space-y-3">
                <h4 className="font-medium text-gray-900">{category.name_fa}</h4>
                <div className="grid grid-cols-1 gap-3 pl-4">
                  {category.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between space-x-3 space-x-reverse">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={service.id}
                          checked={formData.selectedServices.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                        />
                        <Label htmlFor={service.id} className="text-sm font-normal">
                          {service.name_fa}
                        </Label>
                      </div>
                      {formData.selectedServices.includes(service.id) && (
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Input
                            type="number"
                            min="0"
                            placeholder="قیمت (تومان)"
                            value={formData.servicePrices[service.id] || ""}
                            onChange={(e) => handleServicePriceChange(service.id, e.target.value)}
                            className="w-32 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
