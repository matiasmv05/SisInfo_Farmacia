"use client";
// app/components/dashboard/AlertsTable.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertaDetalleDTO } from "../../types/dashboard.types";
import { marcarAlertaLeidaApi } from "../../api/Dashboard.api";
import MarcarVencidoModal from "./Marcarvencidomodal";
import SalidaRapidaModal from "./SalidaRapidaModal";
import AsignarStockModal from "./AsignarStockModal";

interface AlertsTableProps {
  alerts: AlertaDetalleDTO[];
  total: number;
  onAlertAction?: () => void;
}

const TIPO_LABEL: Record<string, string> = {
  stock_minimo:         "STOCK CRÍTICO",
  vencimiento_rojo:     "VENCE < 15 DÍAS",
  vencimiento_amarillo: "VENCE < 30 DÍAS",
  vencimiento_verde:    "VENCIMIENTO",
};

const CRITICIDAD_COLORS = {
  ALTA:  { bar: "bg-error",     text: "text-error",     badge: "bg-error/10 text-error"       },
  MEDIA: { bar: "bg-[#d97706]", text: "text-[#d97706]", badge: "bg-[#d97706]/10 text-[#d97706]"},
  BAJA:  { bar: "bg-primary",   text: "text-primary",   badge: "bg-primary/10 text-primary"   },
};

// IDs de alertas que ya fueron accionadas pero el dashboard aún no refrescó
// Permite ocultarlas inmediatamente sin esperar el refresco de 30s
type HiddenSet = Set<number>;

interface ModalVencidoState {
  alertaId:      number;
  loteId:        number;
  numeroLote:    string;
  productoNombre: string;
  cantidad:      number;
}

interface ModalSalidaState {
  alertaId:   number;
  productoId: number;
  productoNombre: string;
  stockActual: number;
}

interface ModalAsignarStockState {
  alertaId:       number;
  productoId:     number;
  productoNombre: string;
  stockActual:    number;
}

