"use client"

import Image from "next/image"

export function PreSell({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* imagem de fundo borrada */}
      <Image
        src="/perfil.jpg"
        alt=""
        fill
        priority
        className="scale-110 object-cover opacity-40 blur-xl"
      />

      <div className="relative mx-auto flex w-full max-w-[420px] flex-col items-center px-6 text-center">
        <img src="/privacy-logo.png" alt="privacy." className="mb-8 h-7 w-auto brightness-0 invert" />

        <div className="mb-6 flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-medium text-white backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          Conteúdo +18
        </div>

        <h1 className="text-balance text-[26px] font-bold leading-tight text-white">
          Você tem certeza que quer ver isso?
        </h1>
        <p className="mt-3 text-pretty text-[15px] leading-relaxed text-white/70">
          O conteúdo a seguir é exclusivo e destinado a maiores de 18 anos. Ao continuar, você confirma que é maior de
          idade e deseja visualizar o perfil de <span className="font-semibold text-white">Marcinha Amorin</span>.
        </p>

        <button
          onClick={onEnter}
          className="mt-8 h-[56px] w-full rounded-full bg-gradient-to-r from-[#f5956a] to-[#f07040] text-[16px] font-bold text-white shadow-lg shadow-[#f07040]/30 transition hover:brightness-105 active:scale-[0.98]"
        >
          Sim, quero ver
        </button>
        <p className="mt-4 text-[12px] text-white/40">Ao entrar você concorda com os termos de uso.</p>
      </div>
    </div>
  )
}
