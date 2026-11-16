const KEY = "mfg:member-owner";

/**
 * 이 기기의 장바구니·견적이 어느 회원 것인지(서버 값과 합친 회원의 표식). 손님 값이면 null.
 * 로그아웃하지 않고 다른 회원으로 로그인하거나, 세션이 끝난 뒤 다른 사람이 로그인할 때
 * 이전 회원의 값을 그 사람 계정에 합치지 않으려고 둔다.
 */
export function readDeviceOwner(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function writeDeviceOwner(owner: string | null) {
  try {
    if (owner) window.localStorage.setItem(KEY, owner);
    else window.localStorage.removeItem(KEY);
  } catch {
    // 저장소를 쓸 수 없으면(사생활 보호 모드 등) 표식 없이 동작한다.
  }
}
