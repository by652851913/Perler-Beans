interface ToastProps {
  msg: string;
}

export default function Toast({ msg }: ToastProps) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-7 py-3 rounded-2xl
        font-bold text-sm z-[100] pointer-events-none transition-opacity duration-300
        bg-accent text-[#1a1a2e] shadow-lg shadow-accent/30
        ${msg ? 'opacity-100' : 'opacity-0'}`}
    >
      {msg || ' '}
    </div>
  );
}
