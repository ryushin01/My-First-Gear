/**
 * 데모 시드: 공개 데모 회원과 몇 개의 후기·질문.
 * 데모 회원 비밀번호는 demo1234 (scrypt, 고정 salt로 미리 계산한 해시)
 */
export const DEMO_MEMBER = {
  id: 1,
  email: "demo@myfirstgear.dev",
  name: "김기어",
  password: "demo1234",
  passwordHash: "scrypt$mfg-demo-salt-01$3Lu_oRwEDLMubedUEtxMFw0azqixCCXG5LvN57Y7HV4",
};

export const SEED_MEMBERS = [
  { id: 1, email: DEMO_MEMBER.email, name: DEMO_MEMBER.name, passwordHash: DEMO_MEMBER.passwordHash },
  { id: 2, email: "lee@example.com", name: "이데모", passwordHash: DEMO_MEMBER.passwordHash },
  { id: 3, email: "park@example.com", name: "박예시", passwordHash: DEMO_MEMBER.passwordHash },
];

export const SEED_REVIEWS = [
  { productId: "p-cpu-001", userId: 2, rating: 5, body: "게임 프레임이 확실히 올랐습니다. 공랭으로도 온도가 안정적이에요." },
  { productId: "p-cpu-001", userId: 3, rating: 4, body: "성능은 만족, 가격이 조금 아쉽습니다." },
  { productId: "p-case-001", userId: 2, rating: 5, body: "부품이 다 보여서 책상 위 오브제가 됐습니다. 조립 서비스 추천합니다." },
  { productId: "p-dap-003", userId: 3, rating: 5, body: "묵직한 무게만큼 소리가 차분합니다. 금색 바디가 예뻐요." },
  { productId: "p-bike-001", userId: 2, rating: 4, body: "지하철 타고 출근할 때 접어서 들고 다닙니다. 생각보다 가벼워요." },
  { productId: "p-watch-001", userId: 3, rating: 5, body: "38.5mm라 손목이 얇아도 잘 맞습니다." },
];

export const SEED_QUESTIONS = [
  {
    productId: "p-case-001",
    userId: 3,
    body: "RTX 5070 Ti도 들어가나요?",
    answer: "네, 그래픽카드 길이 330mm까지 장착할 수 있어 304mm인 RTX 5070 Ti는 들어갑니다.",
  },
  { productId: "p-gpu-001", userId: 2, body: "750W 파워로 충분할까요?", answer: null },
];
