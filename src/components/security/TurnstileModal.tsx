import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const TURNSTILE_SCRIPT_ID = 'ainzroutes-turnstile-script';
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let turnstileScriptPromise: Promise<void> | null = null;

const ensureTurnstileScript = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('A verificação de segurança não está disponível neste ambiente.'));
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Não foi possível carregar a verificação de segurança.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Não foi possível carregar a verificação de segurança.'));
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
};

interface TurnstileModalProps {
  open: boolean;
  action: 'ip_analyzer' | 'port_scanner' | 'service_monitor';
  title: string;
  description: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (token: string) => Promise<void> | void;
}

export const TurnstileModal = ({ open, action, title, description, isSubmitting = false, onClose, onConfirm }: TurnstileModalProps) => {
  const siteKey = useMemo(() => import.meta.env.VITE_TURNSTILE_SITE_KEY || '', []);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setToken(null);
      setError(null);

      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }

      return;
    }

    if (!siteKey) {
      setError('A verificação de segurança está indisponível no momento. Tente novamente mais tarde.');
      return;
    }

    let cancelled = false;

    ensureTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) {
          return;
        }

        containerRef.current.innerHTML = '';

        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            action,
            theme: 'light',
            appearance: 'always',
            callback: (nextToken) => {
              setToken(nextToken);
              setError(null);
            },
            'expired-callback': () => {
              setToken(null);
              setError('A verificação expirou. Faça a validação novamente.');
            },
            'error-callback': () => {
              setToken(null);
              setError('Não foi possível concluir a verificação de segurança. Tente novamente.');
            },
          });
        } catch {
          setError('Não foi possível exibir a verificação de segurança.');
        }
      })
      .catch((scriptError: Error) => {
        if (!cancelled) {
          setError(scriptError.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [action, open, siteKey]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const handleConfirm = async () => {
    if (!token) {
      setError('Conclua a verificação antes de continuar.');
      return;
    }

    setError(null);
    await onConfirm(token);
  };

  const handleClose = () => {
    setToken(null);
    setError(null);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-emerald-100 bg-white p-6 shadow-[0_28px_70px_rgba(15,23,42,0.18)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Verificação de segurança</p>
          <h3 className="mt-3 text-2xl font-bold text-slate-900">{title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-100 bg-[#f7fff9] p-4">
          <div ref={containerRef} className="flex min-h-[72px] items-center justify-center overflow-hidden" />
        </div>

        {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!token || isSubmitting}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-500 disabled:bg-emerald-200"
          >
            {isSubmitting ? 'Validando...' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
