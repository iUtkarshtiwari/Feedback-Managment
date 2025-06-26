"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  joinedDate: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem("currentUser")
    const savedToken = localStorage.getItem("token")
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
      setToken(savedToken)
    }
    setLoading(false)
  }, [])

  // Use the correct backend URL for the server folder
  const API_BASE = "http://localhost:5000/api/auth"

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setUser(data.data.user)
        setToken(data.data.token)
        localStorage.setItem("currentUser", JSON.stringify(data.data.user))
        localStorage.setItem("token", data.data.token)
        return true
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid email or password.",
          variant: "destructive",
        })
        console.error("Login error:", data)
        return false
      }
    } catch (err) {
      toast({
        title: "Login Error",
        description: "Could not connect to the server. Please try again later.",
        variant: "destructive",
      })
      console.error("Login fetch error:", err)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setUser(data.data.user)
        setToken(data.data.token)
        localStorage.setItem("currentUser", JSON.stringify(data.data.user))
        localStorage.setItem("token", data.data.token)
        return true
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "Could not register user.",
          variant: "destructive",
        })
        console.error("Register error:", data)
        return false
      }
    } catch (err) {
      toast({
        title: "Registration Error",
        description: "Could not connect to the server. Please try again later.",
        variant: "destructive",
      })
      console.error("Register fetch error:", err)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("currentUser")
    localStorage.removeItem("token")
  }

  return <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
