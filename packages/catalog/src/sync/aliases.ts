/**
 * slug는 다르지만 V에서 같은 제품인 모델 id. 쇼핑몰 slug → V 모델 id.
 * 이 표가 있어야 두 앱이 같은 제품을 서로 한 번 더 가져오지 않는다. 피드에 실려 V도 같은 표를 쓴다.
 */
export const vAliases: Readonly<Record<string, readonly string[]>> = {
  "alienware-aw3423dwf": ["dell-alienware-aw3423dwf"],
  "playstation-5-pro": ["sony-ps5-pro"],
  "nintendo-switch-2": ["nintendo-switch-2-dock"],
  "macbook-air-13-m4": ["apple-macbook-air-13"],
  "herman-miller-aeron": ["herman-miller-aeron-b"],
  "hhkb-professional-hybrid-type-s-snow": ["hhkb-hybrid-type-s"],
  "realforce-r3-tkl": ["realforce-r3tl"],
  "maywood-homage-motion-desk": ["maywood-homage-1600"],
  "linak-dl6-dual-motor": ["linak-dl6-experience"],
  "fellowes-flex-1fm": ["fellowes-tallo-modular-1fm"],
  "philips-hue-gradient-signe-floor": ["philips-hue-signe-gradient-floor"],
  "edifier-qr65": ["edifier-qr65-active", "edifier-qr65-passive"],
};
