import { createClient } from "@/lib/supabase/server"
import { ServiceCatalog } from "@/components/services/service-catalog"

export default async function ServicesPage() {
  const supabase = await createClient()

  // Get service categories and services
  const { data: categories } = await supabase
    .from("service_categories")
    .select(`
      id,
      name,
      name_fa,
      description,
      icon,
      services (
        id,
        name,
        name_fa,
        description,
        base_price
      )
    `)
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">خدمات ما</h2>
          <p className="text-gray-600">انواع خدمات خانگی و تخصصی را مرور کنید</p>
        </div>

        <ServiceCatalog categories={categories || []} />
      </div>
    </div>
  )
}
