"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar } from "lucide-react"
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

interface Service {
  id: string
  name: string
  name_fa: string
  description: string | null
  base_price: number | null
}

interface ServiceCategory {
  id: string
  name: string
  name_fa: string
  services: Service[]
}

interface ServiceRequestFormProps {
  user: User
  profile: Profile
  categories: ServiceCategory[]
}

export function ServiceRequestForm({ user, profile, categories }: ServiceRequestFormProps) {
  const [formData, setFormData] = useState({
    categoryId: "",
    serviceId: "",
    title: "",
    description: "",
    address: profile.address || "",
    city: profile.city || "",
    preferredDate: "",
    budgetMin: "",
    budgetMax: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const selectedCategory = categories.find((cat) => cat.id === formData.categoryId)
  const availableServices = selectedCategory?.services || []

  const handleCategoryChange = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId,
      serviceId: "", // Reset service selection when category changes
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.from("service_requests").insert({
        customer_id: user.id,
        service_id: formData.serviceId,
        title: formData.title,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        preferred_date: formData.preferredDate ? new Date(formData.preferredDate).toISOString() : null,
        budget_min: formData.budgetMin ? Number.parseFloat(formData.budgetMin) : null,
        budget_max: formData.budgetMax ? Number.parseFloat(formData.budgetMax) : null,
        status: "pending",
      })

      if (error) throw error

      setMessage({ type: "success", text: "درخواست شما با موفقیت ثبت شد" })
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
            <CardTitle>درخواست خدمات</CardTitle>
            <CardDescription>جزئیات خدمات مورد نیاز خود را وارد کنید</CardDescription>
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
            <Label htmlFor="category">دسته‌بندی خدمات</Label>
            <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="دسته‌بندی را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name_fa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.categoryId && (
            <div className="space-y-2">
              <Label htmlFor="service">نوع خدمات</Label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="خدمات را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{service.name_fa}</span>
                        {service.base_price && (
                          <span className="text-sm text-gray-500 mr-2">
                            از {service.base_price.toLocaleString()} تومان
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">عنوان درخواست</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: تعمیر شیر آشپزخانه"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="جزئیات مشکل و نیازهای خود را شرح دهید"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">شهر</Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="تهران"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredDate">تاریخ مطلوب</Label>
              <div className="relative">
                <Input
                  id="preferredDate"
                  type="datetime-local"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">آدرس</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="آدرس کامل محل انجام خدمات"
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetMin">حداقل بودجه (تومان)</Label>
              <Input
                id="budgetMin"
                type="number"
                min="0"
                value={formData.budgetMin}
                onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                placeholder="100000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetMax">حداکثر بودجه (تومان)</Label>
              <Input
                id="budgetMax"
                type="number"
                min="0"
                value={formData.budgetMax}
                onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                placeholder="200000"
              />
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
            <Button type="submit" disabled={isLoading || !formData.serviceId}>
              {isLoading ? "در حال ثبت..." : "ثبت درخواست"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
