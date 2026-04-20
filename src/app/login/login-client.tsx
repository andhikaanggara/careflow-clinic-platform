"use client";

// Import
// Libraries
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
// Ui
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Component
export default function LoginClient() {
  // state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // supabase client
  const supabase = createClient();
  // router
  const router = useRouter();

  // handle login function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push("/staff"); //harusnya ini push ke dashboard atau halaman utama setelah login
      router.refresh();
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: "guest@rahayumedika.com",
      password: "password123",
    });
    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push("/staff");
      router.refresh();
    }
  };

  //   render
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Rahayu Medika Login
        </CardTitle>
        <CardDescription>
          Enter your clinical credentials to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="grid gap-4">
          <Input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="cursor-pointer w-full" disabled={loading}>
            {loading ? "Authenticating..." : "Login"}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full cursor-pointer hover:bg-secondary"
          onClick={handleGuestLogin}
          disabled={loading}
        >
          {loading ? "Connecting..." : "Login as Guest"}
        </Button>
      </CardContent>
    </Card>
  );
}
