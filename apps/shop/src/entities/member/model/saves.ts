/**
 * 회원 장바구니·견적을 서버에 저장하는 일을 잠시 모았다가 한 번에 보낸다(바뀔 때마다 보내지 않게).
 * 로그아웃은 세션을 지우기 전에 flushMemberSaves로 남은 일을 바로 끝내고, 서버가 받았는지 확인한다.
 */
export type MemberSaver = {
  /** 바뀌었다고 알린다. delay가 지나도록 더 바뀌지 않으면 저장한다. */
  schedule(): void;
  /** 남은 저장을 바로 보내고 끝날 때까지 기다린다(보내는 사이 또 바뀐 것까지). 다 보냈거나 보낼 것이 없으면 true, save가 던지면 false */
  flush(): Promise<boolean>;
  /** 남은 저장을 버린다. 서버 세션이 끝나 더 저장할 곳이 없을 때 쓴다. */
  cancel(): void;
};

/** save가 던지면(네트워크 끊김, 서버 오류) 실패로 보고, 다음 저장 때 다시 보낸다. */
export function createMemberSaver(save: () => Promise<unknown>, delay = 800): MemberSaver {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let dirty = false;
  let running: Promise<boolean> | null = null;
  // cancel()마다 올라간다. 취소하기 전에 보낸 저장은 실패해도 다시 보내지 않는다.
  let epoch = 0;

  async function flush(): Promise<boolean> {
    // 보내는 중이면 끝나기를 기다린다. 그사이 바뀌었거나 실패했으면 다시 보낸다.
    while (running) await running;
    // 보내는 사이 또 바뀌면(schedule) 그것까지 보낸 뒤에 끝낸다.
    while (dirty) {
      clearTimeout(timer);
      timer = undefined;
      dirty = false;
      const attemptEpoch = epoch;
      const attempt = save().then(
        () => true,
        () => {
          if (attemptEpoch === epoch) dirty = true;
          return false;
        },
      );
      running = attempt;
      let ok: boolean;
      try {
        ok = await attempt;
      } finally {
        if (running === attempt) running = null;
      }
      if (!ok) return false;
    }
    return true;
  }

  return {
    schedule() {
      dirty = true;
      clearTimeout(timer);
      timer = setTimeout(() => void flush(), delay);
    },
    flush,
    cancel() {
      clearTimeout(timer);
      timer = undefined;
      dirty = false;
      epoch++;
    },
  };
}

type SyncHandler = () => Promise<boolean>;
let syncHandler: SyncHandler | null = null;

/** 회원 동기화(widgets/crt-screen의 MemberSync)가 "지금 서버와 맞추기"를 맡긴다. */
export function setMemberSyncHandler(handler: SyncHandler | null) {
  syncHandler = handler;
}

/**
 * 로그아웃 전에 부른다. 아직 서버 값과 합치지 않았거나 모아 둔 저장이 있으면 지금 보내고 기다린다.
 * 서버가 받았거나 더 저장할 곳이 없으면(서버 세션이 끝남, DB 없음) true, 받지 못했으면 false.
 */
export async function flushMemberSaves(): Promise<boolean> {
  if (!syncHandler) return true;
  try {
    return await syncHandler();
  } catch {
    return false;
  }
}
