"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"

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
  description: string | null
  icon: string | null
  services: Service[]
}

interface ServiceCatalogProps {
  categories: ServiceCategory[]
}

export function ServiceCatalog({ categories }: ServiceCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      searchTerm === "" ||
      category.name_fa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.services.some((service) => service.name_fa.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === null || category.id === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="جستجو در خدمات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            همه
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name_fa}
            </Button>
          ))}
        </div>
      </div>

      {/* Service Categories */}
      <div className="space-y-8">
        {filteredCategories.map((category) => (
          <div key={category.id}>
            <div className="flex items-center mb-4">
              {category.icon && <span className="text-2xl ml-3">{category.icon}</span>}
              <div>
                <h3 className="text-xl font-bold text-gray-900">{category.name_fa}</h3>
                {category.description && <p className="text-gray-600 text-sm">{category.description}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.services
                .filter((service) =>
                  searchTerm === "" ? true : service.name_fa.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((service) => (
                  <Card key={service.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{service.name_fa}</CardTitle>
                          {service.description && (
                            <CardDescription className="mt-1">{service.description}</CardDescription>
                          )}
                        </div>
                        {service.base_price && (
                          <Badge variant="secondary" className="text-sm">
                            از {service.base_price.toLocaleString()} تومان
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full">
                        <Link href={`/request-service?service=${service.id}`}>درخواست خدمات</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">خدمتی یافت نشد</h3>
          <p className="text-gray-600">لطفاً کلمات کلیدی دیگری را امتحان کنید</p>
        </div>
      )}
    </div>
  )
}
