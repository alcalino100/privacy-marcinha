"use client"

import { useRef, useState } from "react"
import { Upload } from "lucide-react"
import { upload } from "@vercel/blob/client"

export function ImageUpload({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (url: string) => void
  label: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function doUpload(file: File) {
    setBusy(true)
    try {
      const blob = await upload(`uploads/${Date.now()}-${file.name}`, file, {
        access: "private",
        handleUploadUrl: "/api/upload",
      })
      onChange(`/api/file?pathname=${encodeURIComponent(blob.pathname)}`)
    } catch (e) {
      alert("Falha no upload.")
      console.error("[v0] upload error:", e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] text-gray-500">{label}</span>
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          {value ? (
            <img src={value || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL ou caminho"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 outline-none focus:border-[#f07040]"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <Upload size={14} /> {busy ? "Enviando..." : "Enviar imagem"}
          </button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) doUpload(f)
          e.target.value = ""
        }}
      />
    </div>
  )
}
