import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [msg, setMsg] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback((text: string) => {
    setMsg(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(''), 2200);
  }, []);

  return { toastMsg: msg, showToast: show };
}
