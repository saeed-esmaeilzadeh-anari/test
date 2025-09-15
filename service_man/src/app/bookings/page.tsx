import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BookingsList } from "@/components/bookings/bookings-list"

export default async function BookingsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile to determine role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get bookings based on user role
  let bookingsQuery = supabase
    .from("bookings")
    .select(`
      *,
      quote:quotes(
        *,
        technician:technician_profiles(
          id,
          profile:profiles!technician_profiles_id_fkey(first_name, last_name, phone)
        ),
        service_request:service_requests(
          *,
          service:services(name, name_fa),
          customer:profiles!service_requests_customer_id_fkey(first_name, last_name, phone)
        )
      )
    `)
    .order("scheduled_date", { ascending: true })

  // Filter based on user role
  if (profile.role === "customer") {
    // Customer sees their own bookings
    bookingsQuery = bookingsQuery.eq("quote.service_request.customer_id", data.user.id)
  } else if (profile.role === "technician") {
    // Technician sees bookings for their quotes
    bookingsQuery = bookingsQuery.eq("quote.technician_id", data.user.id)
  }

  const { data: bookings } = await bookingsQuery

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">خدمت از ما</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">رزروهای من</h2>
          <p className="text-gray-600 mt-1">مدیریت رزروها و زمان‌بندی کارها</p>
        </div>

        <BookingsList bookings={bookings || []} userRole={profile.role} currentUserId={data.user.id} />
      </div>
    </div>
  )
}
