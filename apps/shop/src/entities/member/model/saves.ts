/**
 * 회원 장바구니·견적을 서버에 저장하는 일을 잠시 모았다가 한 번에 보낸다(바뀔 때마다 보내지 않게).
 * 로그아웃은 세션을 지우기 전에 flushMemberSaves로 남은 저장을 바로 보내고, 서버가 받았는지 확인한다.
 */
export type MemberSaver = {
  /** 바뀌었다고 알린다. delay가 지나도록 더 바뀌지 않으면 저장한다. */
  schedule(): void;
  /** 남은 저장을 바로 보내고 끝날 때까지 기다린다. 서버가 받았거나 보낼 것이 없으면 true */
  flush(): Promise<boolean>;
};

const savers = new Set<MemberSaver>();

/** save가 던지면(네트워크 끊김, 서버 오류) 실패로 보고, 다음 저장 때 다시 보낸다. */
export function createMemberSaver(save: () => Promise<unknown>, delay = 800): MemberSaver {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let dirty = false;
  let running: Promise<boolean> | null = null;

  async function flush(): Promise<boolean> {
    clearTimeout(timer);
    timer = undefined;
    // 보내는 중이면 끝나기를 기다린다. 그사이 바뀌었거나 실패했으면 다시 보낸다.
    while (running) await running;
    if (!dirty) return true;
    dirty = false;
    const attempt = save().then(
      () => true,
      () => {
        dirty = true;
        return false;
      },
    );
    running = attempt;
    try {
      return await attempt;
    } finally {
      if (running === attempt) running = null;
    }
  }

  const saver: MemberSaver = {
    schedule() {
      dirty = true;
      clearTimeout(timer);
      timer = setTimeout(() => void flush(), delay);
    },
    flush,
  };
  savers.add(saver);
  return saver;
}

/** 모든 저장을 바로 보내고 기다린다. 하나라도 서버가 받지 못했으면 false */
export async function flushMemberSaves(): Promise<boolean> {
  const results = await Promise.all([...savers].map((saver) => saver.flush()));
  return results.every(Boolean);
}
