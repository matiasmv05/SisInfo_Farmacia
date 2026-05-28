// app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRequireAuth } from "../context/useRequireAuth";
import { Product, Lot, DispatchTransaction } from "../types/Dispatch.types";
import { dispatchService } from "../services/dispatch.service";
import { Header } from "../components/Header";
import { ProductSearch } from "../components/ProductSearch";
import { LotDetails } from "../components/LotDetails";
import { DispatchQuantity } from "../components/DispatchQuantity";
import { ConfirmAction } from "../components/ConfirmAction";
import { ProductStats } from "../components/ProductStats";
import { ProtocolAlert } from "../components/ProtocolAlert";
import { SuccessModal } from "../components/SuccessModal";

export default function DashboardPage() {
  // Proteger la ruta — Solo usuarios autenticados
  const { user, isLoading: isAuthLoading } = useRequireAuth();

  // Estados de Operación de Despacho
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [availableLots, setAvailableLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [quantity, setQuantity] = useState<number>(50);
  const [witnessName, setWitnessName] = useState<string>("");

  // Estados de UI/Transacción
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [transaction, setTransaction] = useState<DispatchTransaction | null>(null);

  // Referencias para atajos de teclado
  const searchInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  // Inicializar con Naloxona por defecto para cumplir con la plantilla provista
  useEffect(() => {
    if (!isAuthLoading && user) {
      const naloxone = dispatchService.getProducts().find((p) => p.id === "prod-001");
      if (naloxone) {
        handleSelectProduct(naloxone);
      }
    }
  }, [isAuthLoading, user]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    const productLots = dispatchService.getLotsForProduct(product.id);
    setAvailableLots(productLots);

    // Preseleccionar lote FEFO automáticamente
    const suggested = dispatchService.getSuggestedLot(product.id);
    setSelectedLot(suggested);

    // Resetear cantidad y testigo
    setQuantity(50);
    setWitnessName("");
  };

  const handleConfirmDispatch = async () => {
    if (!selectedProduct || !selectedLot) return;
    
    // Validar cantidad
    if (quantity <= 0 || quantity > selectedLot.availableQuantity) {
      alert("Por favor ingrese una cantidad de despacho válida.");
      return;
    }

    // Validar doble firma si es requerida
    if (selectedProduct.dualSignatureRequired && !witnessName.trim()) {
      alert("Este producto controlado requiere el nombre y firma digital de un testigo autorizado.");
      return;
    }

    try {
      setIsProcessing(true);
      const tx = await dispatchService.executeDispatch(
        selectedProduct.id,
        selectedLot.id,
        quantity,
        selectedProduct.dualSignatureRequired ? witnessName : undefined
      );
      setTransaction(tx);
      setShowSuccess(true);
    } catch (error: any) {
      alert(error?.message || "Ocurrió un error al procesar el despacho.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setTransaction(null);
    
    // Recargar el producto actual para actualizar cantidades en vivo
    if (selectedProduct) {
      handleSelectProduct(selectedProduct);
    }
    
    // Devolver el foco al buscador
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Atajos de teclado: Enter en buscador enfoca cantidad; Enter en cantidad confirma despacho
  const handleSearchSubmit = () => {
    setTimeout(() => {
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    }, 50);
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Validar antes de proceder
      const isQuantityValid = quantity > 0 && selectedLot && quantity <= selectedLot.availableQuantity;
      const isWitnessValid = !selectedProduct?.dualSignatureRequired || witnessName.trim().length > 0;
      
      if (isQuantityValid && isWitnessValid) {
        handleConfirmDispatch();
      } else if (!isQuantityValid) {
        alert("La cantidad ingresada no es válida.");
      } else {
        alert("Se requiere la firma del testigo para proceder.");
      }
    }
  };

  // Estado de carga inicial mientras se valida la sesión
  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center gap-md">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-body-md text-body-md text-on-surface-variant animate-pulse">
          Validando credenciales de seguridad...
        </p>
      </div>
    );
  }

  const isDispatchDisabled =
    !selectedProduct ||
    !selectedLot ||
    quantity <= 0 ||
    quantity > selectedLot.availableQuantity ||
    (selectedProduct.dualSignatureRequired && !witnessName.trim());

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-md sm:p-lg antialiased">
      <main className="w-full max-w-[1024px] grid grid-cols-1 lg:grid-cols-12 gap-xl">
        {/* Left Column: Primary Workflow */}
        <section className="lg:col-span-8 flex flex-col gap-lg">
          {/* Context Header */}
          <Header
            title="Fast Dispatch"
            subtitle="Priority Outbound Workflow"
            onBack={() => {
              if (window.confirm("¿Está seguro de que desea salir del flujo de despacho rápido?")) {
                window.location.href = "/login";
              }
            }}
          />

          {/* Operational Form Canvas */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-xl flex flex-col gap-xl shadow-sm transition-all hover:shadow-md">
            {/* Field 1: Product Search */}
            <ProductSearch
              initialValue={selectedProduct?.name || ""}
              onSelectProduct={handleSelectProduct}
              onSearchSubmit={handleSearchSubmit}
              inputRef={searchInputRef}
            />

            {/* Field 2: Auto-Suggested Lot (FEFO) */}
            <LotDetails
              lot={selectedLot}
              availableLots={availableLots}
              onLotChange={(lot) => setSelectedLot(lot)}
            />

            {/* Field 3: Movement Quantity */}
            <DispatchQuantity
              quantity={quantity}
              maxQuantity={selectedLot ? selectedLot.availableQuantity : 0}
              onChangeQuantity={(q) => setQuantity(q)}
              inputRef={quantityInputRef}
              onKeyDown={handleQuantityKeyDown}
            />

            {/* Field 4: Confirm Action */}
            <ConfirmAction
              onConfirm={handleConfirmDispatch}
              disabled={isDispatchDisabled}
              isLoading={isProcessing}
            />
          </div>
        </section>

        {/* Right Column: Quick Stats Sidebar */}
        <aside className="lg:col-span-4 h-fit sticky top-xl flex flex-col gap-md">
          {/* Product Stats Sidebar */}
          <ProductStats product={selectedProduct} />

          {/* Contextual Operational Alert (Dual-Signature) */}
          <ProtocolAlert
            required={!!selectedProduct?.dualSignatureRequired}
            witnessName={witnessName}
            onChangeWitness={(name) => setWitnessName(name)}
          />
        </aside>
      </main>

      {/* Success Modal Dialogue */}
      <SuccessModal
        isOpen={showSuccess}
        transaction={transaction}
        onClose={handleCloseSuccess}
      />
    </div>
  );
}
