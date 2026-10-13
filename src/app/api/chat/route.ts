import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMsg = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT =
  "تو دستیار هوشمند «بیمه شو» هستی؛ به فارسی، کوتاه و محترمانه درباره انواع بیمه (شخص ثالث، بدنه، موتور، خانه، عمر، تکمیلی، موبایل، ایمپلنت) و خرید اقساطی پاسخ می‌دهی.";

const MOCK_REPLIES: Array<[RegExp, string]> = [
  [
    /سلام|درود|وقت بخیر/i,
    "سلام! من دستیار هوشمند بیمه شو هستم. می‌تونم درباره انواع بیمه، خرید اقساطی و پوشش‌ها کمکت کنم. چه بیمه‌ای مد نظرته؟",
  ],
  [
    /ثالث|تعهدنامه/i,
    "بیمه شخص ثالث خودرو، تعهد قانونی شما در برابر خسارت‌های بدنی و مالی به دیگران است. اگر تا ساعت ۱۶ سفارش‌تان را ثبت کنید، بیمه‌نامه همان روز صادر می‌شود.",
  ],
  [
    /بدنه|تصادف|خسارت/i,
    "بیمه بدنه، خسارت‌های وارده به خودروی خودتان را پوشش می‌دهد و توسط همه نمایندگی‌های کشور پذیرش می‌شود. برای دریافت قیمت، مدل و سال خودرو را بفرمایید.",
  ],
  [
    /قسط|اقساط|قیمت|هزینه|چند|تعرفه/i,
    "امکان خرید اقساطی برای همه بیمه‌های لیست شده فراهم است؛ کافی است بیمه مورد نظر را از صفحه اصلی انتخاب کنید و روی «ادامه» بزنید تا کارشناسان ما با شما تماس بگیرند.",
  ],
  [
    /خانه|زلزله|آتش|سرقت/i,
    "بیمه خانه، آتش‌سوزی، زلزله و سرقت را پوشش می‌دهد و بر اساس متراژ و ارزش اموال شما قیمت‌گذاری می‌شود.",
  ],
  [
    /عمر|پس‌انداز|فوت/i,
    "بیمه عمر هم پوشش فوت دارد و هم پس‌انداز سرمایه‌گذاری‌شده؛ مدت و مبلغ اقساط کاملاً قابل تنظیم است.",
  ],
  [
    /تکمیلی|بیمارستان|دندانپزشک/i,
    "بیمه تکمیلی پوشش بیمارستانی، دندانپزشکی و خدمات پاراکلینیکی را تکمیل می‌کند؛ می‌توانید آن را به‌صورت فردی یا گروهی بگیرید.",
  ],
  [
    /موتور|سیلندر|موتورسیکلت/i,
    "بیمه موتور برای یک سیلندر و دو سیلندر با نرخ‌های متفاوت ارائه می‌شود؛ مدل موتور را بفرمایید تا دقیق‌تر راهنمایی‌تان کنم.",
  ],
  [
    /موبایل|گوشی|تلفن/i,
    "بیمه موبایل، سرقت و آسیب‌دیدگی گوشی را پوشش می‌دهد؛ کافی است مدل گوشی را اعلام کنید.",
  ],
  [
    /ایمپلنت|دندان/i,
    "بیمه ایمپلنت، هزینه دندان‌های دائمی و ایمپلنت را طبق تعرفه پوشش می‌دهد؛ برای جزئیات بیشتر بپرسید.",
  ],
];

const DEFAULT_REPLY =
  "سوال خوبی است! برای راهنمایی دقیق‌تر، می‌تونید بیمه مورد نظرتون رو از کارت‌های صفحه اصلی انتخاب کنید یا سوال رو با جزئیات بیشتری بپرسید.";

function mockReply(message: string): string {
  for (const [re, reply] of MOCK_REPLIES) if (re.test(message)) return reply;
  return DEFAULT_REPLY;
}

/** Plugs into a real LLM endpoint when AI_API_URL / AI_API_KEY are configured. */
async function callRealLLM(message: string, history: ChatMsg[]): Promise<string | null> {
  const url = process.env.AI_API_URL;
  const key = process.env.AI_API_KEY;
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL ?? "gpt-4o-mini",
        temperature: 0.6,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history,
          { role: "user", content: message },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      reply?: string;
    };
    return data.choices?.[0]?.message?.content ?? data.reply ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let message = "";
  let history: ChatMsg[] = [];
  try {
    const body = (await req.json()) as { message?: string; history?: ChatMsg[] };
    message = body.message ?? "";
    history = Array.isArray(body.history) ? body.history.slice(-8) : [];
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!message.trim()) {
    return NextResponse.json({ error: "empty_message" }, { status: 400 });
  }

  const reply = (await callRealLLM(message, history)) ?? mockReply(message);
  return NextResponse.json({ reply });
}
