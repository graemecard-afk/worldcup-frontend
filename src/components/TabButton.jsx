export default function TabButton({ active, children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      style={{
        flex: 1,
        padding: '8px 10px',
        borderRadius: '999px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.9rem',
        background: active ? '#3b82f6' : 'rgba(15,23,42,0.8)',
        color: active ? '#f9fafb' : '#e5e7eb',
        boxShadow: active
          ? '0 4px 12px rgba(59,130,246,0.5)'
          : '0 0 0 rgba(0,0,0,0)',
      }}
    >
      {children}
    </button>
  );
}
