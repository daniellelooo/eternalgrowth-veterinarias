"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Service } from "@/lib/types";
import { formatFullDateLabel, formatSlotTime } from "./date-utils";

// Misma regla que valida el servidor en `createPublicAppointment`: celular
// colombiano de 10 dígitos que empieza en 3. Se duplica aquí a propósito
// para dar feedback inmediato sin ida y vuelta al servidor; el servidor
// sigue siendo la autoridad final.
const detailsSchema = z.object({
  customerName: z.string().trim().min(2, "Ingresa tu nombre completo."),
  customerPhone: z
    .string()
    .trim()
    .regex(/^3\d{9}$/, "Ingresa un celular colombiano válido (10 dígitos, inicia en 3)."),
  petName: z.string().trim().max(80, "Máximo 80 caracteres.").optional(),
  notes: z.string().trim().max(500, "Máximo 500 caracteres.").optional(),
});

export type DetailsFormValues = z.infer<typeof detailsSchema>;

interface FormState {
  customerName: string;
  customerPhone: string;
  petName: string;
  notes: string;
}

interface DetailsStepProps {
  service: Service;
  dateIso: string;
  slotIso: string;
  pending: boolean;
  serverError: string | null;
  onBack: () => void;
  onSubmit: (values: DetailsFormValues) => void;
}

/** Paso 3: datos de contacto. Valida con zod en cliente; el servidor revalida todo de nuevo. */
export function DetailsStep({ service, dateIso, slotIso, pending, serverError, onBack, onSubmit }: DetailsStepProps) {
  const [values, setValues] = useState<FormState>({
    customerName: "",
    customerPhone: "",
    petName: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = detailsSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-xl text-pine sm:text-2xl">Cuéntanos quién viene</h2>
        <p className="mt-1 text-sm text-ink/60">Usamos estos datos para confirmar la cita por WhatsApp.</p>
      </div>

      <div className="rounded-2xl bg-sage-tint/50 p-4 sm:p-5">
        <p className="text-xs font-medium tracking-[0.14em] text-clay uppercase">Resumen</p>
        <p className="mt-1.5 font-heading text-lg text-pine">{service.name}</p>
        <p className="text-sm text-ink/70">
          {formatFullDateLabel(dateIso)} · {formatSlotTime(slotIso)}
        </p>
      </div>

      <FieldGroup>
        <Field data-invalid={!!errors.customerName}>
          <FieldLabel htmlFor="customerName">Nombre completo</FieldLabel>
          <FieldContent>
            <Input
              id="customerName"
              name="customerName"
              autoComplete="name"
              placeholder="Ej. María Gómez"
              value={values.customerName}
              onChange={(e) => setValues((v) => ({ ...v, customerName: e.target.value }))}
              aria-invalid={!!errors.customerName}
            />
            <FieldError>{errors.customerName}</FieldError>
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.customerPhone}>
          <FieldLabel htmlFor="customerPhone">Celular (WhatsApp)</FieldLabel>
          <FieldContent>
            <Input
              id="customerPhone"
              name="customerPhone"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="3001234567"
              value={values.customerPhone}
              onChange={(e) =>
                setValues((v) => ({ ...v, customerPhone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) }))
              }
              aria-invalid={!!errors.customerPhone}
            />
            <FieldDescription>10 dígitos, empieza en 3. Ahí te confirmamos la cita.</FieldDescription>
            <FieldError>{errors.customerPhone}</FieldError>
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.petName}>
          <FieldLabel htmlFor="petName">Nombre de la mascota (opcional)</FieldLabel>
          <FieldContent>
            <Input
              id="petName"
              name="petName"
              placeholder="Ej. Toby"
              value={values.petName}
              onChange={(e) => setValues((v) => ({ ...v, petName: e.target.value }))}
              aria-invalid={!!errors.petName}
            />
            <FieldError>{errors.petName}</FieldError>
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.notes}>
          <FieldLabel htmlFor="notes">Nota para la clínica (opcional)</FieldLabel>
          <FieldContent>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Cuéntanos algo que debamos saber antes de la cita"
              value={values.notes}
              onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
              aria-invalid={!!errors.notes}
            />
            <FieldError>{errors.notes}</FieldError>
          </FieldContent>
        </Field>
      </FieldGroup>

      {serverError && (
        <div role="alert" className="rounded-xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">
          {serverError}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={pending}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 transition-colors hover:text-pine disabled:pointer-events-none disabled:opacity-40"
        >
          <ArrowLeft className="size-3.5" /> Atrás
        </button>
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex items-center justify-between gap-4 rounded-full bg-amber py-1.5 pr-1.5 pl-6 text-base font-semibold text-ink shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-amber-deep active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? "Agendando…" : "Confirmar cita"}
          <span className="flex size-9 items-center justify-center rounded-full bg-ink/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          </span>
        </button>
      </div>
    </form>
  );
}
