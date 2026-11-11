import { useEffect, useRef, type ReactNode } from 'react';
import { XIcon } from './Icons';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Extra class on the sheet, e.g. "confirm" for small dialogs. */
  className?: string;
}

/*
 * Open modals form a stack: Escape closes only the top one, and the page
 * behind stays locked until the last modal closes.
 */
const stack: number[] = [];
let seq = 0;

export function Modal({ title, onClose, children, footer, className = '' }: Props) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const id = ++seq;
    stack.push(id);
    document.body.classList.add('no-scroll');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stack[stack.length - 1] === id) onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      stack.splice(stack.indexOf(id), 1);
      if (!stack.length) document.body.classList.remove('no-scroll');
    };
  }, []);

  return (
    <div className="modal-backdrop" onClick={() => onCloseRef.current()}>
      <div
        className={`modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={() => onCloseRef.current()} aria-label="Close">
            <XIcon />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
