/**
 * localStorage에 저장하는 작은 외부 스토어. useSyncExternalStore와 함께 쓴다.
 * 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서도 메모리 값으로 동작한다.
 *
 * parse: 저장된 값을 검사해 쓸 수 있는 모양으로 정리한다. 쓸 수 없으면 null을 돌려주고, 그러면 초기값을 쓴다.
 * 손상되거나 예전 형식인 값을 그대로 쓰면 첫 렌더에서 던져 화면 전체가 열리지 않는다(머리글의 장바구니 수량 등).
 */
export function createLocalStore<T>(key: string, initial: T, parse?: (value: unknown) => T | null) {
  let value: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    value = initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        value = parse ? (parse(parsed) ?? initial) : (parsed as T);
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

/** 문자열 배열만 받는다. 배열이 아니면 null, 문자열이 아닌 항목은 뺀다. (비교 목록, 최근 본 상품, 최근 검색어) */
export function parseStringList(value: unknown): string[] | null {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : null;
}
