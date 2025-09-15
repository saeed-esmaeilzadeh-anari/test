import { createClient } from "@/lib/supabase/server"
import { TechnicianDirectory } from "@/components/technicians/technician-directory"

export default async function TechniciansPage() {
  const supabase = await createClient()

  // Get verified technicians with their profiles and services
  const { data: technicians } = await supabase
    .from("technician_profiles")
    .select(`
      *,
      profile:profiles!technician_profiles_id_fkey(first_name, last_name, city),
      technician_services(
        service:services(id, name, name_fa, category:service_categories(name_fa)),
        custom_price
      )
    `)
    .eq("is_verified", true)
    .eq("is_available", true)
    .order("rating", { ascending: false })

  // Get service categories for filtering
  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name, name_fa")
    .eq("is_active", true)
    .order("name")

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">تکنسین‌های ما</h2>
          <p className="text-gray-600">بهترین متخصصان را برای نیازهای خود پیدا کنید</p>
        </div>

        <TechnicianDirectory technicians={technicians || []} categories={categories || []} />
      </div>
    </div>
  )
}
