"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock } from "lucide-react"

interface BookingFormProps {
  quoteId: string
  serviceRequestId: string
  onSuccess: () => void
  onCancel: () => void
}

export function BookingForm({ quoteId, serviceRequestId, onSuccess, onCancel }: BookingFormProps) {
  const [formData, setFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Combine date and time
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)

      // Create booking
      const { error: bookingError } = await supabase.from("bookings").insert({
        quote_id: quoteId,
        scheduled_date: scheduledDateTime.toISOString(),
        notes: formData.notes,
        status: "scheduled",
      })

      if (bookingError) throw bookingError

      // Update service request status to 'booked'
      const { error: requestError } = await supabase
        .from("service_requests")
        .update({ status: "booked" })
        .eq("id", serviceRequestId)

      if (requestError) throw requestError

      onSuccess()
    } catch (error) {
      setError(error instanceof Error ? error.message : "خطایی رخ داده است")
    } finally {
      setIsLoading(false)
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">رزرو زمان</CardTitle>
        <CardDescription>زمان مناسب برای انجام کار را انتخاب کنید</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">تاریخ</Label>
              <div className="relative">
                <Input
                  id="scheduledDate"
                  type="date"
                  min={today}
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  required
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledTime">ساعت</Label>
              <div className="relative">
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  required
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">یادداشت (اختیاری)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="توضیحات اضافی برای تکنسین"
              rows={3}
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          <div className="flex justify-end space-x-3 space-x-reverse">
            <Button type="button" variant="outline" onClick={onCancel}>
              لغو
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "در حال رزرو..." : "رزرو زمان"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
