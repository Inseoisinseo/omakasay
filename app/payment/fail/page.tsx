import Link from 'next/link';

export default async function PaymentFailPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; message?: string }>;
}) {
  const { message } = await searchParams;
  const reason = message ?? '결제가 취소되었거나 오류가 발생했어요.';

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#fffcef' }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-8 text-center"
        style={{
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.20)',
        }}
      >
        <p className="text-3xl mb-4">😢</p>
        <h1 className="text-[16px] font-semibold text-gray-900 mb-2 font-[family-name:var(--font-noto-sans-kr)]">
          결제에 실패했어요
        </h1>
        <p className="text-[13px] text-gray-500 mb-6 font-[family-name:var(--font-dm-mono)]">
          {reason}
        </p>
        <Link
          href="/workspace"
          className="inline-block h-10 px-6 rounded-full text-[13px] font-medium text-white transition-all hover:opacity-85 font-[family-name:var(--font-dm-mono)]"
          style={{ backgroundColor: '#1a1a1a', lineHeight: '40px' }}
        >
          돌아가기
        </Link>
      </div>
    </main>
  );
}
