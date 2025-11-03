-- Create registrations table to store user registration information
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  national_id TEXT NOT NULL,
  email TEXT NOT NULL,
  otp TEXT,
  otp_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for registration)
CREATE POLICY "Anyone can register" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow users to view their own registration
CREATE POLICY "Users can view own registration" 
ON public.registrations 
FOR SELECT 
USING (phone = phone OR email = email);

-- Create policy to allow users to update their own registration
CREATE POLICY "Users can update own registration" 
ON public.registrations 
FOR UPDATE 
USING (phone = phone OR email = email);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_registrations_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();