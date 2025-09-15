import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ServiceRequestDetails } from "@/components/service-request/service-request-details"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ServiceRequestPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get service request with related data
  const { data: serviceRequest, error: requestError } = await supabase
    .from("service_requests")
    .select(`
      *,
      service:services(name, name_fa, description, base_price),
      customer:profiles!service_requests_customer_id_fkey(first_name, last_name, phone),
      quotes(
        id,
        price,
        description,
        estimated_duration,
        is_accepted,
        created_at,
        technician:technician_profiles(
          id,
          bio,
          rating,
          total_jobs,
          profile:profiles!technician_profiles_id_fkey(first_name, last_name, phone)
        )
      )
    `)
    .eq("id", id)
    .single()

  if (requestError || !serviceRequest) {
    redirect("/dashboard")
  }

  // Check if user has access to this request
  const hasAccess =
    serviceRequest.customer_id === data.user.id || // Customer owns the request
    serviceRequest.quotes?.some((quote: any) => quote.technician.id === data.user.id) // Technician has quoted

  if (!hasAccess) {
    redirect("/dashboard")
  }

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
        <ServiceRequestDetails serviceRequest={serviceRequest} currentUser={data.user} />
      </div>
    </div>
  )
}
