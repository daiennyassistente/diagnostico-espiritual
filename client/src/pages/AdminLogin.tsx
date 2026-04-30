import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: (data) => {
      if (data.success && data.token) {
        localStorage.setItem("adminToken", data.token);
        setLocation("/admin");
      } else {
        setError(data.message || "Erro ao fazer login");
      }
    },
    onError: (err) => {
      setError("Usuário ou senha incorretos");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }
    
    setIsLoading(true);
    loginMutation.mutate({ username, password }, {
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <div className="min-h-screen spiritual-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-secondary/30 backdrop-blur-md shadow-none border-border">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-center mb-2 text-foreground shadow-none font-bold">
            Área Administrativa
          </h1>
          <p className="text-center text-muted-foreground shadow-none mb-6">
            Faça login para acessar o painel
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground shadow-none font-bold mb-1">
                Usuário
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground shadow-none font-bold mb-1">
                Senha
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black py-8 uppercase tracking-wider"
            >
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
