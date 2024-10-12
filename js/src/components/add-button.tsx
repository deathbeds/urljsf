import Button from 'react-bootstrap/esm/Button.js';

import type {
  FormContextType,
  IconButtonProps,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import { TranslatableString } from '@rjsf/utils';

export function LabeledAddButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({ uiSchema, registry, ...props }: IconButtonProps<T, S, F>) {
  const { translateString } = registry;
  const title = props.title ? `: ${props.title}` : '';
  return (
    <Button
      {...(props as any)}
      style={{ width: '100%' }}
      className={`${props.className}`}
    >
      {translateString(TranslatableString.AddItemButton)}
      {title}
    </Button>
  );
}
