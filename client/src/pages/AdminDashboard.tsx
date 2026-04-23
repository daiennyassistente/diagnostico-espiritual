import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import AdminDashboardContent from "./AdminDashboardContent";

const ADMIN_CREDENTIALS = {
  username: "Daienny",
  password: "vitoria1023",
};

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  // Verificar se já está autenticado ao carregar a página
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken === "admin_authenticated") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validar credenciais
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem("adminToken", "admin_authenticated");
      setIsAuthenticated(true);
      toast.success("Login realizado com sucesso!");
      setUsername("");
      setPassword("");
    } else {
      setError("Usuário ou senha incorretos");
      toast.error("Credenciais inválidas");
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    toast.success("Logout realizado");
  };

  // Se não estiver autenticado, mostrar formulário de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-center mb-2 text-amber-900">
              Área Administrativa
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Faça login para acessar o painel
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuário
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  disabled={isLoading}
                  className="w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full bg-amber-900 hover:bg-amber-800"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  // Se estiver autenticado, mostrar dashboard
  return (
    <AdminDashboardContent onLogout={handleLogout} />
  );
}
