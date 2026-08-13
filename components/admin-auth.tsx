"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { validateSignupCode } from "@/app/actions/admin"

export function AdminAuth() {
  const router = useRouter()
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === "sign-up"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (isSignUp) {
      const check = await validateSignupCode(code)
      if (!check.ok) {
        setError(check.error ?? "Código inválido.")
        setLoading(false)
        return
      }
    }
    const { error } = isSignUp
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message ?? "Algo deu errado.")
      return
    }
    router.push("/admin")
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f0ebe4] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
        <img src="/privacy-logo.png" alt="privacy." className="mx-auto mb-6 h-6 w-auto" />
        <h1 className="text-center text-[20px] font-bold text-gray-900">
          {isSignUp ? "Criar conta admin" : "Painel administrativo"}
        </h1>
        <p className="mb-6 mt-1 text-center text-[13px] text-gray-500">
          {isSignUp ? "Cadastre-se para acessar o painel" : "Entre para gerenciar o perfil"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {isSignUp && (
            <>
              <input
                required
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#f07040]"
              />
              <input
                required
                placeholder="Código de convite"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#f07040]"
              />
            </>
          )}
          <input
            required
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#f07040]"
          />
          <input
            required
            type="password"
            minLength={8}
            placeholder="Senha (mín. 8 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#f07040]"
          />
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded-full bg-[#f07040] text-[15px] font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Aguarde..." : isSignUp ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <button
          onClick={() => setMode(isSignUp ? "sign-in" : "sign-up")}
          className="mt-4 w-full text-center text-[13px] text-gray-500 hover:text-gray-700"
        >
          {isSignUp ? "Já tenho conta — Entrar" : "Criar conta admin"}
        </button>
      </div>
    </main>
  )
}
