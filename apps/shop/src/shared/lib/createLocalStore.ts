/**
 * localStorage에 저장하는 작은 외부 스토어. useSyncExternalStore와 함께 쓴다.
 * 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서도 메모리 값으로 동작한다.
 * isValid를 주면 저장된 값의 모양을 검사해, 맞지 않으면 초기값을 쓴다.
 */
export function createLocalStore<T>(key: string, initial: T, isValid?: (value: unknown) => value is T) {
  let value: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        value = !isValid || isValid(parsed) ? (parsed as T) : initial;
      }
    } catch {
      // 읽지 못하면 초기값을 쓴다.
    }
  }

  return {
    get(): T {
      load();
      return value;
    },
    getServer(): T {
      return initial;
    },
    set(next: T | ((prev: T) => T)) {
      load();
      value = typeof next === "function" ? (next as (prev: T) => T)(value) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // 저장하지 못해도 이번 화면에서는 값을 유지한다.
      }
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key !== key) return;
        loaded = false;
        listener();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
}
