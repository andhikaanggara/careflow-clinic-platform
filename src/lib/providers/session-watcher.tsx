"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SessionWatcherProps {
  lastSignInAt: string | undefined;
}

export function SessionWatcher({ lastSignInAt }: SessionWatcherProps) {
  const router = useRouter();
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!lastSignInAt) return;

    const loginTime = new Date(lastSignInAt).getTime();
    const LIMIT_9_HOURS = 9 * 60 * 60 * 1000;
    const WARNING_THRESHOLD = LIMIT_9_HOURS - 15 * 60 * 1000; // Peringatan di menit ke 15 terakhir

    const checkSession = () => {
      const now = Date.now();
      const elapsed = now - loginTime;

      // 1. Cek jika sudah benar-benar expired
      if (elapsed >= LIMIT_9_HOURS) {
        setIsExpired(true);
        return;
      }

      // 2. Cek jika masuk masa peringatan (hanya muncul sekali)
      if (elapsed >= WARNING_THRESHOLD && elapsed < WARNING_THRESHOLD + 60000) {
        toast.warning("Peringatan Sesi", {
          description:
            "Sesi Anda akan berakhir dalam 15 menit. Pastikan simpan pekerjaan Anda.",
          duration: 8000,
        });
      }
    };

    // Jalankan pengecekan setiap 60 detik
    const interval = setInterval(checkSession, 60000);
    checkSession(); // Jalankan langsung saat mount

    return () => clearInterval(interval);
  }, [lastSignInAt]);

  const handleReLogin = () => {
    setIsExpired(false);
    router.push("/login?error=session_expired");
  };

  return (
    <AlertDialog open={isExpired}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sesi Keamanan Berakhir</AlertDialogTitle>
          <AlertDialogDescription>
            Demi keamanan data klinik, sesi kerja dibatasi maksimal 9 jam.
            Silakan login kembali untuk melanjutkan pekerjaan Anda.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleReLogin}
            className="w-full sm:w-auto cursor-pointer"
          >
            Login Ulang
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
