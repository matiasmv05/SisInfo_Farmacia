// app/(dashboard)/movimientos/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { dispatchService } from "../../services/dispatch.service";
import { Product, Lot } from "../../types/Dispatch.types";

interface CartItem {
  id: string; // unique cart item id
  product: Product;
  lot: Lot;
  quantity: number;
}

export default function MovimientosPage() {
  // Búsqueda y Selección de Producto
  const [searchQuery, setSearchQuery] = useState("Amoxicilina");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [suggestedLot, setSuggestedLot] = useState<Lot | null>(null);

  // Cantidad a salir
  const [quantity, setQuantity] = useState<number>(10);

  // Motivos y referencia
  const [motivo, setMotivo] = useState("Dispensación a Paciente");
  const [refDoc, setRefDoc] = useState("");

  // Lista de salida (Carrito)
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: "cart-1",
      product: {
        id: "prod-fake-1",
        name: "Ibuprofeno 400mg",
        ndc: "0000-0000-01",
        description: "Tabletas",
        image: "",
        zone: "Zone C",
        rack: "10",
        shelf: "A",
        bin: "01",
        requirements: [],
        dualSignatureRequired: false,
      },
      lot: {
        id: "lot-fake-1",
        productId: "prod-fake-1",
        lotNumber: "L-992",
        expiryDate: "2025-12-31",
        availableQuantity: 100,
        fefoPreselect: false,
      },
      quantity: 20,
    },
    {
      id: "cart-2",
      product: {
        id: "prod-fake-2",
        name: "Omeprazol 20mg",
        ndc: "0000-0000-02",
        description: "Cápsulas",
        image: "",
        zone: "Zone C",
        rack: "10",
        shelf: "B",
        bin: "02",
        requirements: [],
        dualSignatureRequired: false,
      },
      lot: {
        id: "lot-fake-2",
        productId: "prod-fake-2",
        lotNumber: "OM-01A",
        expiryDate: "2025-08-31",
        availableQuantity: 50,
        fefoPreselect: false,
      },
      quantity: 5,
    },
  ]);

  // Resultados de la búsqueda
  const searchResults = useMemo(() => {
    return dispatchService.searchProducts(searchQuery);
  }, [searchQuery]);

  // Al cargar, si hay query inicial, pre-seleccionar el primer producto coincidente
  useEffect(() => {
    if (searchResults.length > 0 && !selectedProduct) {
      handleSelectProduct(searchResults[0]);
    }
  }, [searchResults, selectedProduct]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    const productLots = dispatchService.getLotsForProduct(product.id);
    setLots(productLots);
    const suggested = dispatchService.getSuggestedLot(product.id);
    setSuggestedLot(suggested);
    // Reiniciar cantidad por defecto
    setQuantity(10);
  };

  // Agregar al carrito
  const handleAddToCart = () => {
    if (!selectedProduct || !suggestedLot) return;

    if (quantity <= 0) {
      alert("Por favor, ingrese una cantidad mayor a 0");
      return;
    }

    if (quantity > suggestedLot.availableQuantity) {
      alert(`La cantidad excede el stock disponible del lote sugerido (${suggestedLot.availableQuantity})`);
      return;
    }

    // Verificar si ya existe en el carrito el mismo producto y lote
    const existingIndex = cart.findIndex(
      (item) => item.product.id === selectedProduct.id && item.lot.id === suggestedLot.id
    );

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          id: `cart-${Date.now()}`,
          product: selectedProduct,
          lot: suggestedLot,
          quantity,
        },
      ]);
    }
  };

  // Eliminar del carrito
  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Confirmar salida
  const handleConfirmDispatch = async () => {
    if (cart.length === 0) {
      alert("No hay productos en la lista de salida");
      return;
    }

    try {
      // Confirmar transacciones
      for (const item of cart) {
        // Ignorar los mocks hardcodeados que no existen en el servicio real
        if (item.product.id.startsWith("prod-fake")) continue;

        await dispatchService.executeDispatch(
          item.product.id,
          item.lot.id,
          item.quantity
        );
      }

      alert("¡Salida de inventario confirmada con éxito!");
      setCart([]);
      // Refrescar producto seleccionado
      if (selectedProduct) {
        handleSelectProduct(selectedProduct);
      }
    } catch (error: any) {
      alert(`Error al realizar la salida: ${error.message}`);
    }
  };

  // Calcular stock total de los lotes del producto
  const totalStock = lots.reduce((acc, curr) => acc + curr.availableQuantity, 0);

  // Calcular unidades totales del carrito
  const totalCartUnits = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1400px] mx-auto h-full pb-12">
      {/* Left Column: Input & Selection (Span 7) */}
      <div className="xl:col-span-7 flex flex-col gap-6">
        {/* Product Search Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <label
            className="block font-label-md text-label-md text-on-surface-variant mb-2 uppercase tracking-wider font-semibold"
            htmlFor="product-search"
          >
            Buscar Producto
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
              id="product-search"
              placeholder="Ingrese nombre, código o principio activo..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Resultados flotantes / búsqueda rápida */}
          {searchQuery && searchResults.length > 0 && (
            <div className="mt-2 border border-outline-variant rounded-lg bg-surface-container-lowest overflow-hidden shadow-md max-h-48 overflow-y-auto">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className={`w-full text-left px-4 py-2 hover:bg-primary/5 transition-colors flex justify-between items-center ${
                    selectedProduct?.id === product.id ? "bg-primary/5 font-semibold text-primary" : ""
                  }`}
                >
                  <span className="font-body-md text-body-md">{product.name}</span>
                  <span className="font-label-sm text-label-sm text-outline uppercase">
                    {product.zone.split("•")[0]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & FEFO Logic Card */}
        {selectedProduct ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-outline-variant bg-surface flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {selectedProduct.requirements.slice(0, 1).map((req, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-primary-container/20 text-primary text-label-sm font-label-sm rounded uppercase tracking-wide font-medium"
                    >
                      {req}
                    </span>
                  ))}
                  <span className="font-data-mono text-data-mono text-outline">
                    NDC: {selectedProduct.ndc}
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  {selectedProduct.name}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  {selectedProduct.description}
                </p>
              </div>
              <div className="text-right">
                <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-1 font-semibold">
                  Stock Total
                </p>
                <p className="font-headline-sm text-headline-sm text-primary">
                  {totalStock.toLocaleString()}{" "}
                  <span className="text-body-sm text-on-surface-variant font-normal">
                    uds
                  </span>
                </p>
              </div>
            </div>

            {/* Body: FEFO & Input */}
            <div className="p-6 flex flex-col gap-6 flex-1 justify-between">
              {/* FEFO Suggestion Area */}
              {suggestedLot ? (
                <div className="bg-surface rounded-lg border border-outline-variant p-5 relative overflow-hidden">
                  {/* Indicator bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="material-symbols-outlined text-error"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        warning
                      </span>
                      <h4 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">
                        Lote Sugerido (FEFO)
                      </h4>
                    </div>
                    <span className="bg-error-container text-on-error-container font-label-sm px-2 py-1 rounded font-semibold text-[11px]">
                      Próximo a Vencer
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant">
                      <span className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                        Lote
                      </span>
                      <span className="font-data-mono text-data-mono text-on-surface font-medium">
                        {suggestedLot.lotNumber}
                      </span>
                    </div>
                    <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant">
                      <span className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                        Vencimiento
                      </span>
                      <span className="font-data-mono text-data-mono text-error font-semibold">
                        {suggestedLot.expiryDate}
                      </span>
                    </div>
                    <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant">
                      <span className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                        Disponible en Lote
                      </span>
                      <span className="font-data-mono text-data-mono text-on-surface font-medium">
                        {suggestedLot.availableQuantity} uds
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-on-surface-variant bg-surface rounded-lg border border-outline-variant">
                  No hay lotes disponibles para este producto.
                </div>
              )}

              {/* Alternative Lots Toggle */}
              {lots.length > 1 && (
                <div className="flex justify-end">
                  <button className="text-primary hover:bg-primary-container/10 px-3 py-1.5 rounded flex items-center gap-1 transition-colors text-sm font-medium">
                    <span className="material-symbols-outlined text-[18px]">
                      list
                    </span>
                    Ver otros lotes disponibles ({lots.length})
                  </button>
                </div>
              )}

              {/* Divider */}
              <hr className="border-outline-variant" />

              {/* Quantity Input */}
              <div className="flex items-end gap-4 pt-4">
                <div className="flex-1">
                  <label
                    className="block font-label-md text-label-md text-on-surface-variant mb-2 font-semibold"
                    htmlFor="quantity"
                  >
                    Cantidad a Salir (Unidades)
                  </label>
                  <div className="relative">
                    <input
                      className="w-full pl-4 pr-24 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-data-mono text-headline-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                      id="quantity"
                      max={suggestedLot?.availableQuantity || 1}
                      min={1}
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md">
                      / {suggestedLot?.availableQuantity || 0} MAX
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!suggestedLot}
                  className="bg-primary text-on-primary hover:bg-primary/90 h-[50px] px-6 rounded-lg font-label-md uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">
                    add_shopping_cart
                  </span>
                  Añadir a Lista
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center text-on-surface-variant shadow-sm flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[48px] text-outline">
              category
            </span>
            Por favor, busque y seleccione un producto para ver sus detalles.
          </div>
        )}
      </div>

      {/* Right Column: Cart/Summary (Span 5) */}
      <div className="xl:col-span-5 flex flex-col h-full bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant bg-surface flex justify-between items-center">
          <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-outline">
              receipt_long
            </span>
            Resumen de Salida
          </h3>
          <span className="bg-surface-container text-on-surface-variant font-label-sm px-2 py-1 rounded">
            {cart.length} Ítems
          </span>
        </div>

        {/* Transaction Details Form (Optional metadata) */}
        <div className="p-4 border-b border-outline-variant bg-surface-bright grid grid-cols-2 gap-4">
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
              Motivo de Salida
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full p-2 text-sm bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary"
            >
              <option>Dispensación a Paciente</option>
              <option>Transferencia Interna</option>
              <option>Merma / Daño</option>
            </select>
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
              Documento Ref.
            </label>
            <input
              value={refDoc}
              onChange={(e) => setRefDoc(e.target.value)}
              className="w-full p-2 text-sm bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary"
              placeholder="Ej. Receta #123"
              type="text"
            />
          </div>
        </div>

        {/* Item List */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-2 min-h-[250px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="font-label-md text-label-md text-on-surface-variant uppercase p-3 border-b border-outline-variant sticky top-0 bg-surface-container-lowest">
                  Producto
                </th>
                <th className="font-label-md text-label-md text-on-surface-variant uppercase p-3 border-b border-outline-variant sticky top-0 bg-surface-container-lowest">
                  Lote
                </th>
                <th className="font-label-md text-label-md text-on-surface-variant uppercase p-3 border-b border-outline-variant sticky top-0 bg-surface-container-lowest text-right">
                  Cant.
                </th>
                <th className="font-label-md text-label-md text-on-surface-variant uppercase p-3 border-b border-outline-variant sticky top-0 bg-surface-container-lowest w-10"></th>
              </tr>
            </thead>
            <tbody className="font-body-sm">
              {cart.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-outline-variant/50 hover:bg-[#F0F7FF] transition-colors group"
                >
                  <td className="p-3">
                    <p className="font-medium text-on-surface">{item.product.name}</p>
                    <p className="text-on-surface-variant text-[11px]">
                      {item.product.description}
                    </p>
                  </td>
                  <td className="p-3 font-data-mono text-on-surface-variant">
                    {item.lot.lotNumber}
                  </td>
                  <td className="p-3 text-right font-data-mono font-medium">
                    {item.quantity}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="text-outline hover:text-error transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-on-surface-variant"
                  >
                    La lista está vacía. Agregue productos a despachar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-outline-variant bg-surface mt-auto">
          <div className="flex justify-between items-center mb-6">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase font-semibold">
              Total Unidades
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface">
              {totalCartUnits}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCart([])}
              className="flex-1 py-3 px-4 bg-surface-container-lowest border border-outline-variant text-on-surface-variant font-label-md uppercase tracking-wider rounded-lg hover:bg-surface-container transition-colors text-center"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDispatch}
              className="flex-[2] py-3 px-4 bg-primary text-on-primary font-label-md uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-colors text-center shadow-sm"
            >
              Confirmar Salida
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
