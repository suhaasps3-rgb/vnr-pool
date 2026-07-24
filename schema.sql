-- VNR Pool - Supabase Database Schema
-- Run this script in your Supabase SQL Editor

-- 1. Create Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Users Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL CHECK (email ILIKE '%@vnrvjiet.in'),
    roll_no TEXT UNIQUE NOT NULL,
    branch TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    verified_status BOOLEAN DEFAULT false,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Function to set verified_status based on email
CREATE OR REPLACE FUNCTION set_verified_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email ILIKE '%@vnrvjiet.in' THEN
        NEW.verified_status := true;
    ELSE
        RAISE EXCEPTION 'Access Restricted: You must use a valid @vnrvjiet.in college email ID.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_verified_status
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION set_verified_status();


-- 3. Create Blocked Users Table
CREATE TABLE public.blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(blocker_id, blocked_id)
);

-- 4. Create Rides Table
CREATE TABLE public.rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ride_category TEXT CHECK (ride_category IN ('auto_split', 'personal_vehicle')),
    origin TEXT NOT NULL,
    destination TEXT NOT NULL DEFAULT 'VNR VJIET Campus Gate 1',
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    vehicle_type TEXT CHECK (vehicle_type IN ('bike', 'auto', 'car')),
    vehicle_number TEXT,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    price_per_seat INT DEFAULT 0,
    is_women_only BOOLEAN DEFAULT false,
    status TEXT CHECK (status IN ('active', 'in_progress', 'completed', 'cancelled')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create Bookings Table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(ride_id, passenger_id)
);

-- 6. Create Messages Table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Row Level Security (RLS) Policies

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users: Users can read all users (except ones that blocked them or they blocked), but can only update their own profile.
CREATE POLICY "Users can read non-blocked users" ON public.users
FOR SELECT USING (
    id NOT IN (
        SELECT blocked_id FROM public.blocked_users WHERE blocker_id = auth.uid()
        UNION
        SELECT blocker_id FROM public.blocked_users WHERE blocked_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);


-- Blocked Users: Users can manage their own blocks
CREATE POLICY "Users can read own blocks" ON public.blocked_users
FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others" ON public.blocked_users
FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others" ON public.blocked_users
FOR DELETE USING (auth.uid() = blocker_id);


-- Rides: Anyone can read active rides (except if blocked or if women_only policy applies)
CREATE POLICY "Users can read allowed rides" ON public.rides
FOR SELECT USING (
    driver_id NOT IN (
        SELECT blocked_id FROM public.blocked_users WHERE blocker_id = auth.uid()
        UNION
        SELECT blocker_id FROM public.blocked_users WHERE blocked_id = auth.uid()
    )
    AND
    (
        is_women_only = false
        OR 
        (is_women_only = true AND (SELECT gender FROM public.users WHERE id = auth.uid()) = 'female')
        OR
        driver_id = auth.uid()
    )
);

CREATE POLICY "Drivers can insert rides" ON public.rides
FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update own rides" ON public.rides
FOR UPDATE USING (auth.uid() = driver_id);


-- Bookings: Passengers can see own bookings, Drivers can see bookings for their rides
CREATE POLICY "Users can see relevant bookings" ON public.bookings
FOR SELECT USING (
    passenger_id = auth.uid() 
    OR 
    EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND driver_id = auth.uid())
);

CREATE POLICY "Passengers can create bookings" ON public.bookings
FOR INSERT WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Passengers can update own bookings to cancelled" ON public.bookings
FOR UPDATE USING (auth.uid() = passenger_id);

CREATE POLICY "Drivers can update bookings for their rides" ON public.bookings
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND driver_id = auth.uid())
);


-- Messages: Users part of the ride (driver or approved passenger) can read/insert messages
CREATE POLICY "Ride participants can read messages" ON public.messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.rides WHERE id = ride_id AND driver_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.bookings WHERE ride_id = messages.ride_id AND passenger_id = auth.uid() AND status = 'approved'
    )
);

CREATE POLICY "Ride participants can send messages" ON public.messages
FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND (
        EXISTS (
            SELECT 1 FROM public.rides WHERE id = ride_id AND driver_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.bookings WHERE ride_id = messages.ride_id AND passenger_id = auth.uid() AND status = 'approved'
        )
    )
);

-- Enable Realtime on tables
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.rides;