export default function AlertsTable({ alerts, total, onAlertAction }: AlertsTableProps) {
  const router = useRouter();
  const [actionError,       setActionError]       = useState<string | null>(null);
  const [modalVencido,      setModalVencido]      = useState<ModalVencidoState | null>(null);
  const [modalSalida,       setModalSalida]       = useState<ModalSalidaState | null>(null);
  const [modalAsignarStock, setModalAsignarStock] = useState<ModalAsignarStockState | null>(null);
  // Ocultación optimista: la alerta desaparece al instante tras la acción
  const [hidden, setHidden] = useState<HiddenSet>(new Set());

  const ocultarAlerta = (id: number) =>
    setHidden(prev => new Set([...prev, id]));

  // ── Llamada compartida post-acción ────────────────────────────────────────
  // 1. Marca la alerta como leída en el backend (espera a que se complete)
  // 2. La oculta optimistamente en la UI
  // 3. Refresca el dashboard (para actualizar KPIs)
  const handleAccionExitosa = async (alertaId: number) => {
    try {
      await marcarAlertaLeidaApi(alertaId);
    } catch (err) {
      // Si falla marcar como leída, aún así la ocultamos localmente
      // El siguiente refresco del dashboard la quitará del listado
      console.warn("Error al marcar alerta como leída:", err);
    }
    ocultarAlerta(alertaId);
    // Refrescar después de marcar como leída
    if (onAlertAction) {
      setTimeout(() => onAlertAction(), 300); // Pequeño delay para asegurar que se persista en el backend
    }
  };

  // ── Abrir modal de vencimiento ────────────────────────────────────────────
  const abrirModalVencido = (alert: AlertaDetalleDTO) => {
    if (!alert.loteId) return;
    setModalVencido({
      alertaId:       alert.id,
      loteId:         alert.loteId,
      numeroLote:     alert.loteNumero ?? `Lote #${alert.loteId}`,
      productoNombre: alert.productoNombre,
      cantidad:       alert.stockActual ?? 0,
    });
  };

  // ── Abrir modal de salida rápida ──────────────────────────────────────────
  const abrirModalSalida = (alert: AlertaDetalleDTO) => {
    setModalSalida({
      alertaId:       alert.id,
      productoId:     alert.productoId,
      productoNombre: alert.productoNombre,
      stockActual:    alert.stockActual ?? 0,
    });
  };

  // ── Abrir modal para asignar stock ───────────────────────────────────────
  const abrirModalAsignarStock = (alert: AlertaDetalleDTO) => {
    setModalAsignarStock({
      alertaId:       alert.id,
      productoId:     alert.productoId,
      productoNombre: alert.productoNombre,
      stockActual:    alert.stockActual ?? 0,
    });
  };

  // Combinar: alertas no leídas + que no estén en hidden
  const visibles = alerts.filter(a => !hidden.has(a.id));

  return (
    <>
      {/* ── Modal: marcar lote vencido ── */}
      {modalVencido && (
        <MarcarVencidoModal
          loteId={modalVencido.loteId}
          numeroLote={modalVencido.numeroLote}
          productoNombre={modalVencido.productoNombre}
          cantidad={modalVencido.cantidad}
          onConfirm={() => handleAccionExitosa(modalVencido.alertaId)}
          onClose={() => setModalVencido(null)}
        />
      )}

      {/* ── Modal: salida rápida de inventario ── */}
      {modalSalida && (
        <SalidaRapidaModal
          productoId={modalSalida.productoId}
          productoNombre={modalSalida.productoNombre}
          stockActual={modalSalida.stockActual}
          onConfirm={() => handleAccionExitosa(modalSalida.alertaId)}
          onClose={() => setModalSalida(null)}
        />
      )}

      {/* ── Modal: asignar stock ── */}
      {modalAsignarStock && (
        <AsignarStockModal
          productoId={modalAsignarStock.productoId}
          productoNombre={modalAsignarStock.productoNombre}
          stockActual={modalAsignarStock.stockActual}
          onConfirm={() => handleAccionExitosa(modalAsignarStock.alertaId)}
          onClose={() => setModalAsignarStock(null)}
        />
      )}

      <div className="col-span-12 md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm flex flex-col">
        <div className="p-5 border-b border-outline-variant flex justify-between items-center">
          <div>
            <h3 className="text-headline-sm font-headline-sm text-on-surface">
              Alertas Críticas de Inventario
            </h3>
            {total > alerts.length && (
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Mostrando {visibles.length} de {total} alertas activas
              </p>
            )}
          </div>
          <button
            onClick={() => router.push("/inventario")}
            className="text-primary text-label-md font-label-md hover:underline"
          >
            Ver todas
          </button>
        </div>

        {actionError && (
          <div className="mx-5 mt-3 p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {actionError}
            <button onClick={() => setActionError(null)} className="ml-auto">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          {visibles.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[40px] opacity-40 block">check_circle</span>
              <p className="mt-2 text-body-md">No hay alertas activas</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-outline-variant text-label-md font-label-md text-on-surface-variant uppercase tracking-wider sticky top-0">
                  <th className="py-3 px-5 w-4" />
                  <th className="py-3 px-2">SKU / Producto</th>
                  <th className="py-3 px-2">Categoría</th>
                  <th className="py-3 px-2 text-right">Stock Actual</th>
                  <th className="py-3 px-2">Estado</th>
                  <th className="py-3 px-5 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="text-body-sm font-body-sm text-on-surface divide-y divide-outline-variant/40">
                {visibles.map((alert) => {
                  const colors = CRITICIDAD_COLORS[alert.criticidad] ?? CRITICIDAD_COLORS.BAJA;
                  const label  = TIPO_LABEL[alert.tipo] ?? alert.tipo;

                  const esVencimiento = alert.tipo === "vencimiento_rojo"
                    || alert.tipo === "vencimiento_amarillo"
                    || alert.tipo === "vencimiento_verde";
                  const esStockCritico = alert.tipo === "stock_minimo";

                  return (
                    <tr
                      key={alert.id}
                      className="hover:bg-[#F0F7FF] transition-colors relative group"
                    >
                      <td className="p-0 relative w-1">
                        <div className={`w-1 absolute left-0 top-0 bottom-0 ${colors.bar}`} />
                      </td>

                      <td className="py-3 px-2">
                        <div className="font-medium text-on-surface truncate max-w-[250px]">
                          {alert.loteNumero ?? `ID #${alert.productoId}`}
                        </div>
                        <div className="text-on-surface-variant text-[12px] truncate max-w-[300px] mt-0.5">
                          {alert.productoNombre}
                        </div>
                        <div className="text-on-surface-variant text-[10px] truncate max-w-[300px] italic">
                          {alert.mensaje}
                        </div>
                      </td>

                      <td className="py-3 px-2 text-on-surface-variant">
                        {alert.productoCategoria ?? "—"}
                      </td>

                      <td className={`py-3 px-2 text-right font-data-mono ${colors.text} font-medium`}>
                        {alert.stockActual ?? "—"}
                      </td>

                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-sm text-[10px] font-bold ${colors.badge}`}>
                          {label}
                        </span>
                      </td>

                      {/* ── Acciones contextuales según tipo de alerta ── */}
                      <td className="py-3 px-5">
                        <div className="flex items-center justify-center gap-1">

                          {esStockCritico && (
                            // Stock crítico → asignar stock con sugerencia
                            <button
                              onClick={() => abrirModalAsignarStock(alert)}
                              className="p-1.5 rounded-md text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Asignar stock al producto"
                            >
                              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                            </button>
                          )}

                          {esVencimiento && alert.loteId && (
                            // Vencimiento → dar de baja el lote
                            <button
                              onClick={() => abrirModalVencido(alert)}
                              className="p-1.5 rounded-md text-error/70 hover:text-error hover:bg-error/10 transition-colors"
                              title="Declarar lote vencido"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}

                          {/* Salida rápida: disponible para ambos tipos */}
                          <button
                            onClick={() => abrirModalSalida(alert)}
                            disabled={!alert.stockActual || alert.stockActual <= 0}
                            className="p-1.5 rounded-md text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Registrar salida de inventario"
                          >
                            <span className="material-symbols-outlined text-[18px]">output</span>
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}