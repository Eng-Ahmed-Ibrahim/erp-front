import React from 'react';
import './FormField.scss';

const FormField = ({
  label,
  type = 'text',
  name,
  value,
  checked,
  onChange,
  placeholder,
  required = false,
  error = null,
  options = [],
  className = '',
  disabled = false,
  ...props
}) => {
  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={`form-field__input ${
              error ? 'form-field__input--error' : ''
            }`}
            required={required}
            disabled={disabled}
            {...props}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`form-field__input form-field__input--textarea ${
              error ? 'form-field__input--error' : ''
            }`}
            required={required}
            disabled={disabled}
            {...props}
          />
        );

      case 'checkbox':
        const isSingleCheckbox =
          options.length === 1 &&
          (typeof options[0].value === 'boolean' || options[0].value === true);
        return (
          <div
            className={`form-field__checkbox-group ${
              isSingleCheckbox ? 'single-checkbox' : ''
            }`}
          >
            {options.map((option) => (
              <label key={option.value} className="form-field__checkbox-label">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={
                    isSingleCheckbox
                      ? checked
                      : Array.isArray(value) && value.includes(option.value)
                  }
                  onChange={(e) => {
                    console.log('FormField checkbox onChange:', {
                      name,
                      optionValue: option.value,
                      checked: e.target.checked,
                      isSingleCheckbox,
                      currentValue: value,
                      checkedProp: checked,
                    });

                    if (isSingleCheckbox) {
                      onChange({
                        target: {
                          name: name,
                          type: 'checkbox',
                          checked: e.target.checked,
                        },
                      });
                    } else {
                      const currentValue = Array.isArray(value) ? value : [];
                      const newValue = e.target.checked
                        ? [...currentValue, option.value]
                        : currentValue.filter((v) => v !== option.value);
                      console.log('Working days newValue:', newValue);
                      onChange({ target: { name: name, value: newValue } });
                    }
                  }}
                  disabled={disabled}
                />
                <span className="form-field__checkbox-text">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`form-field__input ${
              error ? 'form-field__input--error' : ''
            }`}
            required={required}
            disabled={disabled}
            {...props}
          />
        );
    }
  };

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      {renderInput()}
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
};

export default FormField;
