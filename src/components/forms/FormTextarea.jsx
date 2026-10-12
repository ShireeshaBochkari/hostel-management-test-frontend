import React from 'react';

const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  required = false,
  disabled = false,
  maxLength,
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label} {required && <span style={{ color: 'var(--accent-rose)' }}>*</span>}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`form-control ${error ? 'error' : ''}`}
        style={{ resize: 'vertical' }}
      />

      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default FormTextarea;
