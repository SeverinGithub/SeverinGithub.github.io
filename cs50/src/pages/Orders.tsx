import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const drinks = [
  "Cappuccino",
  "Espresso",
  "Iced Coffee",
  "Coca Cola",
  "Fanta",
  "Spezi",
  "Mineralwasser",
  "Aperol Spritz",
  "Grapefruit-Rosmarin Spritz (Alkoholfrei)",
  "Sanbitter-Ginger Spritz (Alkoholfrei)",
  "Virgin Sunrise",
  "The Red Lemon",
  "Shirly Temple",
  "Moscow Mule",
];

const Orders = () => {
  const [name, setName] = useState("");
  const [drink, setDrink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter drinks searching for simpler UI like a store dropdown
  const filteredDrinks = drinks; // for now, show all

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Name ist erforderlich",
        description: "Bitte gib deinen Namen ein, bevor du bestellst.",
        variant: "destructive",
      });
      return;
    }
    if (!drink) {
      toast({
        title: "Getränk auswählen",
        description: "Bitte wähle ein Getränk aus der Liste.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase
      .from("orders")
      .insert([{ name, drink, completed: false }]);
    setSubmitting(false);

    if (error) {
      toast({
        title: "Bestellung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Bestellung abgeschickt",
        description: `Danke ${name}, dein Getränk (${drink}) wurde bestellt.`,
      });
      setName("");
      setDrink("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center select-none">
        Getränk bestellen
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Name Input */}
        <div className="col-span-2 flex flex-col space-y-4">
          <Label htmlFor="name" className="font-semibold text-gray-700">
            Name
          </Label>
          <Input
            id="name"
            placeholder="Dein Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            className="text-lg"
          />
        </div>

        {/* Drink Selection */}
        <div className="flex flex-col space-y-4">
          <Label htmlFor="drink" className="font-semibold text-gray-700">
            Getränk
          </Label>
          <select
            id="drink"
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 transition disabled:cursor-not-allowed disabled:opacity-50"
            value={drink}
            onChange={(e) => setDrink(e.target.value)}
            disabled={submitting}
          >
            <option value="">Bitte wählen...</option>
            {filteredDrinks.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-6 text-sm text-gray-500 italic select-none">
        Hinweis: Selbstbedienung für Pils, Bier alkoholfrei, Rotwein, Weißwein
      </p>
      <div className="mt-8 flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {submitting ? "Bestellen..." : "Bestellung abschicken"}
        </Button>
      </div>
    </div>
  );
};

export default Orders;
