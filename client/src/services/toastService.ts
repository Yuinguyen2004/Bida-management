export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}

type ToastSubscriber = (toast: ToastMessage) => void;

let seed = 0;
const subscribers = new Set<ToastSubscriber>();
let isToastUIInitialized = false;
let lastToastSignature = '';
let lastToastAt = 0;
const TOAST_DEDUPE_WINDOW_MS = 1200;

const emit = (toast: Omit<ToastMessage, 'id'>) => {
  const signature = `${toast.type}:${toast.message}`;
  const now = Date.now();

  if (signature === lastToastSignature && now - lastToastAt < TOAST_DEDUPE_WINDOW_MS) {
    return;
  }

  lastToastSignature = signature;
  lastToastAt = now;

  const nextToast: ToastMessage = {
    id: ++seed,
    duration: 3000,
    ...toast,
  };

  subscribers.forEach((subscriber) => subscriber(nextToast));
};

const subscribe = (subscriber: ToastSubscriber) => {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
};

const success = (message: string, duration?: number) => {
  emit({ type: 'success', message, duration });
};

const error = (message: string, duration?: number) => {
  emit({ type: 'error', message, duration });
};

const info = (message: string, duration?: number) => {
  emit({ type: 'info', message, duration });
};

const getErrorMessage = (value: unknown, fallback = 'Something went wrong') => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (value && typeof value === 'object') {
    const maybeMessage = (value as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage;
    }
  }

  return fallback;
};

const getToastBackground = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'linear-gradient(135deg, #16a34a, #15803d)';
    case 'error':
      return 'linear-gradient(135deg, #ef4444, #dc2626)';
    default:
      return 'linear-gradient(135deg, #2563eb, #1d4ed8)';
  }
};

const initToastUI = () => {
  if (isToastUIInitialized || typeof document === 'undefined') {
    return;
  }

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '20px';
  container.style.right = '20px';
  container.style.zIndex = '9999';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '10px';
  container.style.width = 'min(360px, calc(100vw - 24px))';

  document.body.appendChild(container);

  subscribe((toast) => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.justifyContent = 'space-between';
    item.style.gap = '10px';
    item.style.borderRadius = '10px';
    item.style.padding = '12px 14px';
    item.style.color = '#ffffff';
    item.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.25)';
    item.style.fontSize = '14px';
    item.style.background = getToastBackground(toast.type);

    const text = document.createElement('span');
    text.textContent = toast.message;

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', 'Close notification');
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = 'inherit';
    closeButton.style.fontSize = '18px';
    closeButton.style.lineHeight = '1';
    closeButton.style.cursor = 'pointer';
    closeButton.style.opacity = '0.9';
    closeButton.onmouseenter = () => {
      closeButton.style.opacity = '1';
    };
    closeButton.onmouseleave = () => {
      closeButton.style.opacity = '0.9';
    };

    const removeToast = () => {
      if (container.contains(item)) {
        container.removeChild(item);
      }
    };

    closeButton.onclick = removeToast;

    item.appendChild(text);
    item.appendChild(closeButton);

    if (container.childElementCount >= 4) {
      container.removeChild(container.firstElementChild as Node);
    }

    container.appendChild(item);

    window.setTimeout(removeToast, toast.duration ?? 3000);
  });

  isToastUIInitialized = true;
};

export const toastService = {
  subscribe,
  success,
  error,
  info,
  getErrorMessage,
  initToastUI,
};
