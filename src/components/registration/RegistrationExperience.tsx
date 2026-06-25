"use client";

import Image from "next/image";
import { useActionState } from "react";
import type { CSSProperties } from "react";
import {
  BadgeCheck,
  CalendarDays,
  LockKeyhole,
  MapPin,
  Send,
  ShieldCheck,
  Timer,
  Users
} from "lucide-react";
import { submitRegistration } from "@/app/actions";
import type {
  FormField,
  RegistrationFormConfig
} from "@/lib/config/form-schema";
import type { ThemeConfig } from "@/lib/config/theme";
import {
  initialRegistrationState,
  type RegistrationActionState
} from "@/lib/registration/action-state";

type RegistrationExperienceProps = {
  formConfig: RegistrationFormConfig;
  theme: ThemeConfig;
};

export function RegistrationExperience({
  formConfig,
  theme
}: RegistrationExperienceProps) {
  const [state, formAction, isPending] = useActionState(
    submitRegistration,
    initialRegistrationState
  );

  const themeVars = {
    "--brand-primary": theme.brand.primary,
    "--brand-accent": theme.brand.accent,
    "--brand-success": theme.brand.success,
    "--brand-ink": theme.brand.ink,
    "--brand-surface": theme.brand.surface
  } as CSSProperties;

  return (
    <main className="registration-page" style={themeVars}>
      <section className="event-panel" aria-label="Event">
        <div className="brand-row">
          <Image
            src={theme.brand.logo}
            width={56}
            height={56}
            alt={theme.event.heroAlt}
            priority
          />
          <div>
            <p className="eyebrow">{theme.event.eyebrow}</p>
            <h1>{formConfig.event.name}</h1>
          </div>
        </div>

        <div className="event-facts" aria-label="Event details">
          <div>
            <CalendarDays aria-hidden="true" size={18} />
            <span>{formConfig.event.date}</span>
          </div>
          <div>
            <MapPin aria-hidden="true" size={18} />
            <span>{formConfig.event.location}</span>
          </div>
          <div>
            <Users aria-hidden="true" size={18} />
            <span>{formConfig.event.capacity.toLocaleString()} slots</span>
          </div>
        </div>

        <div className="status-grid" aria-label="Registration status">
          <div>
            <Timer aria-hidden="true" size={20} />
            <strong>10 min</strong>
            <span>reservation window</span>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" size={20} />
            <strong>Server</strong>
            <span>validated submission</span>
          </div>
          <div>
            <LockKeyhole aria-hidden="true" size={20} />
            <strong>Mock</strong>
            <span>inventory lock</span>
          </div>
        </div>

        <SponsorGrid sponsors={theme.sponsors} />
      </section>

      <section className="form-panel" aria-label="Registration form">
        <div className="form-heading">
          <div>
            <p className="eyebrow">{theme.event.status}</p>
            <h2>Runner registration</h2>
          </div>
          <BadgeCheck aria-hidden="true" size={28} />
        </div>

        <form action={formAction} noValidate>
          {formConfig.sections.map((section) => (
            <fieldset className="form-section" key={section.id}>
              <legend>
                <span>{section.title}</span>
                {section.description ? <small>{section.description}</small> : null}
              </legend>

              <div className="field-grid">
                {section.fields.map((field) => (
                  <FieldControl
                    key={field.id}
                    field={field}
                    error={state.fieldErrors[field.id]}
                  />
                ))}
              </div>
            </fieldset>
          ))}

          <div className="submit-row">
            <button type="submit" disabled={isPending}>
              <Send aria-hidden="true" size={18} />
              {isPending ? "Reserving" : "Reserve registration"}
            </button>
          </div>
        </form>

        <ActionResult state={state} />
      </section>
    </main>
  );
}

function FieldControl({
  field,
  error
}: {
  field: FormField;
  error?: string;
}) {
  const errorId = `${field.id}-error`;
  const commonProps = {
    id: field.id,
    name: field.id,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined
  };

  if (field.type === "textarea") {
    return (
      <label className="field field-full" htmlFor={field.id}>
        <span>{field.label}</span>
        <textarea
          {...commonProps}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          rows={4}
        />
        <FieldError id={errorId} error={error} />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="field" htmlFor={field.id}>
        <span>{field.label}</span>
        <select {...commonProps} defaultValue="">
          <option value="" disabled>
            Select
          </option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError id={errorId} error={error} />
      </label>
    );
  }

  if (field.type === "radio") {
    return (
      <div className="field field-full">
        <span>{field.label}</span>
        <div className="option-grid" role="radiogroup" aria-describedby={error ? errorId : undefined}>
          {field.options.map((option) => {
            const optionId = `${field.id}-${option.value}`;

            return (
              <label className="option" htmlFor={optionId} key={option.value}>
                <input
                  id={optionId}
                  type="radio"
                  name={field.id}
                  value={option.value}
                />
                <strong>{option.label}</strong>
                {option.description ? <small>{option.description}</small> : null}
              </label>
            );
          })}
        </div>
        <FieldError id={errorId} error={error} />
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="field checkbox-field" htmlFor={field.id}>
        <input id={field.id} type="checkbox" name={field.id} value="true" />
        <span>{field.label}</span>
        <FieldError id={errorId} error={error} />
      </label>
    );
  }

  return (
    <label className="field" htmlFor={field.id}>
      <span>{field.label}</span>
      <input
        {...commonProps}
        type={field.type}
        placeholder={field.placeholder}
        autoComplete={field.autocomplete}
        minLength={field.minLength}
        maxLength={field.maxLength}
      />
      <FieldError id={errorId} error={error} />
    </label>
  );
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) {
    return null;
  }

  return (
    <small className="field-error" id={id}>
      {error}
    </small>
  );
}

function ActionResult({
  state
}: {
  state: RegistrationActionState;
}) {
  if (state.status === "idle") {
    return null;
  }

  if (state.status === "error") {
    return (
      <div className="result result-error" role="alert">
        {state.message}
      </div>
    );
  }

  return (
    <div className="result result-success" role="status">
      <strong>{state.message}</strong>
      <span>Reservation ID: {state.reservation.id}</span>
      <span>Lock expires: {state.reservation.lockExpiresAt}</span>
    </div>
  );
}

function SponsorGrid({
  sponsors
}: {
  sponsors: ThemeConfig["sponsors"];
}) {
  if (sponsors.length === 0) {
    return null;
  }

  return (
    <div className="sponsor-grid" aria-label="Sponsors">
      {sponsors.map((sponsor) => (
        <div className="sponsor" key={sponsor.name}>
          <strong>{sponsor.name}</strong>
          <span>{sponsor.tier}</span>
        </div>
      ))}
    </div>
  );
}
