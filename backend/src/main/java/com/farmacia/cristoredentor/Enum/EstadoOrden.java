package com.farmacia.cristoredentor.Enum;

public enum EstadoOrden {
    borrador,
    emitida,
    recibida,
    recibida_parcial,
    cancelada;

    public boolean puedeTransicionarA(EstadoOrden destino) {
        return switch (this) {
            case borrador         -> destino == emitida || destino == cancelada;
            case emitida          -> destino == recibida
                                  || destino == recibida_parcial
                                  || destino == cancelada;
            case recibida_parcial -> destino == recibida;
            default               -> false;
        };
    }
}