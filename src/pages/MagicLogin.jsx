import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MagicLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Signing you in…");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token || token.length < 20) {
      setError("This sign-in link is missing or invalid.");
      setStatus("");
      return;
    }

    const storageKey = `appointbot_magic_login_${token}`;
    const phase = sessionStorage.getItem(storageKey);

    if (phase === "done") {
      if (localStorage.getItem("token")) {
        navigate("/dashboard/", { replace: true });
      } else {
        setStatus("");
        setError(
          "Session expired. Open the magic link again or sign in with email.",
        );
      }
      return;
    }
    if (phase === "pending") {
      return;
    }
    sessionStorage.setItem(storageKey, "pending");

    localStorage.removeItem("token");
    localStorage.removeItem("owner");

    api
      .post("/auth/magic-login", { token })
      .then(({ data }) => {
        sessionStorage.setItem(storageKey, "done");
        login(data.token, data.owner);
        setStatus("Redirecting…");
        navigate(data.owner?.onboarded ? "/dashboard/" : "/dashboard/onboarding", {
          replace: true,
        });
      })
      .catch((err) => {
        sessionStorage.removeItem(storageKey);
        setStatus("");
        setError(
          err.response?.data?.error ||
            "This link is invalid or has already been used. Request a new demo email.",
        );
      });
  }, [searchParams, login, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Demo sign-in</CardTitle>
          <CardDescription>
            One-time link from your demo request email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {status ? (
            <p className="text-muted-foreground">{status}</p>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-destructive">
              {error}
            </div>
          ) : null}
          <p className="text-muted-foreground">
            <Link to="/demo" className="font-medium text-foreground underline underline-offset-2">
              Request a demo
            </Link>{" "}
            or{" "}
            <Link
              to="/dashboard/login"
              className="font-medium text-foreground underline underline-offset-2"
            >
              sign in with email
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
