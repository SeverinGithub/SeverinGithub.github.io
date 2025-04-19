
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Wishes = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Name is required",
        description: "Please enter your name before submitting",
        variant: "destructive",
      });
      return;
    }
    if (!message.trim()) {
      toast({
        title: "Message is required",
        description: "Please enter a message before submitting",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("wishes").insert([{ name, message }]);
    setSubmitting(false);

    if (error) {
      toast({
        title: "Error submitting wish",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Wish sent! Thank you for your message." });
      setName("");
      setMessage("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center select-none">
        Geburtstagswünsche schreiben
      </h1>

      <div className="space-y-6">
        <div className="flex flex-col">
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
        <div className="flex flex-col">
          <Label htmlFor="message" className="font-semibold text-gray-700">
            Wunsch
          </Label>
          <Textarea
            id="message"
            placeholder="Schreibe deinen Wunsch hier..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={submitting}
            rows={5}
            className="text-lg resize-none"
          />
        </div>
        <div className="flex justify-center">
          <Button onClick={handleSubmit} disabled={submitting} className="bg-purple-700 hover:bg-purple-800">
            {submitting ? "Abschicken..." : "Abschicken"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Wishes;
