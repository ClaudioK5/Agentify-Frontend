import { useEffect } from "react";
import { useI18n } from "../i18n/I18nProvider";
import type { ExamplePair } from "../hooks/useCreateAgentPrompt";

type ExamplesModalProps = {
  open: boolean;
  pairs: ExamplePair[];
  onClose: () => void;
};

export function ExamplesModal({ open, pairs, onClose }: ExamplesModalProps) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="examples-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="examples-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="examples-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="examples-modal-title" className="examples-modal-title">
          {t("create.examplesTitle")}
        </h2>
        <div className="examples-modal-scroll">
          <ul className="examples-list">
            {pairs.map((example, index) => (
              <li
                key={`${example.title}-${index}`}
                className="example-card"
              >
                <p className="example-card__title">✨ {example.title}</p>
                {example.detail ? (
                  <p className="example-card__detail">{example.detail}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
        <button type="button" className="btn btn--primary" onClick={onClose}>
          {t("create.examplesClose")}
        </button>
      </div>
    </div>
  );
}
