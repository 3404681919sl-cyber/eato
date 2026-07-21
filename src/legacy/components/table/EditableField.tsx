import React, { useState } from 'react';

interface EditableFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export default function EditableField({ value, onChange, placeholder, multiline }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [tmp, setTmp] = useState(value);

  if (!editing) {
    return (
      <span onClick={() => { setTmp(value); setEditing(true); }}
        className={'cursor-pointer hover:opacity-70 transition-opacity ' + (value ? '' : 'text-muted-foreground/40')}>
        {value || placeholder || '点击编辑'}
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea value={tmp} onChange={(e) => setTmp(e.target.value)}
        onBlur={() => { onChange(tmp); setEditing(false); }}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onChange(tmp); setEditing(false); } }}
        className='w-full text-xs bg-transparent border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none'
        rows={2} autoFocus placeholder={placeholder} />
    );
  }

  return (
    <input value={tmp} onChange={(e) => setTmp(e.target.value)}
      onBlur={() => { onChange(tmp); setEditing(false); }}
      onKeyDown={(e) => { if (e.key === 'Enter') { onChange(tmp); setEditing(false); } }}
      className='w-full text-xs bg-transparent border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/30'
      autoFocus placeholder={placeholder} />
  );
}