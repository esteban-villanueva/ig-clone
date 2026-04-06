"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeletePostConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeletePostConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeletePostConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[400px] p-8 rounded-[2rem] shadow-2xl border border-zinc-100/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="mb-6 text-center">
          <DialogTitle
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              color: "var(--landing-heading, #111)",
              letterSpacing: "-0.02em"
            }}
          >
            ¿Eliminar publicación?
          </DialogTitle>
          <p 
            className="text-zinc-500 mt-2 leading-relaxed"
            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            Si eliminas esta publicación, no podrás recuperarla. ¿Estás seguro de que quieres continuar?
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full h-12 rounded-xl text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
            style={{
              background: "linear-gradient(135deg, #ef4444, #f43f5e)",
              color: "white",
              fontFamily: "var(--font-dm-sans), sans-serif"
            }}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full h-12 rounded-xl text-base font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
