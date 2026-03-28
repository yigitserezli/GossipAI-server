"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";
import { RulesDashboard } from "@/components/app/rules-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  clearAdminAttemptState,
  getAdminLockRemainingMs,
  isAdminEmailAllowed,
  isAdminUnlockedInSession,
  normalizeAdminPasscode,
  registerAdminFailedAttempt,
  unlockAdminInSession,
  verifyAdminPasscodeOnServer,
} from "@/lib/security/admin-gate";
import { showApiErrorToast } from "@/lib/toast/notify";
import { useAuthStore } from "@/stores/auth-store";

export function AdminGate() {
  const userEmail = useAuthStore((state) => state.user?.email ?? null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    setIsUnlocked(isAdminUnlockedInSession());
  }, []);
  const [passcode, setPasscode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const onUnlock = async () => {
    const lockRemainingMs = getAdminLockRemainingMs();
    if (lockRemainingMs > 0) {
      toast.error(`Cok fazla hatali deneme. ${Math.ceil(lockRemainingMs / 1000)} sn sonra tekrar dene.`);
      return;
    }

    if (!isAdminEmailAllowed(userEmail)) {
      toast.error("Bu hesap admin paneli icin yetkili degil.");
      return;
    }

    if (passcode.length !== 6) {
      toast.error("6 haneli admin PIN gir.");
      return;
    }

    setIsVerifying(true);

    try {
      const isValid = await verifyAdminPasscodeOnServer(passcode);

      if (!isValid) {
        const failed = registerAdminFailedAttempt();
        if (failed.locked) {
          toast.error("3 hatali deneme algilandi. 5 dakika kilitlendi.");
        } else {
          toast.error(`Admin passcode hatali. Kalan deneme: ${failed.remainingAttempts}`);
        }
        return;
      }

      clearAdminAttemptState();
      unlockAdminInSession(passcode);
      setIsUnlocked(true);
      setPasscode("");
      toast.success("Admin kilidi acildi.");
    } catch (error) {
      showApiErrorToast(error, "Admin dogrulamasi basarisiz");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isUnlocked) {
    return <RulesDashboard />;
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>
            Devam etmek icin 6 haneli admin PIN gir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <InputOTP
              maxLength={6}
              value={passcode}
              onChange={(value) => setPasscode(normalizeAdminPasscode(value))}
              pattern={REGEXP_ONLY_DIGITS}
              onComplete={() => void onUnlock()}
              containerClassName="justify-center"
            >
              <InputOTPGroup className="gap-2 rounded-none">
                <InputOTPSlot index={0} className="size-12 rounded-md border text-lg font-semibold first:rounded-md first:border" />
                <InputOTPSlot index={1} className="size-12 rounded-md border text-lg font-semibold first:rounded-md first:border" />
                <InputOTPSlot index={2} className="size-12 rounded-md border text-lg font-semibold first:rounded-md first:border" />
                <InputOTPSlot index={3} className="size-12 rounded-md border text-lg font-semibold first:rounded-md first:border" />
                <InputOTPSlot index={4} className="size-12 rounded-md border text-lg font-semibold first:rounded-md first:border" />
                <InputOTPSlot index={5} className="size-12 rounded-md border text-lg font-semibold first:rounded-md first:border" />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-center text-xs text-muted-foreground">Yalnizca rakam kabul edilir.</p>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => void onUnlock()} disabled={isVerifying || passcode.length !== 6}>
              {isVerifying ? "Dogrulaniyor..." : "Unlock Admin"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Landing</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
