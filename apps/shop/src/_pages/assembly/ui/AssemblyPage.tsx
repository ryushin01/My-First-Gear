import type { Metadata } from "next";
import Link from "next/link";
import { assemblyServices, formatPrice } from "@mfg/catalog";
import { PageHeading } from "@/shared/ui";
import { CrtScreen } from "@/widgets/crt-screen";

export const assemblyMetadata: Metadata = { title: "조립 서비스" };

const steps = [
  { title: "견적", body: "PC 견적에서 부품을 고르고 조립 서비스를 함께 담습니다." },
  { title: "검수", body: "부품이 입고되면 외관과 구성품을 확인합니다." },
  { title: "조립", body: "장착, 배선, 바이오스 설정을 마치고 선택한 작업을 진행합니다." },
  { title: "테스트", body: "부팅과 온도를 확인합니다. 24시간 테스트를 골랐다면 보고서를 함께 보냅니다." },
  { title: "배송", body: "부품이 움직이지 않게 고정해 완충 포장으로 보냅니다." },
];

export function AssemblyPage() {
  return (
    <CrtScreen source="ASSEMBLY">
      <div className="flex flex-col gap-14 py-10">
        <PageHeading label="Assembly service" title="조립 서비스">
          부품만 고르면 조립과 설치, 테스트까지 맡길 수 있습니다. 조립 서비스는 PC 견적에서 함께 주문합니다.
        </PageHeading>

        <section aria-labelledby="fee-title" className="flex flex-col gap-4">
          <h2 id="fee-title" className="font-display text-3xl md:text-4xl">
            요금
          </h2>
          <table className="w-full max-w-3xl border-collapse text-sm">
            <caption className="sr-only">조립 서비스 항목별 요금 (가상 요금)</caption>
            <thead>
              <tr className="border-b border-white/20 text-left font-mono text-xs uppercase text-label">
                <th scope="col" className="py-2 pr-4 font-normal">
                  항목
                </th>
                <th scope="col" className="py-2 pr-4 font-normal">
                  내용
                </th>
                <th scope="col" className="py-2 text-right font-normal">
                  요금
                </th>
              </tr>
            </thead>
            <tbody>
              {assemblyServices.map((service) => (
                <tr key={service.id} className="border-b border-white/10 align-top">
                  <th scope="row" className="py-3 pr-4 text-left font-normal">
                    {service.name}
                    {service.required && <span className="ml-2 font-mono text-[11px] text-label">[기본]</span>}
                  </th>
                  <td className="py-3 pr-4 text-mute-200">{service.description}</td>
                  <td className="py-3 text-right font-mono tabular-nums">{formatPrice(service.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section aria-labelledby="steps-title" className="flex flex-col gap-4">
          <h2 id="steps-title" className="font-display text-3xl md:text-4xl">
            진행 순서
          </h2>
          <ol className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-5">
            {steps.map((step, i) => (
              <li key={step.title} className="flex flex-col gap-2 bg-ink p-5">
                <span className="font-mono text-xs text-label">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-lg">{step.title}</span>
                <span className="text-sm text-mute-200">{step.body}</span>
              </li>
            ))}
          </ol>
        </section>

        <Link href="/build" className="inline-flex min-h-12 w-fit items-center rounded-md bg-cream px-6 font-medium text-ink hover:bg-white">
          PC 견적에서 조립 맡기기
        </Link>
      </div>
    </CrtScreen>
  );
}
