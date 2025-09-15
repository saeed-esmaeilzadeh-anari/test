-- Create enum types for user roles and service status
CREATE TYPE user_role AS ENUM ('customer', 'technician', 'admin');
CREATE TYPE service_status AS ENUM ('pending', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  address TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_fa TEXT NOT NULL, -- Persian name
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_fa TEXT NOT NULL, -- Persian name
  description TEXT,
  base_price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create technician profiles table
CREATE TABLE IF NOT EXISTS public.technician_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  service_areas TEXT[], -- Array of cities/areas they serve
  skills TEXT[], -- Array of skills
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_jobs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create technician services (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.technician_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES technician_profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  custom_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(technician_id, service_id)
);

-- Create service requests table
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  preferred_date TIMESTAMP WITH TIME ZONE,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  status service_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES technician_profiles(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  estimated_duration INTEGER, -- in hours
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES technician_profiles(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES technician_profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for service categories (public read)
CREATE POLICY "Anyone can view service categories" ON public.service_categories
  FOR SELECT USING (is_active = TRUE);

-- Create RLS policies for services (public read)
CREATE POLICY "Anyone can view services" ON public.services
  FOR SELECT USING (is_active = TRUE);

-- Create RLS policies for technician profiles
CREATE POLICY "Anyone can view verified technician profiles" ON public.technician_profiles
  FOR SELECT USING (is_verified = TRUE);

CREATE POLICY "Technicians can update their own profile" ON public.technician_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Technicians can insert their own profile" ON public.technician_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for technician services
CREATE POLICY "Anyone can view technician services" ON public.technician_services
  FOR SELECT USING (TRUE);

CREATE POLICY "Technicians can manage their own services" ON public.technician_services
  FOR ALL USING (auth.uid() = technician_id);

-- Create RLS policies for service requests
CREATE POLICY "Customers can view their own requests" ON public.service_requests
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Technicians can view pending requests" ON public.service_requests
  FOR SELECT USING (status = 'pending' OR status = 'quoted');

CREATE POLICY "Customers can create requests" ON public.service_requests
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own requests" ON public.service_requests
  FOR UPDATE USING (auth.uid() = customer_id);

-- Create RLS policies for quotes
CREATE POLICY "Customers can view quotes for their requests" ON public.quotes
  FOR SELECT USING (
    auth.uid() IN (
      SELECT customer_id FROM service_requests WHERE id = service_request_id
    )
  );

CREATE POLICY "Technicians can view their own quotes" ON public.quotes
  FOR SELECT USING (auth.uid() = technician_id);

CREATE POLICY "Technicians can create quotes" ON public.quotes
  FOR INSERT WITH CHECK (auth.uid() = technician_id);

CREATE POLICY "Technicians can update their own quotes" ON public.quotes
  FOR UPDATE USING (auth.uid() = technician_id);

-- Create RLS policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = technician_id);

CREATE POLICY "Customers can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = technician_id);

-- Create RLS policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (TRUE);

CREATE POLICY "Customers can create reviews for their bookings" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_service_requests_status ON public.service_requests(status);
CREATE INDEX idx_service_requests_city ON public.service_requests(city);
CREATE INDEX idx_technician_profiles_city ON public.technician_profiles USING GIN(service_areas);
CREATE INDEX idx_technician_services_technician ON public.technician_services(technician_id);
CREATE INDEX idx_quotes_service_request ON public.quotes(service_request_id);
CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX idx_bookings_technician ON public.bookings(technician_id);
CREATE INDEX idx_reviews_technician ON public.reviews(technician_id);
