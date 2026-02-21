export default function PublicFooter() {
  return (
    <footer id="contacto" className="mt-16 bg-emerald-800 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <p className="font-extrabold text-lg">RemesaCapital</p>
          <p className="text-white/80 text-sm mt-2">
            Simula tu cambio CLP ↔ BOB y contacta a un ejecutivo por WhatsApp.
          </p>
        </div>

        <div>
          <p className="font-bold">Información</p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>Términos, condiciones y privacidad</li>
            <li>Atención personalizada</li>
            <li>Tasas competitivas</li>
          </ul>
        </div>

        <div>
          <p className="font-bold">Soporte</p>
          <p className="mt-3 text-sm text-white/80">
            ¿Dudas? Contacta con un asesor desde el simulador.
          </p>
          <div className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs text-white/80">
            Horario: Lun–Dom · 09:00–23:00
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/70">
          <span>© {new Date().getFullYear()} RemesaCapital. Todos los derechos reservados.</span>
          <span>Operación sujeta a validación del ejecutivo.</span>
        </div>
      </div>
    </footer>
  );
}