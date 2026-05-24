import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../i18n/I18nProvider";

const ROTATE_MS = 1750;

type Props = {
  phase?: "create" | "confirm";
};

export function CreateAgentLoadingOverlay({ phase = "create" }: Props) {
  const { t } = useI18n();
  const messages = useMemo(
    () =>
      phase === "confirm"
        ? [t("loading.confirm0"), t("loading.confirm1"), t("loading.confirm2")]
        : [t("loading.create0"), t("loading.create1"), t("loading.create2")],
    [phase, t],
  );
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setIndex(0);
  }, [phase]);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % messages.length);
        setVisible(true);
      }, 180);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="create-flow-overlay create-flow-loading" role="status" aria-live="polite">
      <div className="create-flow-loading__inner">
        <div className="create-flow-loading__spinner" aria-hidden />
        <p
          className={`create-flow-loading__message ${visible ? "" : "create-flow-loading__message--fade"}`}
        >
          {messages[index]}
        </p>
      </div>
    </div>
  );
}
