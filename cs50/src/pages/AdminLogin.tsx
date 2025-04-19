
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Since Supabase auth with username 'Leo' is not set up, use local admin login logic for now

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/adminOrders");
      }
    });
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    if (username === "Leo" && password === "Leo") {
      // In a real app, replace with proper auth and role check
      toast({ title: "Login erfolgreich" });
      navigate("/adminOrders");
    } else {
      toast({
        title: "Login fehlgeschlagen",
        description: "Ungültiger Benutzername oder Passwort.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="username">Benutzername</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button onClick={handleLogin} disabled={loading}>
            {loading ? "Anmelden..." : "Anmelden"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;

