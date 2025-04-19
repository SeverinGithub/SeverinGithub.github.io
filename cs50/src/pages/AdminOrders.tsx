
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const AdminOrders = () => {
  const [orders, setOrders] = useState<
    {
      id: string;
      name: string;
      drink: string;
      created_at: string | null;
      completed: boolean | null;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Simple password-based gate: check if admin logged in - for demo only
  useEffect(() => {
    // Since no real auth, allow access only if user visited login before (can be improved with session)
    // For now no auth check available so just proceed
    // TODO: Add real auth flow later
    setLoading(false);
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      toast({
        title: "Fehler beim Laden der Bestellungen",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setOrders(data || []);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleComplete = async (id: string, currentStatus: boolean | null) => {
    const { error } = await supabase
      .from("orders")
      .update({ completed: !currentStatus })
      .eq("id", id);
    if (error) {
      toast({
        title: "Fehler beim Aktualisieren der Bestellung",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    await fetchOrders();
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Bestellungen</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Getränk</TableCell>
                <TableCell>Uhrzeit</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Keine Bestellungen vorhanden
                  </TableCell>
                </TableRow>
              )}
              {orders.map(({ id, name, drink, created_at, completed }) => (
                <TableRow key={id} className={completed ? "line-through text-muted-foreground" : ""}>
                  <TableCell>{name}</TableCell>
                  <TableCell>{drink}</TableCell>
                  <TableCell>{created_at ? new Date(created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</TableCell>
                  <TableCell>
                    <Button variant={completed ? "destructive" : "default"} size="sm" onClick={() => toggleComplete(id, completed ?? false)}>
                      {completed ? "Abgehakt" : "Offen"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;

