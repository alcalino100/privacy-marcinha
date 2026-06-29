"use client"

import { useState } from "react"
import {
  Image as ImageIcon,
  Video,
  Lock,
  Heart,
  BadgeCheck,
  ChevronUp,
  FileText,
  GalleryHorizontal,
  MoreVertical,
  MessageCircle,
  DollarSign,
  Bookmark,
} from "lucide-react"

function PlanButton({
  label,
  price,
  className,
}: {
  label: string
  price: string
  className: string
}) {
  return (
    <button
      aria-label={`Assinar Marcinha Amorin por ${price}`}
      className={`flex h-[52px] w-full items-center justify-between rounded-full px-5 text-white transition hover:brightness-105 cursor-pointer ${className}`}
    >
      <span className="text-[15px] font-semibold">{label}</span>
      <span className="text-[15px] font-semibold">{price}</span>
    </button>
  )
}

export default function Page() {
  const [promoOpen, setPromoOpen] = useState(true)

  return (
    <main className="mx-auto min-h-screen w-full max-w-[480px] bg-[#f0ebe4] pb-16">
      {/* Bloco 1 — Header */}
      <header className="sticky top-0 z-20 bg-white py-3 text-center">
        <span className="text-[16px] font-bold tracking-tight text-gray-900">
          privacy<span className="text-[#f07040]">.</span>
        </span>
      </header>

      {/* Bloco 2 — Cover + Avatar + Contadores */}
      <div className="relative">
        <img
          src="/capa.jpg"
          alt="Foto de capa de Marcinha Amorin"
          className="h-[180px] w-full object-cover"
        />
        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-3 text-[12px] font-bold text-white">
          <span className="flex items-center gap-1">
            <ImageIcon size={14} /> 670
          </span>
          <span className="flex items-center gap-1">
            <Video size={14} /> 453
          </span>
          <span className="flex items-center gap-1">
            <Lock size={14} /> 75
          </span>
          <span className="flex items-center gap-1">
            <Heart size={14} /> 319.5K
          </span>
        </div>
        <div className="absolute -bottom-9 left-3 z-10">
          <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full border-[3px] border-white">
            <img
              src="/perfil.jpg"
              alt="Avatar de Marcinha Amorin"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="absolute bottom-1 right-1 h-[10px] w-[10px] rounded-full border-2 border-white bg-green-500" />
        </div>
      </div>

      {/* Bloco 3 — Info do Perfil */}
      <section className="px-4 pb-4 pt-12">
        <div className="flex items-center gap-1">
          <h1 className="text-[17px] font-bold text-gray-900">Marcinha Amorin</h1>
          <BadgeCheck size={16} className="text-[#3b82f6]" />
        </div>
        <p className="text-[13px] text-gray-500">@marcinha_amorin</p>
        <p className="mt-2 line-clamp-2 text-[13px] text-gray-700">
          Oiie amores, sou a marcinha, sua loira rosada, a mais gostosa do site,
          quer ver mais sobre...faça sua assinatura agora mesmo!
          <span className="font-medium text-[#f07040]"> Ler mais</span>
        </p>
        <div className="mt-3 flex items-center gap-4 text-gray-700">
          <a href="#" aria-label="Instagram">
            <img src="https://cdn.simpleicons.org/instagram/374151" alt="" width={24} height={24} />
          </a>
          <a href="#" aria-label="X">
            <img src="https://cdn.simpleicons.org/x/374151" alt="" width={24} height={24} />
          </a>
          <a href="#" aria-label="TikTok">
            <img src="https://cdn.simpleicons.org/tiktok/374151" alt="" width={24} height={24} />
          </a>
        </div>

        {/* Bloco 4 — Assinaturas */}
        <h2 className="mb-2 mt-4 text-[15px] font-semibold text-gray-900">Assinaturas</h2>
        <PlanButton label="1 mês" price="R$ 25,00" className="bg-gradient-to-r from-[#f5956a] to-[#f07040]" />

        {/* Bloco 5 — Promoções */}
        <div className="mt-4 border-t border-[#e5e0d8]">
          <button
            onClick={() => setPromoOpen((v) => !v)}
            className="flex w-full items-center justify-between py-3"
          >
            <span className="text-[15px] font-semibold text-gray-900">Promoções</span>
            <ChevronUp
              size={18}
              className={`text-gray-600 transition-transform duration-300 ${promoOpen ? "" : "rotate-180"}`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              promoOpen ? "max-h-60" : "max-h-0"
            }`}
          >
            <div className="flex flex-col gap-2 pb-2">
              <PlanButton
                label="3 meses (20% off)"
                price="R$ 60,00"
                className="bg-gradient-to-r from-[#f9c09a] to-[#f5956a]"
              />
              <PlanButton
                label="6 meses (30% off)"
                price="R$ 105,00"
                className="bg-gradient-to-r from-[#f9c09a] to-[#f5956a]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bloco 6 — Tabs */}
      <div className="flex w-full border-b-2 border-[#e5e0d8]">
        <button className="flex flex-1 items-center justify-center gap-1.5 border-b-2 border-[#f07040] pb-2 text-[14px] font-medium text-gray-900">
          <FileText size={16} /> 646 Postagens
        </button>
        <button className="flex flex-1 items-center justify-center gap-1.5 pb-2 text-[14px] text-gray-400">
          <GalleryHorizontal size={16} /> 1.123 Mídias
        </button>
      </div>

      {/* Bloco 7 — Card de Post Bloqueado */}
      <div className="px-4 py-4">
        <article className="overflow-hidden rounded-xl border border-[#ede8e0] bg-white">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <img
                src="/perfil.jpg"
                alt="Avatar de Marcinha Amorin"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[14px] font-semibold text-gray-900">Marcinha Amorin</span>
                  <BadgeCheck size={14} className="text-[#3b82f6]" />
                </div>
                <span className="text-xs text-gray-400">@marcinha_amorin</span>
              </div>
            </div>
            <MoreVertical size={20} className="text-gray-400" />
          </div>

          <div className="relative aspect-square overflow-hidden bg-[#ede8e0]">
            <img
              src="/desfocada.jpg"
              alt="Conteúdo bloqueado de Marcinha Amorin"
              className="h-full w-full object-cover blur-2xl scale-110"
            />
            <svg
              className="absolute -bottom-10 -left-10 opacity-60"
              width="180"
              height="180"
              viewBox="0 0 180 180"
              fill="none"
            >
              <path d="M0 180 A180 180 0 0 1 180 0" stroke="white" strokeWidth="14" fill="none" />
              <path d="M0 130 A130 130 0 0 1 130 0" stroke="white" strokeWidth="14" fill="none" />
            </svg>
            <svg
              className="absolute -right-10 -top-10 rotate-180 opacity-60"
              width="180"
              height="180"
              viewBox="0 0 180 180"
              fill="none"
            >
              <path d="M0 180 A180 180 0 0 1 180 0" stroke="white" strokeWidth="14" fill="none" />
              <path d="M0 130 A130 130 0 0 1 130 0" stroke="white" strokeWidth="14" fill="none" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock size={48} strokeWidth={1.5} className="text-[#8a9bb0]" />
            </div>
          </div>

          <div className="flex items-center gap-4 px-4 py-3 text-[13px] text-gray-500">
            <span className="flex items-center gap-1">
              <ImageIcon size={16} className="text-gray-500" /> 670
            </span>
            <span className="flex items-center gap-1">
              <Video size={16} className="text-gray-500" /> 453
            </span>
            <span className="flex items-center gap-1">
              <Heart size={16} className="text-gray-500" /> 319.5K
            </span>
          </div>
        </article>
      </div>

      {/* Bloco 8 — Bottom Bar */}
      <nav className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-[480px] -translate-x-1/2 items-center justify-between border-t border-[#e5e0d8] bg-white px-5 py-3">
        <div className="flex items-center gap-5 text-gray-500">
          <Heart size={24} />
          <MessageCircle size={24} />
          <DollarSign size={24} />
        </div>
        <Bookmark size={24} className="text-gray-500" />
      </nav>
    </main>
  )
}
