// app/components/OrdenCompraStatusBadge.tsx
import React from "react";
import { EstadoOrden } from "../types/OrdenCompra.types";
import { ESTADO_LABELS } from "../services/OrdenCompra.service";

interface StatusBadgeProps {
  estado: EstadoOrden;
}

const STATUS_STYLES: Record<EstadoOrden, { wrapper: string; dot: string }> = {
  received: {
    wrapper: "bg-secondary-container text-on-secondary-container",
    dot:     "bg-secondary",
  },
  issued: {
    wrapper: "bg-primary-container/20 text-primary",
    dot:     "bg-primary",
  },
  draft: {
    wrapper: "bg-surface-variant text-on-surface-variant",
    dot:     "bg-outline",
  },
  canceled: {
    wrapper: "bg-error-container text-on-error-container",
    dot:     "bg-error",
  },
};

export const OrdenCompraStatusBadge: React.FC<StatusBadgeProps> = ({ estado }) => {
  const styles = STATUS_STYLES[estado];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-label-sm text-label-sm font-bold uppercase tracking-wide ${styles.wrapper}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {ESTADO_LABELS[estado]}
    </span>
  );
};

export default OrdenCompraStatusBadge;
