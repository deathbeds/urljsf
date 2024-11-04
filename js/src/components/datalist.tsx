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

  const checked = enumOptions.includes(value) ? { checked: true } : {};

  return (
    <InputGroup>
      <InputGroup.Text>
        <input type="checkbox" readOnly disabled {...checked} />
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
        aria-describedby={ariaDescribedByIds<T>(id)}
        list={listId}
      />
      {...datalist}
    </InputGroup>
  );
}
