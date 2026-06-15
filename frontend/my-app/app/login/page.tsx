"use client";
import Image from "next/image";


import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginApi } from "../api/Auth.api";
import { useAuth } from "../context/Authcontext";
import { ApiError } from "../types/Auth.types";
import styles from "./LoginPage.module.css";
import RegisterForm from "../components/layout/RegisterForm";


// ─── Ícono de cruz (brand) ────────────────────────
function CrossIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 1v14M1 8h14"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Ícono de ingreso ─────────────────────────────
function LoginIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

// ─── Ícono de alerta ──────────────────────────────
function AlertIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#93000a"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 1 }}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ─────────────────────────────────────────────────
export default function LoginPage() {
  const router       = useRouter();
  const { login } = useAuth();

   const [email, setEmail] = useState("");
  const [password,   setPassword]   = useState("");
  const [remember,   setRemember]   = useState(false);
  const [isLoading,  setIsLoading]  = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [tab, setTab] = useState<"login" | "register">("login");

  // Errores de campo simples
  const [errors, setErrors] = useState({ username: "", password: "" });

  function validate(): boolean {
    const next = { username: "", password: "" };
    if (!email.trim()) next.username = "El email es requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.username = "Ingresa un email válido";    if (!password)        next.password = "La contraseña es requerida";
    setErrors(next);
    return !next.username && !next.password;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorGlobal(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = await loginApi({ email: email.trim(), password });

      login(
        data.token,
        {
          id: data.id,
          username: data.username,
          nombreCompleto: data.nombreCompleto,
          rol: data.rol,
        },
        remember
      );

      // Redirigir según rol
      router.push(data.rol === "ADMINISTRADOR" ? "/dashboard" : "/inventario");
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 401) {
        setErrorGlobal("Usuario o contraseña incorrectos.");
      } else if (apiErr.status === 403) {
        setErrorGlobal("Tu cuenta está desactivada. Contacta al administrador.");
      } else {
        setErrorGlobal(apiErr.mensaje ?? "Error al conectar con el servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.root}>
      <div className={styles.card}>

         {/* ── Panel izquierdo ── */}
<div 
  className={`${styles.panelLeft} relative flex items-center justify-center p-4`} 
  style={{ backgroundColor: "#f4f5f2" }} 
>
  <Image
     src="/Logo.png"
     alt="Farmacia Cristo Redentor"
     fill
     sizes="(max-width: 1024px) 100vw, 50vw"
     style={{ 
       objectFit: "contain", 
       objectPosition: "center",
       transform: "scale(1.5)" 
     }}
     priority
  />
</div>
        {/* ── Panel derecho ── */}
       <div className={styles.panelRight}>

  {/* ── Tabs ── */}
  <div style={{
    display: "flex", marginBottom: 28,
    border: "1px solid #dde0e4", borderRadius: 4, overflow: "hidden",
  }}>
    {(["login", "register"] as const).map((t) => (
      <button
        key={t}
        type="button"
        onClick={() => { setTab(t); setErrorGlobal(null); }}
        style={{
          flex: 1, height: 36, border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500,
          letterSpacing: "0.03em",
          background: tab === t ? "#0f1623" : "#f7f9fb",
          color: tab === t ? "#ffffff" : "#6b7280",
          transition: "background 0.15s, color 0.15s",
        }}
      >
        {t === "login" ? "Iniciar sesión" : "Registrarse"}
      </button>
    ))}
  </div>

  {/* ── Contenido según tab ── */}
  {tab === "login" ? (
    <>
      <div className={styles.formHeader}>
        <p className={styles.formEyebrow}>Acceso al sistema</p>
        <h2 className={styles.formTitle}>Iniciar sesión</h2>
      </div>

      {errorGlobal && (
        <div className={styles.alertError} role="alert">
          <AlertIcon />
          <span className={styles.alertErrorText}>{errorGlobal}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.fieldGroup}>
          <label htmlFor="EmailUsuario" className={styles.fieldLabel}>
            Email Usuario
          </label>
          <input
            id="EmailUsuario" type="text" autoComplete="EmailUsuario"
            placeholder="Email: ejemplo@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.username) setErrors((p) => ({ ...p, username: "" }));
            }}
            className={`${styles.fieldInput} ${errors.username ? styles.fieldInputError : ""}`}
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? "EmailUsuario-error" : undefined}
          />
          {errors.username && (
            <span id="EmailUsuario-error" className={styles.fieldError}>
              {errors.username}
            </span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="password" className={styles.fieldLabel}>
            Contraseña
          </label>
          <input
            id="password" type="password" autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((p) => ({ ...p, password: "" }));
            }}
            className={`${styles.fieldInput} ${errors.password ? styles.fieldInputError : ""}`}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <span id="password-error" className={styles.fieldError}>
              {errors.password}
            </span>
          )}
        </div>

        <br />

        <button type="submit" disabled={isLoading} className={styles.btnPrimary}>
          {isLoading ? (
            <><div className={styles.spinner} aria-hidden="true" />Verificando...</>
          ) : (
            <>Ingresar al sistema <LoginIcon /></>
          )}
        </button>
      </form>
    </>
  ) : (
    <RegisterForm onSuccess={() => setTab("login")} />
  )}

  <div className={styles.divider} />
  <div className={styles.formFooter}>
    <div className={styles.roleBadge}>
      <span className={`${styles.roleDot} ${styles.dotAdmin}`} />
      Administrador
    </div>
    <div className={styles.roleBadge}>
      <span className={`${styles.roleDot} ${styles.dotOperador}`} />
      Operador
    </div>
  </div>
</div>
      </div>
    </main>
  );
}