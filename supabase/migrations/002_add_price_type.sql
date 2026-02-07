-- Add priceType column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hourly', 'starting_at'));

-- Create index for price_type for better query performance
CREATE INDEX IF NOT EXISTS idx_services_price_type ON services(price_type);
