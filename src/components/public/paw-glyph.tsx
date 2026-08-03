/**
 * Huella de pata dibujada con primitivas SVG (sin paths a mano). Es el motivo
 * gráfico recurrente del sitio: aparece como "rastro" entre secciones y como
 * textura de fondo, en vez de íconos genéricos o fotos de stock.
 */
export function PawGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" className={className}>
      <ellipse cx="24" cy="31" rx="11.5" ry="9.5" />
      <ellipse cx="8.5" cy="17.5" rx="5" ry="6.5" transform="rotate(-18 8.5 17.5)" />
      <ellipse cx="21.5" cy="9" rx="5.4" ry="7" />
      <ellipse cx="34.5" cy="9" rx="5.4" ry="7" />
      <ellipse cx="39.5" cy="17.5" rx="5" ry="6.5" transform="rotate(18 39.5 17.5)" />
    </svg>
  );
}
