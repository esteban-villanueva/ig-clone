"use client";

import { useState, useTransition } from "react";
import { createPost } from "@/actions/post";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CreatePostDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select an image");
      return;
    }

    setError(null);

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("caption", caption);

    startTransition(async () => {
      const result = await createPost(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setPreview(null);
        setSelectedFile(null);
        setCaption("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="w-full flex items-center gap-4 bg-white/70 dark:bg-zinc-950/70 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-pointer hover:bg-white/90 dark:hover:bg-zinc-950/90 transition-all backdrop-blur-md"
          >
            <span className="flex-1 text-left px-3 py-2 text-zinc-500 font-medium bg-zinc-100/50 dark:bg-zinc-900/50 rounded-xl">
              ¿Qué estás pensando?
            </span>
            <span
              className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-white shadow-sm"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EC4899)" }}
            >
              Publicar
            </span>
          </button>
        }
      />
      <DialogContent className="sm:max-w-md p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-zinc-100/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl">
        <DialogHeader className="mb-4">
          <DialogTitle
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              color: "var(--landing-heading, #111)",
              letterSpacing: "-0.02em"
            }}
          >
            Crear nueva publicación
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label
              className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              Imagen
            </label>
            {!preview ? (
              <label
                htmlFor="file-upload"
                className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-zinc-200 dark:border-zinc-800 border-dashed rounded-2xl cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-900/80 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
                style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-zinc-300 dark:text-zinc-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                  </svg>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Seleccionar foto</p>
                  <p className="text-xs text-zinc-400 mt-1">PNG, JPG, WEBP</p>
                </div>
                <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            ) : (
              <div className="relative mt-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-56 object-cover rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setSelectedFile(null);
                  }}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <label
              className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              Caption
            </label>
            <Textarea
              placeholder="Escribe lo que estás pensando..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="resize-none rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-rose-400/30 focus-visible:border-rose-400/50 transition-all placeholder:text-zinc-400"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            />
          </div>
          {error && (
            <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>
          )}
          <Button
            type="submit"
            disabled={isPending || !selectedFile}
            className="w-full h-12 rounded-xl text-base font-semibold transition-all hover:opacity-90 shadow-sm"
            style={{
              background: "linear-gradient(135deg, #F59E0B, #EC4899, #8B5CF6)",
              color: "white",
              fontFamily: "var(--font-dm-sans), sans-serif"
            }}
          >
            {isPending ? "Publicando..." : "Publicar ahora"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
