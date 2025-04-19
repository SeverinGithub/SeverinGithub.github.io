
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type OrderProps = {
  cartItems: CartItem[];
  onResetCart: () => void;
};

const Order = () => {
  // For demo simplicity: We get cart info from sessionStorage (or you can use context/store)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const stored = sessionStorage.getItem("cart");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Name ist erforderlich",
        description: "Bitte gib deinen Namen ein, bevor du bestellst.",
        variant: "destructive",
      });
      return;
    }
    if (cartItems.length === 0) {
      toast({
        title: "Keine Bestellung",
        description: "Du hast keine Getränke im Warenkorb.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    // Save order to supabase table "orders" with items in JSON as well
    const { error } = await supabase
      .from("orders")
      .insert([
        {
          name: name.trim(),
          drink: JSON.stringify(cartItems),
          completed: false,
        },
      ]);
    setSubmitting(false);

    if (error) {
      toast({
        title: "Bestellung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Bestellung erfolgreich",
        description: `Danke ${name}, deine Getränke-Bestellung wurde abgeschickt.`,
      });
      setName("");
      setCartItems([]);
      sessionStorage.removeItem("cart");
      // Optionally navigate back to store or home
    }
  };

  // Reflect cart changes
  const removeFromCart = (id: number) => {
    const updated = cartItems
      .map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);
    setCartItems(updated);
    sessionStorage.setItem("cart", JSON.stringify(updated));
  };

  const addToCart = (id: number) => {
    const existing = cartItems.find((item) => item.id === id);
    let updated: CartItem[];
    if (existing) {
      updated = cartItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      // Cannot add unknown here, so ignore
      updated = [...cartItems];
    }
    setCartItems(updated);
    sessionStorage.setItem("cart", JSON.stringify(updated));
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center select-none">
        Bestellung
      </h1>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-600 italic">
          Dein Warenkorb ist leer.
        </p>
      ) : (
        <ul className="divide-y divide-gray-300 max-h-96 overflow-auto mb-6">
          {cartItems.map(({ id, name, quantity, price }) => (
            <li
              key={id}
              className="flex items-center justify-between py-4"
              aria-label={`${name}, Anzahl: ${quantity}, Preis: ${price.toFixed(
                2
              )} Euro`}
            >
              <div>
                <p className="font-semibold text-gray-800">{name}</p>
                <p className="text-sm text-gray-600">Menge: {quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => removeFromCart(id)}
                  variant="outline"
                  size="sm"
                  aria-label={`Minus von ${name}`}
                  className="rounded-full"
                >
                  -
                </Button>
                <Button
                  onClick={() => addToCart(id)}
                  variant="outline"
                  size="sm"
                  aria-label={`Plus zu ${name}`}
                  className="rounded-full"
                >
                  +
                </Button>
                <p className="font-semibold text-orange-600 ml-4">
                  € {(price * quantity).toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mb-6">
        <p className="text-right font-bold text-xl text-gray-900">
          Gesamt: € {totalPrice.toFixed(2)}
        </p>
      </div>

      <div className="mb-6">
        <label
          htmlFor="name"
          className="block mb-2 font-semibold text-gray-800 select-none"
        >
          Dein Name
        </label>
        <Input
          id="name"
          placeholder="Dein Name"
          value={name}
          disabled={submitting}
          onChange={(e) => setName(e.target.value)}
          className="text-lg"
        />
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={submitting || cartItems.length === 0}
          className="bg-orange-500 hover:bg-orange-600 px-12 py-5 text-xl rounded-xl shadow-lg"
          aria-label="Bestellung abschicken"
        >
          {submitting ? "Bestellung wird gesendet..." : "Bestellung abschicken"}
        </Button>
      </div>
    </div>
  );
};

export default Order;

