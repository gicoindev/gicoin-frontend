// src/components/register-airdrop-dialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAccount } from "wagmi";

interface RegisterAirdropDialogProps {
  open: boolean;
  onClose: () => void;
}

export function RegisterAirdropDialog({ open, onClose }: RegisterAirdropDialogProps) {
  const { address } = useAccount();
  const [email, setEmail] = useState("");
  const [chatId, setChatId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!address) return alert("Connect wallet dulu");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          email,
          chat_id: chatId || null,
        }),
      });

      if (!res.ok) throw new Error("Register gagal");
      setSuccess(true);
    } catch (err) {
      console.error("❌ Error register:", err);
      alert("Register gagal, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle>Register Airdrop</DialogTitle>
        </DialogHeader>
        {success ? (
          <div className="text-green-500 font-semibold">
            ✅ Berhasil register! Kamu sudah terdaftar untuk airdrop.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Email (wajib)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Telegram Chat ID (opsional)"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
            />
          </div>
        )}

        <DialogFooter>
          {!success && (
            <Button onClick={handleSubmit} disabled={loading || !email}>
              {loading ? "Mendaftar..." : "Daftar"}
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
