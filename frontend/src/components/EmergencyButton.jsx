import React, { useState } from 'react';

const JORDAN_EMERGENCY = [
  { label: 'رقم الطوارئ الموحد والإسعاف', number: '911', icon: '🚑', color: 'bg-red-600' },
  { label: 'الدفاع المدني والإنقاذ', number: '199', icon: '🚒', color: 'bg-orange-600' },
  { label: 'الأمن العام والشرطة', number: '911', icon: '🚔', color: 'bg-blue-600' },
  { label: 'خط الدعم النفسي والاستشارات', number: '110', icon: '💙', color: 'bg-emerald-600' },
];

const FIRST_AID_PROTOCOLS = [
  {
    title: 'الإنعاش القلبي الرئوي (CPR)',
    badge: 'طوارئ قصوى',
    steps: [
      'تأكد من سلامة المكان وتحقق من استجابة المصاب بالنقر على كتفيه وسؤاله بصوت عالٍ.',
      'اتصل بالإسعاف 911 فوراً أو اطلب من شخص بجانبك الاتصال.',
      'ضع أسفل كف يدك في منتصف صدر المصاب وضع يدك الأخرى فوقها.',
      'اضغط بقوة وبمعدل 100 إلى 120 ضغطة بالدقيقة بعمق 5 سم تقريباً.',
      'استمر بالضغط دون توقف حتى وصول طاقم الإسعاف.'
    ]
  },
  {
    title: 'النزيف الشديد والجروح العميقة',
    badge: 'إسعاف سريع',
    steps: [
      'اضغط مباشرة على مكان النزيف بقطعة قماش نظيفة أو شاش معقم.',
      'ارفع الطرف المصاب لأعلى فوق مستوى القلب إن أمكن إذا لم يكن هناك كسر.',
      'إذا تشبع القماش بالدم لا ترفعه، بل ضع ضمادة إضافية فوقه واستمر بالضغط.',
      'لا تستخدم مهدئات موضعية، واطلب المساعدة الطبية فوراً.'
    ]
  },
  {
    title: 'الاختناق والشرقة (مناورة هايمليخ)',
    badge: 'إنقاذ فوري',
    steps: [
      'قف خلف الشخص ولف ذراعيك حول خصره.',
      'اصنع قبضة بإحدى يديك وضعها فوق سرة الشخص بقليل وتحت القفص الصدري.',
      'أمسك قبضتك بيدك الأخرى واضغط بحركة سريعة ومفاجئة إلى الداخل وإلى الأعلى.',
      'كرر الضغطات حتى خروج الجسم الغريب أو وصول المساعدة.'
    ]
  },
  {
    title: 'الحروق الحرارية والسطحية',
    badge: 'رعاية أولية',
    steps: [
      'ضع المنطقة المحروقة تحت ماء بارد جارٍ ولطيف لمدة 10 إلى 20 دقيقة.',
      'لا تضع الثلج مباشرة ولا تستخدم معجون الأسنان أو الزيوت أبداً.',
      'انزع الخواتم أو الأساور قبل بدء انتفاخ المنطقة.',
      'غطِّ الحرق بلطف بضمادة جافة ومعقمة وغير لاصقة وراجع الطبيب.'
    ]
  }
];

export default function EmergencyButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('numbers');

  return (
    <>
      {/* Floating SOS Trigger Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 animate-pulse focus:outline-none focus:ring-4 focus:ring-red-400"
          title="أرقام وإسعافات الطوارئ - الأردن"
          aria-label="طوارئ"
        >
          <span className="text-2xl font-black tracking-wider">SOS</span>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </span>
        </button>
      </div>

      {/* Emergency Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
          dir="rtl"
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-red-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl">
                  🚨
                </div>
                <div>
                  <h2 className="text-xl font-bold">وضع الطوارئ — الأردن 🇯🇴</h2>
                  <p className="text-xs text-red-100">أرقام الإنقاذ الفورية وإرشادات الإسعاف الأولي</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-850">
              <button
                onClick={() => setActiveTab('numbers')}
                className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 flex items-center justify-center gap-2 ${
                  activeTab === 'numbers'
                    ? 'border-red-600 text-red-600 dark:text-red-400 bg-white dark:bg-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📞 أرقام الطوارئ
              </button>
              <button
                onClick={() => setActiveTab('firstaid')}
                className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 flex items-center justify-center gap-2 ${
                  activeTab === 'firstaid'
                    ? 'border-red-600 text-red-600 dark:text-red-400 bg-white dark:bg-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🩺 دليل الإسعافات الأولية
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 max-h-[65vh] overflow-y-auto">
              {activeTab === 'numbers' ? (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-xs text-red-800 dark:text-red-200 font-medium">
                    ⚡ في الحالات المهددة للحياة (ألم صدر، فقدان وعي، حوادث)، اضغط على الرقم للاتصال الفوري بفرق الإنقاذ.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {JORDAN_EMERGENCY.map((item, idx) => (
                      <a
                        key={idx}
                        href={`tel:${item.number}`}
                        className={`${item.color} text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex flex-col justify-between`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-3xl">{item.icon}</span>
                          <span className="text-2xl font-black tracking-wider bg-black/20 px-3 py-1 rounded-xl">
                            {item.number}
                          </span>
                        </div>
                        <span className="text-sm font-bold leading-snug">{item.label}</span>
                        <span className="text-[11px] opacity-80 mt-1">اضغط للاتصال المباشر ↗</span>
                      </a>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
                    <span>مركز الاتصال الوطني الموحد</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">متاح 24/7 مجاناً</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {FIRST_AID_PROTOCOLS.map((proto, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 dark:bg-gray-750 p-4 rounded-2xl border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                          {proto.title}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full">
                          {proto.badge}
                        </span>
                      </div>
                      <ol className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 pr-4 list-decimal leading-relaxed">
                        {proto.steps.map((step, sIdx) => (
                          <li key={sIdx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-gray-50 dark:bg-gray-850 text-center border-t border-gray-100 dark:border-gray-700">
              <p className="text-[11px] text-gray-400">
                هذه الإرشادات للتصرف الأولي ريثما تصل فرق الإسعاف الطبية المتخصصة
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}