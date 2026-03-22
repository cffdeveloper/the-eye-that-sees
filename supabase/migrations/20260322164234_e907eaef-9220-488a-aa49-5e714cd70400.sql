
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paystack_customer_code text,
  paystack_subscription_code text,
  paystack_email text,
  plan_code text,
  amount integer NOT NULL DEFAULT 3000,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'inactive',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert subscriptions"
  ON public.subscriptions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Service can update subscriptions"
  ON public.subscriptions FOR UPDATE
  TO public
  USING (true);
