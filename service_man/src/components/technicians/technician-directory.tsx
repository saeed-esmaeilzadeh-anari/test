"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, MapPin, User, Search } from "lucide-react"
import Link from "next/link"

interface TechnicianService {
  service: {
    id: string
    name: string
    name_fa: string
    category: {
      name_fa: string
    }
  }
  custom_price: number | null
}

interface Technician {
  id: string
  bio: string | null
  experience_years: number
  hourly_rate: number | null
  service_areas: string[]
  rating: number
  total_jobs: number
  profile: {
    first_name: string
    last_name: string
    city: string
  }
  technician_services: TechnicianService[]
}

interface ServiceCategory {
  id: string
  name: string
  name_fa: string
}

interface TechnicianDirectoryProps {
  technicians: Technician[]
  categories: ServiceCategory[]
}

export function TechnicianDirectory({ technicians, categories }: TechnicianDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedCity, setSelectedCity] = useState<string>("all")

  // Get unique cities from technicians
  const cities = Array.from(new Set(technicians.flatMap((tech) => tech.service_areas))).sort()

  const filteredTechnicians = technicians.filter((technician) => {
    const matchesSearch =
      searchTerm === "" ||
      `${technician.profile.first_name} ${technician.profile.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      technician.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technician.technician_services.some((ts) => ts.service.name_fa.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory =
      selectedCategory === "all" ||
      technician.technician_services.some((ts) => ts.service.category.name_fa === selectedCategory)

    const matchesCity = selectedCity === "all" || technician.service_areas.includes(selectedCity)

    return matchesSearch && matchesCategory && matchesCity
  })

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="جستجو در تکنسین‌ها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="دسته‌بندی خدمات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه دسته‌ها</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name_fa}>
                {category.name_fa}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="شهر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه شهرها</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Technicians Grid */}
      {filteredTechnicians.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👷</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">تکنسینی یافت نشد</h3>
          <p className="text-gray-600">لطفاً فیلترهای خود را تغییر دهید</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTechnicians.map((technician) => (
            <Card key={technician.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {technician.profile.first_name} {technician.profile.last_name}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Star className="h-3 w-3 text-yellow-400 ml-1" />
                        <span>{technician.rating.toFixed(1)}</span>
                        <span className="mx-2">•</span>
                        <span>{technician.total_jobs} کار</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="default">تأیید شده</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {technician.bio && <p className="text-gray-600 text-sm line-clamp-2">{technician.bio}</p>}

                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 ml-2" />
                  <span>{technician.service_areas.join(", ")}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">سابقه کار:</span>
                    <span className="font-medium">{technician.experience_years} سال</span>
                  </div>
                  {technician.hourly_rate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">نرخ ساعتی:</span>
                      <span className="font-medium">{technician.hourly_rate.toLocaleString()} تومان</span>
                    </div>
                  )}
                </div>

                {technician.technician_services.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">خدمات:</h4>
                    <div className="flex flex-wrap gap-1">
                      {technician.technician_services.slice(0, 3).map((ts) => (
                        <Badge key={ts.service.id} variant="secondary" className="text-xs">
                          {ts.service.name_fa}
                        </Badge>
                      ))}
                      {technician.technician_services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{technician.technician_services.length - 3} مورد دیگر
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button asChild className="w-full">
                  <Link href={`/technician/${technician.id}`}>مشاهده پروفایل</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
