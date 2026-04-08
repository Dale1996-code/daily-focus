import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Lock, ShieldCheck, UserRound } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuthSession } from "@/lib/auth";

type AuthMode = "signIn" | "forgotRequest" | "forgotConfirm";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const sessionQuery = useAuthSession();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [issuedResetToken, setIssuedResetToken] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const authMutation = useMutation({
    mutationFn: (payload: { username: string; password: string; needsSetup: boolean }) =>
      apiRequest(
        "POST",
        payload.needsSetup ? "/api/auth/register" : "/api/auth/login",
        {
          username: payload.username,
          password: payload.password,
        },
      ),
    onSuccess: async () => {
      setErrorMessage(null);
      setPassword("");
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    },
  });

  const forgotRequestMutation = useMutation({
    mutationFn: (payload: { username: string }) =>
      apiRequest<{
        ok: boolean;
        resetToken?: string;
        expiresInMinutes?: number;
        message?: string;
      }>("POST", "/api/auth/forgot-password/request", payload),
    onSuccess: (result) => {
      setErrorMessage(null);
      setIssuedResetToken(result.resetToken ?? null);
      setResetMessage(result.message ?? "Reset token generated.");
      setMode("forgotConfirm");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Could not request reset token. Please try again.");
      }
    },
  });

  const forgotConfirmMutation = useMutation({
    mutationFn: (payload: {
      username: string;
      resetToken: string;
      newPassword: string;
    }) => apiRequest("POST", "/api/auth/forgot-password/confirm", payload),
    onSuccess: async () => {
      setErrorMessage(null);
      setResetToken("");
      setResetNewPassword("");
      setIssuedResetToken(null);
      setResetMessage(null);
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Could not reset password. Please try again.");
      }
    },
  });

  if (sessionQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Checking session...
        </div>
      </div>
    );
  }

  if (sessionQuery.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full border rounded-2xl p-6 bg-card">
          <h1 className="font-display text-xl font-semibold mb-2">
            Unable to reach server
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Check that your backend is running, then try again.
          </p>
          <button
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
            onClick={() => sessionQuery.refetch()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const session = sessionQuery.data;
  if (session?.authenticated) {
    return <>{children}</>;
  }

  const needsSetup = session?.needsSetup ?? true;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (mode === "forgotRequest") {
      await forgotRequestMutation.mutateAsync({
        username: username.trim(),
      });
      return;
    }

    if (mode === "forgotConfirm") {
      await forgotConfirmMutation.mutateAsync({
        username: username.trim(),
        resetToken: resetToken.trim(),
        newPassword: resetNewPassword,
      });
      return;
    }

    await authMutation.mutateAsync({
      username: username.trim(),
      password,
      needsSetup,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-sm p-6">
        <div className="mb-5">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {needsSetup
              ? "Create Owner Account"
              : mode === "forgotRequest"
                ? "Forgot Password"
                : mode === "forgotConfirm"
                  ? "Reset Password"
                  : "Sign In"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {needsSetup
              ? "First-time setup: create the single account for this app."
              : mode === "forgotRequest"
                ? "Request a one-time reset token for your account."
                : mode === "forgotConfirm"
                  ? "Use the token to set a new password."
                  : "Sign in to access your Flow workspace."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Username
            </span>
            <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2 bg-background">
              <UserRound className="w-4 h-4 text-muted-foreground" />
              <input
                className="w-full bg-transparent outline-none text-sm"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="your-name"
                autoComplete="username"
                minLength={3}
                maxLength={40}
                required
              />
            </div>
          </label>

          {(mode === "signIn" || needsSetup) && (
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Password
              </span>
              <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2 bg-background">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  className="w-full bg-transparent outline-none text-sm"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete={needsSetup ? "new-password" : "current-password"}
                  minLength={8}
                  maxLength={128}
                  required
                />
              </div>
            </label>
          )}

          {mode === "forgotConfirm" && !needsSetup && (
            <>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Reset Token
                </span>
                <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2 bg-background">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                  <input
                    className="w-full bg-transparent outline-none text-sm tracking-widest"
                    value={resetToken}
                    onChange={(event) => setResetToken(event.target.value)}
                    placeholder="6-digit token"
                    minLength={6}
                    maxLength={64}
                    required
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  New Password
                </span>
                <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2 bg-background">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    className="w-full bg-transparent outline-none text-sm"
                    value={resetNewPassword}
                    onChange={(event) => setResetNewPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                    required
                  />
                </div>
              </label>
            </>
          )}

          {issuedResetToken && mode === "forgotConfirm" ? (
            <div className="rounded-lg border bg-secondary/40 p-3">
              <p className="text-xs text-muted-foreground mb-1">One-time reset token</p>
              <p className="text-lg font-semibold tracking-[0.2em]">{issuedResetToken}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Save it now. It expires soon.
              </p>
            </div>
          ) : null}

          {resetMessage ? (
            <p className="text-xs text-muted-foreground">{resetMessage}</p>
          ) : null}

          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}

          <button
            type="submit"
            disabled={
              authMutation.isPending ||
              forgotRequestMutation.isPending ||
              forgotConfirmMutation.isPending ||
              !username.trim() ||
              ((mode === "signIn" || needsSetup) && password.length < 8) ||
              (mode === "forgotConfirm" &&
                (resetToken.trim().length < 6 || resetNewPassword.length < 8))
            }
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {authMutation.isPending ||
            forgotRequestMutation.isPending ||
            forgotConfirmMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {needsSetup
                  ? "Creating..."
                  : mode === "forgotRequest"
                    ? "Generating token..."
                    : mode === "forgotConfirm"
                      ? "Resetting password..."
                      : "Signing in..."}
              </>
            ) : (
              (() => {
                if (needsSetup) return "Create Account";
                if (mode === "forgotRequest") return "Generate Reset Token";
                if (mode === "forgotConfirm") return "Reset Password";
                return "Sign In";
              })()
            )}
          </button>

          {!needsSetup && (
            <div className="flex justify-between items-center text-xs">
              {mode === "signIn" ? (
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => {
                    setErrorMessage(null);
                    setMode("forgotRequest");
                  }}
                >
                  Forgot password?
                </button>
              ) : (
                <button
                  type="button"
                  className="text-primary hover:underline flex items-center gap-1"
                  onClick={() => {
                    setErrorMessage(null);
                    setResetMessage(null);
                    setIssuedResetToken(null);
                    setResetToken("");
                    setResetNewPassword("");
                    setMode("signIn");
                  }}
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to sign in
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
