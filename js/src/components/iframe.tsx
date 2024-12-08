// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import { createPortal, useState } from 'react';
import type { JSX } from 'react';

/** an interface for iframe props */
interface IFrameProps {
  children: JSX.Element | JSX.Element[];
  style?: string;
}

/** an iframe component for isolating CSS */
export function IFrame(props: IFrameProps): JSX.Element {
  const [ref, setRef] = useState<HTMLIFrameElement>();
  const container = ref?.contentWindow?.document?.body;

  return (
    <iframe ref={setRef as any} {...props}>
      {container && createPortal(props.children, container)}
    </iframe>
  );
}
