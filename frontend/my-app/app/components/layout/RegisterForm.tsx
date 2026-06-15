"use client";
import { useState, FormEvent } from "react";
import { registerApi, RegisterPayload } from "../../api/Auth.api";
import styles from "../../login/LoginPage.module.css";

interface Props {
  onSuccess: () => void;
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="#93000a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="#1a6b3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

export default function RegisterForm({ onSuccess }: Props) {
  const [form, setForm] = useState<RegisterPayload>({
    nombreCompleto: "",
    email: "",
    password: "",
    telefono: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [successMsg, setSuccessMsg]   = useState<string | null>(null);
  const [errors, setErrors] = useState({
    nombreCompleto: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function validate(): boolean {
    const next = { nombreCompleto: "", email: "", password: "", confirmPassword: "" };
    if (!form.nombreCompleto.trim())
      next.nombreCompleto = "El nombre completo es requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Ingresa un email válido";
    if (form.password.length < 6)
      next.password = "La contraseña debe tener al menos 6 caracteres";
    if (form.password !== confirmPassword)
      next.confirmPassword = "Las contraseñas no coinciden";
    setErrors(next);
    return !Object.values(next).some(Boolean);
  }

  function handleChange(field: keyof RegisterPayload) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [field]: e.target.value }));
      if (field in errors) setErrors((p) => ({ ...p, [field]: "" }));
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorGlobal(null);
    setSuccessMsg(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await registerApi(form);
      setSuccessMsg("Cuenta creada. Ahora puedes iniciar sesión.");
      setTimeout(onSuccess, 2000);
    } catch (err: unknown) {
      const apiErr = err as { status: number; mensaje: string };
      if (apiErr.status === 409) {
        setErrorGlobal("El email ya está registrado.");
      } else if (apiErr.status === 400) {
        setErrorGlobal(apiErr.mensaje ?? "Datos inválidos.");
      } else {
        setErrorGlobal("Error al conectar con el servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className={styles.formHeader}>
        <p className={styles.formEyebrow}>Registro público</p>
        <h2 className={styles.formTitle}>Crear cuenta</h2>
        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4, marginBottom: 0 }}>
          Las cuentas nuevas tienen rol <strong>Operador</strong> por defecto.
        </p>
      </div>

      {errorGlobal && (
        <div className={styles.alertError} role="alert">
          <AlertIcon />
          <span className={styles.alertErrorText}>{errorGlobal}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 8,
          padding: "10px 12px", background: "#d6f5e3",
          border: "1px solid #a3d9b8", borderRadius: 4, marginBottom: 16,
        }} role="status">
          <CheckIcon />
          <span style={{ fontSize: 12, color: "#1a6b3a", lineHeight: 1.5 }}>
            {successMsg}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.fieldGroup}>
          <label htmlFor="reg-nombre" className={styles.fieldLabel}>
            Nombre completo
          </label>
          <input
            id="reg-nombre" type="text" placeholder="Juan Pérez"
            value={form.nombreCompleto} onChange={handleChange("nombreCompleto")}
            className={`${styles.fieldInput} ${errors.nombreCompleto ? styles.fieldInputError : ""}`}
            aria-invalid={!!errors.nombreCompleto}
          />
          {errors.nombreCompleto && (
            <span className={styles.fieldError}>{errors.nombreCompleto}</span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="reg-email" className={styles.fieldLabel}>Email</label>
          <input
            id="reg-email" type="email" placeholder="juan@ejemplo.com"
            value={form.email} onChange={handleChange("email")}
            className={`${styles.fieldInput} ${errors.email ? styles.fieldInputError : ""}`}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <span className={styles.fieldError}>{errors.email}</span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="reg-tel" className={styles.fieldLabel}>
            Teléfono <span style={{ color: "#9ca3af", fontWeight: 400 }}>(opcional)</span>
          </label>
          <input
            id="reg-tel" type="tel" placeholder="+591 7xxxxxxx"
            value={form.telefono} onChange={handleChange("telefono")}
            className={styles.fieldInput}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="reg-password" className={styles.fieldLabel}>
            Contraseña
          </label>
          <input
            id="reg-password" type="password" placeholder="••••••••"
            value={form.password} onChange={handleChange("password")}
            className={`${styles.fieldInput} ${errors.password ? styles.fieldInputError : ""}`}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <span className={styles.fieldError}>{errors.password}</span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="reg-confirm" className={styles.fieldLabel}>
            Confirmar contraseña
          </label>
          <input
            id="reg-confirm" type="password" placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword)
                setErrors((p) => ({ ...p, confirmPassword: "" }));
            }}
            className={`${styles.fieldInput} ${errors.confirmPassword ? styles.fieldInputError : ""}`}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <span className={styles.fieldError}>{errors.confirmPassword}</span>
          )}
        </div>

        <button
          type="submit" disabled={isLoading}
          className={styles.btnPrimary} style={{ marginTop: 8 }}
        >
          {isLoading ? (
            <><div className={styles.spinner} aria-hidden="true" /> Creando cuenta...</>
          ) : (
            "Crear cuenta como Operador"
          )}
        </button>
      </form>
    </>
  );
}