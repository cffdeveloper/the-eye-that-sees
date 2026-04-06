import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandHexMark } from "@/components/BrandHexMark";
import {
  MIN_CREDIT_PURCHASE_USD,
  MAX_CREDIT_PURCHASE_USD,
  MIN_DONATION_USD,
  creditsFromPayment,
  formatMoneyUsd,
} from "@/lib/creditsConfig";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
  Shield,
  CreditCard,
  Check,
  Loader2,
  Zap,
  Globe,
  BarChart3,
  Brain,
  ArrowRight,
  Heart,
  Coins,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const FEATURES = [
  { icon: BarChart3, text: "AI intelligence across all industries" },
  { icon: Brain, text: "Deep dives, frameworks & scoring" },
  { icon: Globe, text: "Cross-industry & cross-region scans" },
  { icon: Zap, text: "Infinity Lab — custom scoped briefs" },
];

function billingEmailForUser(user: User | null): string {
  if (!user) return "";
  if (user.email) return user.email;
  const meta = user.user_metadata as { email?: string } | undefined;
  if (meta?.email) return meta.email;
  for (const id of user.identities ?? []) {
    const data = id.identity_data as { email?: string } | undefined;
    if (data?.email) return data.email;
  }
  return "";
}

export function PaymentModal({ open, onOpenChange, onSuccess }: PaymentModalProps) {
  const { user } = useAuth();
  const { startPaystackCheckout, creditBalanceUsd } = useSubscription();
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [loadingDonate, setLoadingDonate] = useState(false);
  const [creditAmount, setCreditAmount] = useState(String(Math.max(MIN_CREDIT_PURCHASE_USD, 25)));
  const [donateAmount, setDonateAmount] = useState("10");

  const billingEmail = billingEmailForUser(user);

  useEffect(() => {
    if (open) {
      onSuccess?.();
    }
  }, [open, onSuccess]);

  const parsedCredit = Number.parseFloat(creditAmount);
  const parsedDonate = Number.parseFloat(donateAmount);
  const creditsPreview = Number.isFinite(parsedCredit) ? creditsFromPayment(parsedCredit) : 0;

  const handleBuyCredits = async () => {
    if (!user) {
      toast.error("Please sign in.");
      return;
    }
    if (!billingEmail?.trim()) {
      toast.error("Add an email in Profile before checkout.");
      return;
    }
    if (!Number.isFinite(parsedCredit) || parsedCredit < MIN_CREDIT_PURCHASE_USD || parsedCredit > MAX_CREDIT_PURCHASE_USD) {
      toast.error(`Enter an amount between $${MIN_CREDIT_PURCHASE_USD} and $${MAX_CREDIT_PURCHASE_USD}.`);
      return;
    }
    setLoadingCredits(true);
    try {
      await startPaystackCheckout({ kind: "credits", amountUsd: parsedCredit });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setLoadingCredits(false);
    }
  };

  const handleDonate = async () => {
    if (!user) {
      toast.error("Please sign in.");
      return;
    }
    if (!billingEmail?.trim()) {
      toast.error("Add an email in Profile before checkout.");
      return;
    }
    if (!Number.isFinite(parsedDonate) || parsedDonate < MIN_DONATION_USD || parsedDonate > MAX_CREDIT_PURCHASE_USD) {
      toast.error(`Donation must be at least $${MIN_DONATION_USD}.`);
      return;
    }
    setLoadingDonate(true);
    try {
      await startPaystackCheckout({ kind: "donation", amountUsd: parsedDonate });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setLoadingDonate(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="z-[10060]"
        className="z-[10060] max-h-[90vh] max-w-md gap-0 overflow-y-auto overflow-x-hidden rounded-2xl border-border/60 p-0"
      >
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 pb-4 pt-6">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <BrandHexMark size="md" />
              <div>
                <DialogTitle className="font-display text-lg font-bold text-foreground">
                  Infinitygap credits
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                  Buy AI credits to run intel, or support the project with a donation.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-6 py-5">
          {creditBalanceUsd > 0 && (
            <p className="rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 text-center text-sm text-foreground">
              Current balance:{" "}
              <span className="font-bold text-primary">{formatMoneyUsd(creditBalanceUsd)}</span> credits
            </p>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
              <Coins className="h-3.5 w-3.5" />
              Buy AI credits
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Minimum purchase {formatMoneyUsd(MIN_CREDIT_PURCHASE_USD)}. The amount below is what is credited to your wallet
              for this payment.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="credit-amt" className="text-xs">
                Amount (USD)
              </Label>
              <Input
                id="credit-amt"
                type="number"
                min={MIN_CREDIT_PURCHASE_USD}
                max={MAX_CREDIT_PURCHASE_USD}
                step="1"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="rounded-xl"
              />
              {Number.isFinite(parsedCredit) && parsedCredit >= MIN_CREDIT_PURCHASE_USD && (
                <p className="text-[11px] text-muted-foreground">
                  Credits added to your wallet:{" "}
                  <span className="font-semibold text-foreground">{formatMoneyUsd(creditsPreview)}</span>{" "}
                  <span className="text-muted-foreground/80">(for a {formatMoneyUsd(parsedCredit)} payment)</span>
                </p>
              )}
            </div>
            <Button
              type="button"
              onClick={handleBuyCredits}
              disabled={loadingCredits || !user || !billingEmail?.trim()}
              className="h-11 w-full gap-2 rounded-xl font-bold shadow-lg shadow-primary/20"
            >
              {loadingCredits ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting…
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay with Paystack
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2 border-t border-border/50 pt-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <Heart className="h-3.5 w-3.5 text-brand-orange" />
              Support Infinitygap
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Optional tip — does <span className="font-medium text-foreground">not</span> add AI credits. Goes to the
              same Paystack account (buy the team a coffee).
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="donate-amt" className="text-xs">
                Amount (USD)
              </Label>
              <Input
                id="donate-amt"
                type="number"
                min={MIN_DONATION_USD}
                step="1"
                value={donateAmount}
                onChange={(e) => setDonateAmount(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleDonate}
              disabled={loadingDonate || !user || !billingEmail?.trim()}
              className="h-11 w-full gap-2 rounded-xl border-brand-orange/40 font-semibold"
            >
              {loadingDonate ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className="h-4 w-4 text-brand-orange" />
              )}
              Donate via Paystack
            </Button>
          </div>

          <div className="space-y-2.5 border-t border-border/40 pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Included when you have credits</p>
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <f.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-foreground/90">{f.text}</span>
              </div>
            ))}
          </div>

          {!billingEmail && user && (
            <p className="text-center text-xs leading-snug text-amber-600 dark:text-amber-400">
              No email on this account.{" "}
              <Link
                to="/profile"
                className="font-semibold underline underline-offset-2"
                onClick={() => onOpenChange(false)}
              >
                Add one in Profile
              </Link>
            </p>
          )}

          <div className="flex items-center justify-center gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>256-bit SSL</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Check className="h-3 w-3" />
              <span>PCI compliant</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <CreditCard className="h-3 w-3" />
              <span>Paystack</span>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
