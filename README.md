# 🏃‍♂️ opnrun: 고부하 마라톤/러닝 등록을 위한 오픈소스 플랫폼
> **Zero-Ops, AI-First DX, 그리고 완벽한 결제 정합성을 지향하는 초경량 이벤트 접수 보일러플레이트**

본 문서는 오픈소스 마라톤/러닝 등록 플랫폼 **opnrun**의 제품 요구사항 문서(PRD) 및 클라우드 기술 아키텍처 명세서입니다. 기존 등록 플랫폼들의 기술적 한계(트래픽 다운, 결제 데이터 누락, 끼워팔기 광고 등)를 극복하고, 포크(Fork)하여 사용하는 개발자와 AI 어시스턴트(Claude Code, Cursor 등)가 가장 빠르고 안전하게 커스텀 배포할 수 있도록 설계되었습니다.

---

## 📋 목차
1. [제품 비전 및 핵심 가치](#1-제품-비전-및-핵심-가치)
2. [제품 요구사항 명세서 (PRD)](#2-제품-요구사항-명세서-prd)
3. [AI-First DX (Developer Experience) 규격](#3-ai-first-dx-developer-experience-규격)
4. [클라우드 아키텍처 설계 (Vercel, Cloudflare, AWS)](#4-클라우드-아키텍처-설계-vercel-cloudflare-aws)
5. [보안 및 규정 준수 (Security & Compliance)](#5-보안-및-규정-준수-security--compliance)

---

## 1. 제품 비전 및 핵심 가치

### 1.1 배경 및 문제 의식
* **피켓팅이 된 마라톤 접수**: 러닝 인구의 폭발적 증가로 신청 시작 직후 수만 명의 동시 접속자가 발생하여 지자체 및 브랜드 마라톤 웹사이트가 마비되는 현상이 정형화된 각본처럼 되풀이되고 있습니다 [22, 23, 278, 279, 293].
* **결제 정합성 및 데이터 유실**: 사용자가 신청서를 작성하고 외부 결제 대행사(PG사) 승인까지 완료했으나, 주최 측 서버 DB에 최종 등록되지 않아 강제 환불을 당하는 심각한 트랜잭션 오류가 빈번합니다 [23, 279, 305].
* **독점 플랫폼의 갑질과 광고**: 특정 전용 신청 앱들의 끼워팔기 상품 패키지 강제, 무분별한 광고, 금융 가입 개인정보 강제 동의 유도로 러너들과 오거나이저 모두의 피로감이 극에 달했습니다 [24, 286, 287].
* **오프라인 병목과의 불통**: 무분별한 출발 그룹(Corral) 배정으로 인해 대회 당일主に 병목 현상이 발생하여 비기너와 엘리트 러너가 뒤엉키며 안전사고 위협이 증가하고 있습니다 [16, 156].

### 1.2 핵심 가치 (Core Value Propositions)
* **Zero-Ops & Free-at-Rest**: 평소에는 대기가 거의 없는 마라톤 대회의 특성을 반영, 서버리스(Serverless) 인프라를 채택하여 **상시 유지비용 $0**를 구현합니다 [129, 172].
* **B2D (Business-to-Developer) Focus**: 이 레포지토리를 포크하여 독자적인 대회를 운영하려는 개발자 및 기획사 오거나이저가 기술적 난관 없이 5분 만에 배포할 수 있는 초고속 배포 환경을 제공합니다 [71].
* **AI-First DX**: 현대의 오픈소스 커스텀은 인간이 직접 타이핑하기보다 AI 코딩 도구를 통해 조율됩니다. AI가 아키텍처를 완벽하게 오해 없이 이해하고 수정할 수 있는 구조를 제공합니다.

---

## 2. 제품 요구사항 명세서 (PRD)

### 2.1 대상 사용자 페르소나 (User Personas)
* **대회 기획사 오거나이저 (B2B)**: 대기업 스폰서쉽이나 지자체 마라톤을 운영하려는 운영사. 개발 인력 예산이 부족하며, 비용이 많이 드는 트래픽 제어 솔루션 도입이 어렵습니다.
* **오픈소스 포크 개발자 / AI (B2D)**: 오거나이저의 지시를 받아 템플릿을 수정하는 엔지니어 또는 Claude, Cursor 등 AI 코딩 어시스턴트.
* **최종 참가 러너 (B2C)**: 쾌적하게 대기열을 뚫고 결제를 안전하게 성공시킨 뒤, 대회 당일 자신의 기록에 맞는 쾌적한 주로에서 달리고 싶은 엔드 유저 [16, 24, 156, 290].

### 2.2 핵심 기능 요구사항

#### ① 선언적 스키마 기반 등록 폼 빌더 (Schema-Driven Form Builder)
* **요구사항**: 대회마다 수집하는 정보(티셔츠 사이즈, 기념품 선택, 셔틀버스 여부 등)가 다를 때 코드를 직접 수정하지 않아야 합니다.
* **스펙**: `form-schema.json` 스키마만 수정하면 폼 컴포넌트가 동적으로 생성되고, 해당 데이터 스키마 검증(Zod) 및 DB 마이그레이션이 서버리스 단에서 동적으로 처리됩니다 [3, 137].

#### ② 10분 티켓 인벤토리 잠금 (10-Minute Ticket Inventory Lock)
* **요구사항**: 신청서 작성 중 세션이 끊기거나 결제 단계에서 외부 PG사 통신 병목으로 튕기더라도 내 티켓 수량이 유지되어야 합니다 [23, 279, 305].
* **스펙**: 대기열을 통과해 신청 폼에 진입하는 즉시 Redis 기반 분산 락(Distributed Lock)과 TTL(Time-To-Live)을 활용해 **10분간 티켓 선점권**을 부여합니다 [168, 177, 310]. 선점권 유효 시간 내에는 결제창 오류나 일시적 새로고침이 발생해도 처음부터 대기열을 다시 탈 수 있는 참사가 발생하지 않습니다 [11, 48].

#### ③ 화이트라벨 디자인 및 스폰서 그리드 (White-label Brand Config)
* **요구사항**: 대회 아이덴티티와 스폰서십 로고를 세련되게 노출해야 합니다 [7, 62].
* **스펙**: `theme.json` 설정을 통해 주최 브랜딩 테마(Primary Color, Font, Logo)를 제어하고, 가입 단계를 해치지 않는 영역 하단에 세련된 스폰서 그리드(Sponsor Grid)를 고정 템플릿으로 제공합니다.

#### ④ 완주 기록 검증 및 출발 그룹(Corral) 자동 배정
* **요구사항**: 대회 당일 주로의 초반 병목 현상을 방지해야 합니다 [16, 156].
* **스펙**: 접수 시 유저가 완주 기록증 파일 또는 링크를 제출하면 [156], 주최측 관리 콘솔에서 적합성 검증 후 S, A, B, C 등 최적의 페이스 출발 그룹을 백엔드에서 원자적(Atomic)으로 배정합니다.

---

## 3. AI-First DX (Developer Experience) 규격

AI 어시스턴트가 `opnrun` 프로젝트를 열고 오거나이저의 지시("A대회 느낌으로 로고 바꾸고 기념품에 양말 옵션 넣어줘")를 수행할 때 발생하는 할루시네이션(Hallucination)을 제어하고 완벽한 작업 성공률을 보장하기 위한 아키텍처 표준 규격입니다.

### 3.1 파일 구조 분리 (Core vs. Config)
AI가 핵심 트래픽 제어 로직을 건드려 버그를 만드는 것을 방지하기 위해 파일 역할을 철저히 분리합니다.

```text
opnrun/
├── .cursorrules               # Cursor, Claude Code 전용 지침 및 아키텍처 룰셋
├── AI_INSTRUCTIONS.md         # 오거나이저가 AI에게 바로 입력할 수 있는 Prompt Recipes
├── src/
│   ├── config/                # ⚠️ [AI 작업 허용 구역] 
│   │   ├── form-schema.json   # 접수 양식 필드 정의 (기념품 옵션 등)
│   │   └── theme.json         # 테마 컬러, 폰트, 로고 이미지 링크
│   └── lib/                   # 🔒 [AI 직접 수정 제한 구역] 
│       ├── queue/             # Upstash Redis 기반 대기열 처리 (Ratelimit)
│       └── payment/           # 10분 락 및 결제 정합성 원장 로직
```

### 3.2 AI 에이전트 행동 지침 (.cursorrules)
```yaml
# opnrun AI Code-Gen Rules
rules:
  - name: "Keep Queue Immutable"
    pattern: "src/lib/queue/**"
    action: "warn"
    message: "대기열 코어 로직은 결제 정합성과 성능에 직결되므로 수정 시 사전에 엄격한 수동 검증이 필요합니다. 설정 변경은 config/ 내 파일들만 사용하세요."
  - name: "Strict Type Safety"
    pattern: "src/**/*.ts"
    action: "enforce"
    message: "모든 커스텀 데이터 파이프라인은 Zod 스키마 검증 및 엄격한 TypeScript 타입을 준수해야 합니다. 임의의 any 타입 사용은 빌드 차단됩니다."
```

### 3.3 프롬프트 레시피 북 (`AI_INSTRUCTIONS.md` 예시)
> **오거나이저가 Claude에게 복사해 던지는 프롬프트 템플릿**
> *"나는 마라톤 대회를 여는 오거나이저야. `src/config/form-schema.json`에 비상연락처(Emergency Contact) 필드를 추가하고, `src/config/theme.json`에서 주조색을 러닝크루 상징색인 오렌지(#FF6B00)로 변경해 줘. 작업이 끝나면 `npm run test`를 실행해 기존 결제 정합성 테스트가 깨지지 않는지 자가 검증해 줘."*

---

## 4. 클라우드 아키텍처 설계 (Vercel, Cloudflare, AWS)

마라톤 신청 사이트의 트래픽은 **"99.9% 기간 동안 거의 제로(Idle)"**이며 **"접수 시작 직후 단 5분~30분 동안만 임계치 폭증(Peak Spike)"**하는 비대칭적 양상을 띱니다 [254, 279, 293]. 따라서 비싼 상시 인프라 비용을 전면 배제한 서버리스 아키텍처가 정답입니다 [172, 281].

### 4.1 의사결정 매트릭스 (Cloud Architecture Decision Matrix)

오픈소스 포크 시 기획사의 규모 및 가용한 예산에 따라 인프라 패스를 결정합니다.

| 구분 | 🔵 Vercel + Upstash Redis (디폴트 추천) | 🟢 Cloudflare Workers + Upstash | 🟠 AWS Enterprise Serverless |
| :--- | :--- | :--- | :--- |
| **적합한 규모** | 개인 크루, 중소형 지자체 대회 | 초저비용(사실상 무료) 지향 지자체 | 3만 명 이상 메이저급 마라톤 대회 |
| **상시 유지 비용** | **$0 / 월** (Free Tier 내 동작) [129] | **$0 / 월** (Free Tier 내 동작) [114] | **$0 / 월** (사용한 트래픽 비례 청구) |
| **핵심 스택** | Next.js (App Router) [3]<br>Vercel Edge Middleware [159]<br>Upstash Redis (REST API) [114] | Cloudflare Pages / Workers [20]<br>Upstash Redis (REST API) [114] | S3 + CloudFront CDN<br>API Gateway + Lambda<br>SQS Buffer + DynamoDB |
| **대기열 방식** | **Edge Middleware Queue** [159]<br>인입 즉시 토큰 체크 후 블로킹 페이지 리다이렉트 [162] | **Edge Workers Queue** [129]<br>글로벌 에지 단에서 Upstash REST API 조회 처리 [114] | **SQS Buffer Queue**<br>Lambda 인입 전 SQS 메시지 큐 적재 후 DB 속도 제어 |
| **디자인 커스텀** | **100% 무제한** (Next.js 컴포넌트 제어) | **100% 무제한** (React / HTML 커스텀) | **100% 무제한** (HTML / SPA React) |

> ⚠️ **Cloudflare Waiting Room (순수 SaaS 기능) 미채택 배경 사유**
> 1. **비용 한계**: CF Waiting Room은 최소 Business 요금제(월 $200) 이상부터만 접근할 수 있어 영세 주최측에게 부담입니다 [30, 33, 57].
> 2. **브랜드 커스텀 한계**: Business 요금제에서는 대기열 웹화면의 HTML/CSS 커스텀이 일절 금지(Enterprise 전용)되어 주최측 로고나 스폰서 노출이 어렵습니다 [62, 81, 99].
> 3. **속도 한계**: 최소 방출 처리 속도가 분당 200명으로 고정되어 소규모 결제 서버에 부하를 줄이는 초당 미세 제어가 차단됩니다 [59, 60].
>
> **따라서, opnrun은 오픈소스에 최적화된 "Edge Worker/Middleware + Upstash Redis REST" 조합을 기본 대기열 엔진으로 제공합니다.**

---

### 4.2 Pathway A (디폴트): Vercel Edge + Upstash Redis 아키텍처

Vercel의 글로벌 에지(Edge v8 Isolate)와 Upstash Redis의 HTTP REST API 조합으로 구현하는 무중단 대기열 메커니즘입니다. 에지 미들웨어는 TCP 연결 제한이 있으나 Upstash Redis는 REST HTTP를 지원하므로 완벽하게 작동합니다 [114, 136, 146, 172].

```
                     [ User Client ]
                            │ (HTTPS Request)
                            ▼
              [ Vercel Edge Middleware ] ──────────┐ (대기열 미달성 시)
               (or Cloudflare Workers)             │
                            │                      ▼
                            │ (대기열 활성화 시) [ Render Blocked Page ]
                            │                     - 내 앞 대기 인원 노출 [162]
                            ▼                     - 20초 간격 폴링 갱신 [85]
                 [ Upstash Redis REST ]
                    (Atomic Counter /
                    Sorted Set Queue) [114]
                            │
                            ▼ (대기열 통과 / Token 검증)
                  [ 10-Min Inventory Lock ] (Redis TTL 발급) [168, 177]
                            │
                            ▼ (신청서 작성 완료)
               [ PG Payment Gateway (Toss/Stripe) ]
                            │
                            ▼ (Payment Webhook Event)
               [ Serverless Database (Supabase) ]
```

#### 큐 제어 및 임시 선점 로직 (Pseudocode)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv(); // HTTP REST API 기반 에지 연동 [115]
const queueLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 s"), // 초당 최대 10명 진입 허용
  analytics: true
});

export async function middleware(req: NextRequest) {
  const ip = req.ip ?? "127.0.0.1";
  const { success, pending } = await queueLimiter.limit(ip);
  
  if (!success) {
    // 1차 트래픽 임계치 초과 시 대기 페이지로 즉시 강제 리다이렉트 (서버리스 오리진 부하 제로) [160, 162]
    return NextResponse.redirect(new URL('/blocked', req.url));
  }
  
  return NextResponse.next();
}
```

---

### 4.3 Pathway B: AWS Enterprise Serverless 아키텍처

수만 명 이상의 대형 공공 마라톤 이벤트를 위해 설계된 전통적이고 강력한 클라우드 버퍼링 구조입니다. SQS 메시지 큐가 수만 명의 결제 및 등록 요청 트래픽을 완충하여 DB가 감당할 수 있는 속도로 순차 처리(Throttling)합니다.

```
 [ Client Web UI ] ──► [ AWS CloudFront (CDN) ] ──► [ S3 Static Hosting ]
                               │ (API Call)
                               ▼
                        [ API Gateway ]
                               │
                               ▼
                      [ SQS Buffer Queue ] ◄── (트래픽 완충 저장소)
                               │
                               ▼ (순차 배치 처리)
                      [ AWS Lambda Function ]
                               │
                               ▼
                      [ Amazon DynamoDB ] ◄── (잔여 슬롯 차감 원장)
                               │
                               ▼ (정합성 완벽 보장)
                       [ Relational DB ]
```

---

## 5. 보안 및 규정 준수 (Security & Compliance)

* **개인정보의 안전한 암호화 저장**: 마라톤 접수 특성상 주민등록번호(보험용), 주소, 연락처 등의 중요 개인정보가 포함됩니다 [287]. 모든 개인정보는 DB 레이어 진입 전 단방향 및 양방향(AES-256) 암호화 알고리즘이 자동으로 결합되도록 기본 훅(Pre-save Hook)을 내장합니다.
* **이벤트 종료 후 자동 퍼지(Purge) 스크립트**: 대회가 안전하게 완전히 종료되고 주최 정산이 마무리되는 30일 시점에 맞춰, 주최측의 법적 리스크를 줄이기 위해 유저 개인정보 컬럼만 일괄 삭제(Masking/Anonymize)하는 **Compliant Auto-Purge Scheduler**가 기본 탑재됩니다.
* **최근 보안 인시던트 대응(Secret Rotation Guide)**: 2026년 Vercel 시스템의 비인가 접근 사태와 같은 보안 긴급 대응 지침을 포함합니다 [229]. `opnrun` 프로젝트는 Upstash의 Read-only Token을 분리 적용하고, 비상 상황 시 CLI 명령어 하나로 연동 키와 패스워드를 다운타임 없이 일방향 로테이션할 수 있는 보안 스크립트 세트를 함께 제공합니다 [228, 234].

---
본 오픈소스 프로젝트에 참여하여 대한민국 러너들의 오픈런 스트레스를 해결하고, 건강한 스포츠 테크 생태계를 함께 만들어 가시길 기대합니다. 
**Distributed under the MIT License. Contributions are always welcome!**

