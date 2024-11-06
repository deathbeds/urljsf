import type { ChangeEvent, FocusEvent } from 'react';

import FormControl from 'react-bootstrap/esm/FormControl.js';
import InputGroup from 'react-bootstrap/esm/InputGroup.js';

import {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
  ariaDescribedByIds,
} from '@rjsf/utils';

export default function DataList<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({
  id,
  options,
  required,
  disabled,
  readonly,
  value,
  autofocus,
  placeholder,
  onBlur,
  onFocus,
  onChange,
}: WidgetProps<T, S, F>) {
  const listId = `${id}-datalist`;

  const enumOptions = options.options as string[];
  const _onChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>) =>
    onChange(currentTarget.value === '' ? options.emptyValue : currentTarget.value);
  const _onBlur = ({ currentTarget }: FocusEvent<HTMLInputElement>) =>
    onBlur(id, currentTarget?.value);
  const _onFocus = ({ currentTarget }: FocusEvent<HTMLInputElement>) =>
    onFocus(id, currentTarget?.value);

  let datalist = [
    <datalist id={listId}>
      {...(enumOptions as string[]).map((opt) => (
        <option value={opt} key={opt}></option>
      ))}
    </datalist>,
  ];

  const isChecked = enumOptions.includes(value);
  const checked = isChecked ? { checked: true } : {};
  const ariaLabel = `'${value}' is ${isChecked ? '' : 'not '}in ${enumOptions.length} choices`;
  const checkId = `${id}__datalist-check`;
  const describedByIds = `${ariaDescribedByIds<T>(id)} ${checkId}`;

  return (
    <InputGroup className="urljsf-datalist">
      <InputGroup.Text>
        <input
          id={checkId}
          type="checkbox"
          readOnly
          disabled
          {...checked}
          aria-label={ariaLabel}
        />
      </InputGroup.Text>
      <FormControl
        id={id}
        name={id}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        value={value}
        required={required}
        autoFocus={autofocus}
        onChange={_onChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
        aria-describedby={describedByIds}
        list={listId}
        spellcheck={false}
      />
      {...datalist}
    </InputGroup>
  );
}
