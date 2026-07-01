"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { savePost, deletePost } from "@/app/actions/admin"
import { ImageUpload } from "@/components/image-upload"
import type { Post } from "@/lib/queries"
import { Plus, Trash2, Lock, Unlock } from "lucide-react"

type Draft = {
  id?: number
  imageUrl: string
  caption: string
  locked: boolean
  photos: string
  videos: string
  likes: string
}

const empty: Draft = { imageUrl: "", caption: "", locked: true, photos: "", videos: "", likes: "" }

export function PostsManager({ posts }: { posts: Post[] }) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [busy, setBusy] = useState(false)

  async function save() {
    if (!draft?.imageUrl) return alert("Selecione uma imagem.")
    setBusy(true)
    await savePost(draft)
    setBusy(false)
    setDraft(null)
    router.refresh()
  }

  async function remove(id: number) {
    if (!confirm("Excluir este card?")) return
    await deletePost(id)
    router.refresh()
  }

  const input = "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 outline-none focus:border-[#f07040]"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-gray-900">Cards / Postagens</h3>
        <button
          onClick={() => setDraft(empty)}
          className="flex items-center gap-1.5 rounded-full bg-[#f07040] px-4 py-2 text-[13px] font-semibold text-white"
        >
          <Plus size={16} /> Novo card
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {posts.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-xl border border-[#e5e0d8] bg-white">
            <div className="relative aspect-square bg-gray-100">
              <img
                src={p.imageUrl || "/placeholder.svg"}
                alt=""
                className={`h-full w-full object-cover ${p.locked ? "blur-md" : ""}`}
              />
              <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">
                {p.locked ? <Lock size={11} /> : <Unlock size={11} />}
                {p.locked ? "Bloqueado" : "Livre"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2">
              <button onClick={() => setDraft({ ...p })} className="text-[12px] font-medium text-[#f07040]">
                Editar
              </button>
              <button onClick={() => remove(p.id)} className="text-gray-400 hover:text-red-500">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="col-span-full py-6 text-center text-[13px] text-gray-400">Nenhum card ainda.</p>
        )}
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDraft(null)}>
          <div
            className="flex max-h-[90vh] w-full max-w-md flex-col gap-3 overflow-y-auto rounded-2xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-[15px] font-bold text-gray-900">{draft.id ? "Editar card" : "Novo card"}</h4>

            <ImageUpload label="Imagem" value={draft.imageUrl} onChange={(url) => setDraft({ ...draft, imageUrl: url })} />

            <label className="flex flex-col gap-1">
              <span className="text-[12px] text-gray-500">Legenda</span>
              <input className={input} value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} />
            </label>

            <label className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
              <span className="text-[13px] font-medium text-gray-800">Bloqueado (desfocado + cadeado)</span>
              <input
                type="checkbox"
                checked={draft.locked}
                onChange={(e) => setDraft({ ...draft, locked: e.target.checked })}
                className="h-5 w-5 accent-[#f07040]"
              />
            </label>

            <div className="grid grid-cols-3 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-[12px] text-gray-500">Fotos</span>
                <input className={input} value={draft.photos} onChange={(e) => setDraft({ ...draft, photos: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[12px] text-gray-500">Vídeos</span>
                <input className={input} value={draft.videos} onChange={(e) => setDraft({ ...draft, videos: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[12px] text-gray-500">Curtidas</span>
                <input className={input} value={draft.likes} onChange={(e) => setDraft({ ...draft, likes: e.target.value })} />
              </label>
            </div>

            <div className="mt-1 flex gap-2">
              <button onClick={() => setDraft(null)} className="h-11 flex-1 rounded-full border border-gray-200 text-[14px] font-medium text-gray-600">
                Cancelar
              </button>
              <button onClick={save} disabled={busy} className="h-11 flex-1 rounded-full bg-[#f07040] text-[14px] font-semibold text-white disabled:opacity-60">
                {busy ? "Salvando..." : "Salvar card"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
