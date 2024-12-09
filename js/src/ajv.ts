// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import validator, { customizeValidator } from '@rjsf/validator-ajv8';

import { AggregateAjvError } from '@segment/ajv-human-errors';
import type { ErrorObject } from 'ajv';

import { DEBUG } from './tokens.js';

export function getValidator(): typeof validator {
  const newValidator = customizeValidator();
  const { rawValidation } = validator;

  function humanizedRawValidation(...args: any[]) {
    const res = rawValidation.call(validator, ...args);
    return { ...res, errors: res.errors ? humanizeErrors(res.errors) : res.errors };
  }
  newValidator.rawValidation = humanizedRawValidation;
  return newValidator;
}

export function humanizeErrors(errors: ErrorObject[]): ErrorObject[] {
  try {
    const newErrors: ErrorObject[] = [];
    const aggregate = new AggregateAjvError(errors, {
      includeOriginalError: true,
    });
    const seenMessages: string[] = [];
    for (const { message, original } of aggregate) {
      if (seenMessages.includes(message)) {
        continue;
      }
      newErrors.push({ ...(original as any), message });
      seenMessages.push(message);
    }
    errors = newErrors;
  } catch (err) {
    /* istanbul ignore next */
    DEBUG && console.warn('failed to humanize errors: using raw errors', err);
  }
  return errors;
}
