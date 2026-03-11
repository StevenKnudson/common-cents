import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore";
import { api } from "../services/api";

export function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const body = isRegister
        ? { email, password, name, organizationName: orgName }
        : { email, password };

      const { data } = await api.post(endpoint, body);
      login(data.token, data.user, data.organization?.id);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-2">Common Cents</h1>
        <p className="text-gray-500 text-center mb-8">
          {isRegister ? "Create your account" : "Sign in to your account"}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <input
                type="text"
                placeholder="Business name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
          />
          <button
            type="submit"
            className="w-full py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
          >
            {isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-brand-600 hover:underline font-medium"
          >
            {isRegister ? "Sign in" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}
