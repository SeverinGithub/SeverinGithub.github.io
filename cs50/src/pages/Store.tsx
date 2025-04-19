
import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const drinks = [
  { id: 1, name: "Cappuccino", price: 2.5 },
  { id: 2, name: "Espresso", price: 2.0 },
  { id: 3, name: "Iced Coffee", price: 3.0 },
  { id: 4, name: "Coca Cola", price: 1.5 },
  { id: 5, name: "Fanta", price: 1.5 },
  { id: 6, name: "Spezi", price: 1.5 },
  { id: 7, name: "Mineralwasser", price: 1.5 },
  { id: 8, name: "Aperol Spritz", price: 4.5 },
  { id: 9, name: "Grapefruit-Rosmarin Spritz (Alkoholfrei)", price: 3.0 },
  { id: 10, name: "Sanbitter-Ginger Spritz (Alkoholfrei)", price: 3.0 },
  { id: 11, name: "Virgin Sunrise", price: 3.5 },
  { id: 12, name: "The Red Lemon", price: 3.5 },
  { id: 13, name: "Shirly Temple", price: 3.5 },
  { id: 14, name: "Moscow Mule", price: 4.0 },
];

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

const Store = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  const addToCart = (drinkId: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === drinkId);
      if (existing) {
        return prev.map((item) =>
          item.id === drinkId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        const drinkToAdd = drinks.find((d) => d.id === drinkId);
        if (!drinkToAdd) return prev;
        return [...prev, { ...drinkToAdd, quantity: 1 }];
      }
    });
    toast({
      title: "Getränk hinzugefügt",
      description: "Das Getränk wurde zu deinem Warenkorb hinzugefügt.",
    });
  };

  const removeFromCart = (drinkId: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === drinkId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.id === drinkId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prev.filter((item) => item.id !== drinkId);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 px-6">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900 select-none">
        Getränkestore
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-8">
        {drinks.map((drink) => {
          const inCart = cart.find((i) => i.id === drink.id)?.quantity || 0;

          return (
            <div
              key={drink.id}
              className="border rounded-lg p-5 shadow-md flex flex-col justify-between hover:shadow-lg transition cursor-pointer bg-white"
              aria-label={`${drink.name}, Preis ${drink.price} Euro`}
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {drink.name}
                </h3>
                <p className="mt-1 text-orange-600 font-bold">
                  €{drink.price.toFixed(2)}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Button
                  onClick={() => removeFromCart(drink.id)}
                  disabled={inCart === 0}
                  variant="outline"
                  size="sm"
                  aria-label={`Minus von ${drink.name}`}
                  className="rounded-full"
                >
                  -
                </Button>
                <span className="font-semibold text-gray-900">{inCart}</span>
                <Button
                  onClick={() => addToCart(drink.id)}
                  variant="default"
                  size="sm"
                  aria-label={`Plus zu ${drink.name}`}
                  className="rounded-full"
                >
                  +
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          onClick={() => navigate("/order")}
          disabled={cart.length === 0}
          variant="secondary"
          className="text-lg px-10 py-5"
          aria-label="Zur Bestellung"
        >
          <ShoppingCart className="w-6 h-6 mr-2" />
          Bestellung ({cart.reduce((a, c) => a + c.quantity, 0)})
        </Button>
      </div>
    </div>
  );
};

export default Store;
