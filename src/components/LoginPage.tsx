import { useState } from "react";
import { supabase, isSupabaseEnabled } from "../lib/supabase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface LoginPageProps {
  onLogin: (email: string) => void;
  onBackToStore?: () => void;
}

export function LoginPage({ onLogin, onBackToStore }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (e: string) => /\S+@\S+\.\S+/.test(e);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) return setError("Por favor, preencha todos os campos");
    if (!validateEmail(email)) return setError("E-mail inválido");

    try {
      setLoading(true);

      if (!isSupabaseEnabled || !supabase) {
        // Modo local: aceita qualquer combinação
        onLogin(email.trim().toLowerCase());
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;

      onLogin(email.trim().toLowerCase());
    } catch (err: any) {
      setError(err.message || "Não foi possível autenticar");
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!recoveryEmail || !validateEmail(recoveryEmail)) {
      return setError("E-mail inválido");
    }

    try {
      setLoading(true);
      if (!isSupabaseEnabled || !supabase) {
        setError("Recuperação de senha indisponível no modo local.");
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(
        recoveryEmail.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      );
      if (error) throw error;

      setRecoverySuccess(true);
      setTimeout(() => {
        setShowRecovery(false);
        setRecoverySuccess(false);
        setRecoveryEmail("");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Falha ao enviar e-mail de recuperação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#f4ede0] via-[#faf8f5] to-[#e8dcc8]">
      <Card className="w-full max-w-md shadow-lg border-[#d4b896]/30">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <ImageWithFallback
              src="/logo-amar-castanhas.png"
              alt="Amar Castanhas"
              className="w-16 h-16 object-contain"
            />
          </div>

          <CardTitle className="text-[#3d3426]">{showRecovery ? "Recuperar Senha" : "Bem-vindo"}</CardTitle>

          <CardDescription className="text-[#7d7259]">
            {showRecovery
              ? "Digite seu e-mail para recuperar sua senha"
              : "Sistema de Gestão - Amar Castanhas"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!showRecovery ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input-background border-border"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input-background border-border"
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowRecovery(true)}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Esqueceu sua senha?
                </button>

                {onBackToStore && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onBackToStore}
                    className="w-full text-muted-foreground hover:text-foreground"
                  >
                    Voltar para a loja
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleRecovery} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {recoverySuccess && (
                <Alert className="bg-primary/10 border-primary/30">
                  <AlertDescription className="text-primary">
                    E-mail de recuperação enviado com sucesso!
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="recovery-email">E-mail</Label>
                <Input
                  id="recovery-email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="bg-input-background border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {loading ? "Enviando..." : "Enviar e-mail de recuperação"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRecovery(false);
                    setError("");
                    setRecoveryEmail("");
                  }}
                  className="w-full"
                >
                  Voltar ao Login
                </Button>

                {onBackToStore && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onBackToStore}
                    className="w-full text-muted-foreground hover:text-foreground"
                  >
                    Voltar para a loja
                  </Button>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
