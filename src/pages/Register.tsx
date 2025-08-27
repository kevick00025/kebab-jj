import React, { useState } from "react";
import { supabase } from "../integrations/supabase/client";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    // Registrazione utente su Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Registrazione completata! Ora puoi accedere.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2 bg-smoke-gray">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-spice-red font-montserrat">Registrazione</h2>
      <form onSubmit={handleRegister} className="flex flex-col gap-4 w-full max-w-md bg-background/95 shadow-xl rounded-xl p-4 sm:p-6">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="border p-3 rounded text-base sm:text-lg focus:ring-2 focus:ring-spice-red/30 outline-none"
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="border p-3 rounded text-base sm:text-lg focus:ring-2 focus:ring-spice-red/30 outline-none"
          autoComplete="new-password"
        />
        <button type="submit" className="bg-primary text-white p-3 rounded text-base sm:text-lg mt-2">
          Registrati
        </button>
      </form>
      {message && <div className="mt-4 text-center text-base sm:text-lg font-semibold text-mint-green animate-fade-in">{message}</div>}
    </div>
  );
};

export default Register;
