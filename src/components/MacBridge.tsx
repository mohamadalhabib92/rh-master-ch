import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { isMacApp, onGlossaryFind, requestGlossaryFind, subscribeMacKeys } from '../lib/mac-runtime';

type Entry = { id: number; press: () => void; y: number };

type MacFocusApi = {
  enabled: boolean;
  activeId: number | null;
  register: (id: number, press: () => void) => () => void;
  setY: (id: number, y: number) => void;
  scrollTo: (y: number) => void;
  setScroll: (fn: ((y: number) => void) | null) => void;
};

const MacFocusContext = createContext<MacFocusApi | null>(null);

let nextFocusId = 1;

export function useMacItem(active: boolean) {
  const ctx = useContext(MacFocusContext);
  const id = useRef(0);
  if (id.current === 0) id.current = nextFocusId++;
  const press = useRef<(() => void) | undefined>(undefined);
  useEffect(() => {
    if (!ctx?.enabled || !active) return undefined;
    return ctx.register(id.current, () => press.current?.());
  }, [active, ctx]);
  const focused = !!ctx?.enabled && ctx.activeId === id.current;
  return {
    focused,
    setPress(fn: (() => void) | undefined) {
      press.current = fn;
    },
    onLayout: (y: number) => ctx?.setY(id.current, y),
  };
}

export function MacBridge({ children }: { children: React.ReactNode }) {
  const enabled = isMacApp();
  const entries = useRef(new Map<number, Entry>());
  const [activeId, setActiveId] = useState<number | null>(null);
  const scroll = useRef<((y: number) => void) | null>(null);

  const api = useMemo<MacFocusApi>(
    () => ({
      enabled,
      activeId,
      register(id, press) {
        entries.current.set(id, { id, press, y: entries.current.get(id)?.y ?? 0 });
        return () => entries.current.delete(id);
      },
      setY(id, y) {
        const entry = entries.current.get(id);
        if (entry) entry.y = y;
      },
      scrollTo(y) {
        scroll.current?.(y);
      },
      setScroll(fn) {
        scroll.current = fn;
      },
    }),
    [activeId, enabled],
  );

  useEffect(() => {
    if (!enabled) return undefined;
    const move = (delta: number) => {
      const list = [...entries.current.values()].sort((a, b) => a.id - b.id);
      if (list.length === 0) return;
      const current = list.findIndex((item) => item.id === activeId);
      const next = list[(current + delta + list.length) % list.length];
      setActiveId(next.id);
      scroll.current?.(next.y);
    };
    return subscribeMacKeys((key) => {
      if (key === 'escape') {
        if (router.canGoBack()) router.back();
        return;
      }
      if (key === 'find') {
        router.push('/glossary');
        requestGlossaryFind();
        return;
      }
      if (key === 'down' || key === 'right' || key === 'tab') {
        move(1);
        return;
      }
      if (key === 'up' || key === 'left' || key === 'shift-tab') {
        move(-1);
        return;
      }
      if (key === 'enter' || key === 'space') {
        const list = [...entries.current.values()];
        const current = list.find((item) => item.id === activeId) ?? list[0];
        if (!current) return;
        setActiveId(current.id);
        current.press();
      }
    });
  }, [activeId, enabled]);

  return <MacFocusContext.Provider value={api}>{children}</MacFocusContext.Provider>;
}

export function useMacScroll(scrollTo: (y: number) => void) {
  const ctx = useContext(MacFocusContext);
  useEffect(() => {
    ctx?.setScroll(scrollTo);
    return () => ctx?.setScroll(null);
  }, [ctx, scrollTo]);
}

export { onGlossaryFind };
