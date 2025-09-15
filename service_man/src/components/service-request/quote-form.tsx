"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface QuoteFormProps {
  serviceRequestId: string
  technicianId: string
  onSuccess: () => void
  onCancel: () => void
}

export function QuoteForm({ serviceRequestId, technicianId, onSuccess, onCancel }: QuoteFormProps) {
  const [formData, setFormData] = useState({
    price: "",
    description: "",
    estimatedDuration: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from("quotes").insert({
        service_request_id: serviceRequestId,
        technician_id: technicianId,
        price: Number.parseFloat(formData.price),
        description: formData.description,
        estimated_duration: formData.estimatedDuration ? Number.parseInt(formData.estimatedDuration) : null,
      })

      if (error) throw error

      // Update service request status to 'quoted'
      await supabase.from("service_requests").update({ status: "quoted" }).eq("id", serviceRequestId)

      onSuccess()
    } catch (error) {
      setError(error instanceof Error ? error.message : "خطایی رخ داده است")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">ارسال پیشنهاد قیمت</CardTitle>
        <CardDescription>پیشنهاد خود را برای این درخواست ارسال کنید</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">قیمت پیشنهادی (تومان)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="150000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">مدت زمان تخمینی (ساعت)</Label>
              <Input
                id="estimatedDuration"
                type="number"
                min="1"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                placeholder="2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="جزئیات کار، مواد مورد نیاز، و سایر توضیحات"
              rows={3}
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          <div className="flex justify-end space-x-3 space-x-reverse">
            <Button type="button" variant="outline" onClick={onCancel}>
              لغو
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "در حال ارسال..." : "ارسال پیشنهاد"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
