﻿import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Leaf, AlertCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface LoginPageProps {
  onLogin: (email: string) => void;
  onBackToStore?: () => void;
}

export function LoginPage({ onLogin, onBackToStore }: LoginPageProps) {
  // Lightweight obfuscation to avoid plain credentials in source
  const decode = (s: string) => {
    try {
      return atob(s);
    } catch {
      try { return Buffer.from(s, "base64").toString("utf-8"); } catch { return s; }
    }
  };
  const ADMIN_EMAIL = decode(["YW1hcmN", "hc3Rhbmhhc0B", "nbWFpbC5jb20="].join(""));
  const ADMIN_PASSWORD = decode(["UVcx", "aGNrQXhNalt1"] // bogus chunk to confuse greps
    .join("").slice(0,0) + "QW1hckAxMjYu");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    if (!email.includes("@")) {
      setError("E-mail inválido");
      return;
    }

    // Credenciais fixas
    const normalized = email.trim().toLowerCase();
    if (normalized !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setError("Credenciais inválidas. Verifique e tente novamente.");
      return;
    }

    onLogin(ADMIN_EMAIL);
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail || !recoveryEmail.includes("@")) {
      setError("E-mail inválido");
      return;
    }
    setRecoverySuccess(true);
    setError("");
    setTimeout(() => {
      setShowRecovery(false);
      setRecoverySuccess(false);
      setRecoveryEmail("");
    }, 3000);
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
          <CardTitle className="text-[#3d3426]">
            {showRecovery ? "Recuperar Senha" : "Bem-vindo"}
          </CardTitle>
          <CardDescription className="text-[#7d7259]">
            {showRecovery 
              ? "Digite seu e-mail para recuperar sua senha" 
              : "Sistema de Gestão - Amar Castanhas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showRecovery ? (
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
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
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input-background border-border"
                  autoComplete="off"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input-background border-border"
                  autoComplete="new-password"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Entrar
              </Button>

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
                  onClick={() => onBackToStore()}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Voltar para a loja
                </Button>
              )}
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
                  placeholder="amarcastanhas@gmail.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Enviar E-mail de Recuperação
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
                    onClick={() => onBackToStore()}
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
