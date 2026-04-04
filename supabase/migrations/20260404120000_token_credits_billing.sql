-- Token/credit wallet: users buy USD-denominated AI credits (not subscriptions).
-- Payout ratio: credits_granted = CREDIT_PAYOUT_RATIO * amount_paid (see app constants, default 0.65).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS credit_balance_usd numeric(14, 4) NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.profiles.credit_balance_usd IS 'Spendable AI credit balance in USD-equivalent units; topped up via Paystack.';

CREATE TABLE IF NOT EXISTS public.billing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('credit_purchase', 'donation')),
  amount_paid_usd numeric(14, 4) NOT NULL,
  credits_granted_usd numeric(14, 4) NOT NULL DEFAULT 0,
  paystack_reference text NOT NULL UNIQUE,
  currency text NOT NULL DEFAULT 'USD',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS billing_events_user_created_idx ON public.billing_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS billing_events_type_idx ON public.billing_events (event_type);

CREATE TABLE IF NOT EXISTS public.credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  delta_usd numeric(14, 4) NOT NULL,
  balance_after_usd numeric(14, 4) NOT NULL,
  reason text NOT NULL,
  paystack_reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS credit_ledger_user_created_idx ON public.credit_ledger (user_id, created_at DESC);

ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own billing_events"
  ON public.billing_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users read own credit_ledger"
  ON public.credit_ledger FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Idempotent credit top-up after successful Paystack charge (service_role only).
CREATE OR REPLACE FUNCTION public.apply_credit_topup(
  p_user_id uuid,
  p_paystack_ref text,
  p_amount_paid_usd numeric,
  p_credits_granted_usd numeric
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_bal numeric;
BEGIN
  IF EXISTS (SELECT 1 FROM billing_events WHERE paystack_reference = p_paystack_ref) THEN
    RETURN jsonb_build_object('ok', true, 'duplicate', true);
  END IF;
  INSERT INTO billing_events (user_id, event_type, amount_paid_usd, credits_granted_usd, paystack_reference)
  VALUES (p_user_id, 'credit_purchase', p_amount_paid_usd, p_credits_granted_usd, p_paystack_ref);
  UPDATE profiles
  SET credit_balance_usd = credit_balance_usd + p_credits_granted_usd, updated_at = now()
  WHERE id = p_user_id
  RETURNING credit_balance_usd INTO new_bal;
  INSERT INTO credit_ledger (user_id, delta_usd, balance_after_usd, reason, paystack_reference)
  VALUES (p_user_id, p_credits_granted_usd, new_bal, 'credit_purchase', p_paystack_ref);
  RETURN jsonb_build_object('ok', true, 'balance', new_bal);
END;
$$;

CREATE OR REPLACE FUNCTION public.record_donation_event(
  p_user_id uuid,
  p_paystack_ref text,
  p_amount_paid_usd numeric
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM billing_events WHERE paystack_reference = p_paystack_ref) THEN
    RETURN jsonb_build_object('ok', true, 'duplicate', true);
  END IF;
  INSERT INTO billing_events (user_id, event_type, amount_paid_usd, credits_granted_usd, paystack_reference)
  VALUES (p_user_id, 'donation', p_amount_paid_usd, 0, p_paystack_ref);
  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_user_credits(
  p_user_id uuid,
  p_amount numeric,
  p_reason text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_bal numeric;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object(
      'ok', true,
      'balance', (SELECT credit_balance_usd FROM profiles WHERE id = p_user_id)
    );
  END IF;
  UPDATE profiles
  SET credit_balance_usd = credit_balance_usd - p_amount, updated_at = now()
  WHERE id = p_user_id AND credit_balance_usd >= p_amount
  RETURNING credit_balance_usd INTO new_bal;
  IF FOUND THEN
    INSERT INTO credit_ledger (user_id, delta_usd, balance_after_usd, reason, paystack_reference)
    VALUES (p_user_id, -p_amount, new_bal, COALESCE(p_reason, 'usage'), NULL);
    RETURN jsonb_build_object('ok', true, 'balance', new_bal);
  END IF;
  RETURN jsonb_build_object(
    'ok', false,
    'balance', COALESCE((SELECT credit_balance_usd FROM profiles WHERE id = p_user_id), 0)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.apply_credit_topup(uuid, text, numeric, numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_donation_event(uuid, text, numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_user_credits(uuid, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_credit_topup(uuid, text, numeric, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_donation_event(uuid, text, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_user_credits(uuid, numeric, text) TO service_role;
