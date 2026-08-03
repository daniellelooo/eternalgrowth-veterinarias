"use client";

import { useState, useTransition } from "react";
import { bookAppointment } from "@/app/(public)/agendar/actions";
import type { Service } from "@/lib/types";
import { StepIndicator } from "./step-indicator";
import { ServiceStep } from "./service-step";
import { DateTimeStep } from "./date-time-step";
import { DetailsStep, type DetailsFormValues } from "./details-step";
import type { DayOption } from "./date-utils";

type Step = 1 | 2 | 3;

export function BookingWizard({
  services,
  days,
  whatsappHref,
}: {
  services: Service[];
  days: DayOption[];
  whatsappHref: string | null;
}) {
  const [step, setStep] = useState<Step>(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [dateIso, setDateIso] = useState<string | null>(null);
  const [slotIso, setSlotIso] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedService = services.find((s) => s.id === serviceId) ?? null;

  function handleSelectService(id: string) {
    setServiceId(id);
    // Cambiar de servicio invalida cualquier horario ya elegido (la
    // duración cambia, así que un slot libre para un servicio puede no
    // serlo para otro).
    setDateIso(null);
    setSlotIso(null);
  }

  function handleSubmit(values: DetailsFormValues) {
    if (!serviceId || !slotIso) return;
    setServerError(null);
    startTransition(async () => {
      const result = await bookAppointment({
        serviceId,
        startsAt: slotIso,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        petName: values.petName?.trim() ? values.petName.trim() : undefined,
        notes: values.notes?.trim() ? values.notes.trim() : undefined,
      });
      if (result?.error) {
        setServerError(result.error);
      }
    });
  }

  return (
    <div className="rounded-[2rem] bg-ink/5 p-2 ring-1 ring-ink/10">
      <div className="rounded-[1.6rem] bg-cream p-6 shadow-[0_1px_2px_rgba(34,29,23,0.05),0_16px_32px_-20px_rgba(34,29,23,0.35)] sm:p-8">
        <StepIndicator step={step} />

        {step === 1 && (
          <ServiceStep
            services={services}
            selectedId={serviceId}
            onSelect={handleSelectService}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && selectedService && (
          <DateTimeStep
            service={selectedService}
            days={days}
            dateIso={dateIso}
            slotIso={slotIso}
            whatsappHref={whatsappHref}
            onSelectDate={(iso) => {
              setDateIso(iso);
              setSlotIso(null);
            }}
            onSelectSlot={setSlotIso}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && selectedService && dateIso && slotIso && (
          <DetailsStep
            service={selectedService}
            dateIso={dateIso}
            slotIso={slotIso}
            pending={pending}
            serverError={serverError}
            onBack={() => {
              setServerError(null);
              setStep(2);
            }}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
