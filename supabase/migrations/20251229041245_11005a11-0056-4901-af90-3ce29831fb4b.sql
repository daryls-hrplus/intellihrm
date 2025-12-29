-- Add travel_location column to leave_requests table to track in-country/out-of-country status
ALTER TABLE public.leave_requests 
ADD COLUMN IF NOT EXISTS travel_location TEXT DEFAULT 'in_country' 
CHECK (travel_location IN ('in_country', 'out_of_country'));

-- Add travel_destination column for when employee is traveling out of country
ALTER TABLE public.leave_requests 
ADD COLUMN IF NOT EXISTS travel_destination TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.leave_requests.travel_location IS 'Whether the employee will be in-country or out-of-country during leave';
COMMENT ON COLUMN public.leave_requests.travel_destination IS 'Destination country/location if traveling out of country';