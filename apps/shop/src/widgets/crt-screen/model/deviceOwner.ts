const KEY = "mfg:member-owner";

// 저장소를 쓸 수 없으면(사생활 보호 모드, 용량 초과 등) 이 탭에서 마지막으로 적은 값을 쓴다.
// 읽지 못한 표식을 손님(null)으로 보면 이전 회원의 값을 새 회원 계정에 합칠 수 있기 때문이다.
let memoryOwner: string | null = null;
let storageOk = true;

/**
 * 이 기기의 장바구니·견적이 어느 회원 것인지(서버 값과 합친 회원의 표식). 손님 값이면 null.
 * 로그아웃하지 않고 다른 회원으로 로그인하거나, 세션이 끝난 뒤 다른 사람이 로그인할 때
 * 이전 회원의 값을 그 사람 계정에 합치지 않으려고 둔다.
 */
export function readDeviceOwner(): string | null {
  if (!storageOk) return memoryOwner;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    storageOk = false;
    return memoryOwner;
  }
}

export function writeDeviceOwner(owner: string | null) {
  memoryOwner = owner;
  try {
    if (owner) window.localStorage.setItem(KEY, owner);
    else window.localStorage.removeItem(KEY);
  } catch {
    storageOk = false;
  }
}
