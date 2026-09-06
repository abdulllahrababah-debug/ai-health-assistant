import React, { useState, useRef, useEffect } from 'react';
import api from '../api/client';

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'مرحباً بك! أنا طبيبك الذكي للاستشارات الصحية الأولية 🩺\n\nتفضل بوصف ما تشعر به أو ارفع صورة لأي طفح جلدي أو إصابة لفحصها وتحليلها فوراً. كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date().toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (JPEG, PNG, WEBP)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، الحد الأقصى 8 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setSelectedImage(reader.result.split(',')[1]); // Base64 payload
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() && !selectedImage) return;

    const currentInput = inputMessage.trim();
    const currentImgPreview = imagePreview;
    const currentImgBase64 = selectedImage;

    // Reset input fields
    setInputMessage('');
    removeImage();

    const userMsg = {
      role: 'user',
      content: currentInput || 'يرجى تحليل هذه الصورة الطبية المرفقة.',
      image: currentImgPreview,
      timestamp: new Date().toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      if (currentImgBase64) {
        // Image Analysis endpoint
        const res = await api.post('/chat/analyze-image', {
          imageBase64: currentImgBase64,
          mimeType: 'image/jpeg',
          question: currentInput || 'حلل هذه الصورة الطبية وقدم تشخيصاً مبدئياً وتوصيات سريرية.'
        });

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.analysis || 'تم استلام الصورة وتحليلها.',
            timestamp: new Date().toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        // Text Chat endpoint with history context
        const chatHistory = messages
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .slice(-6)
          .map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.content
          }));

        const res = await api.post('/chat/message', {
          message: currentInput,
          history: chatHistory
        });

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.reply || 'شكراً على رسالتك. كيف يمكنني مساعدتك أكثر؟',
            timestamp: new Date().toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'عذراً، حدث تأخر في الاستجابة. يرجى إعادة إرسال السؤال أو وصف العارض بكلمات إضافية.',
          timestamp: new Date().toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'عندي صداع نصفي شديد ودوخة، ماذا أفعل؟',
    'أشعر بحرقة مستمرة بالمعدة بعد الأكل',
    'كيف أميز بين الحساسية العادية ونزلة البرد؟',
    'ما هي العلامات الطارئة لارتفاع ضغط الدم؟'
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 py-6 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto flex flex-col h-[86vh] bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
                👨‍⚕️
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold">طبيب الذكاء الاصطناعي الاستشاري</h1>
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold">
                  متصل الآن
                </span>
              </div>
              <p className="text-xs text-indigo-100">
                محادثة سريرية تفاعلية + تشخيص صور الجلد والجروح
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs bg-white/10 px-3 py-1.5 rounded-xl">
            <span>🛡️</span>
            <span>استشارة آمنة ومحمية</span>
          </div>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-gray-50/40 to-white dark:from-gray-900 dark:to-gray-800">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-base shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                    : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                }`}
              >
                {msg.role === 'user' ? '👤' : '👨‍⚕️'}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 shadow-sm text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm'
                    : 'bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                }`}
              >
                {msg.image && (
                  <div className="mb-3 rounded-2xl overflow-hidden border border-white/20 max-w-xs shadow-md">
                    <img src={msg.image} alt="Uploaded lesion" className="w-full h-auto object-cover" />
                  </div>
                )}
                <div className="whitespace-pre-line">{msg.content}</div>
                <span
                  className={`block text-[10px] mt-2 ${
                    msg.role === 'user' ? 'text-indigo-200 text-left' : 'text-gray-400 text-left'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-base">
                👨‍⚕️
              </div>
              <div className="bg-white dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-3xl rounded-tl-sm p-4 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span>الطبيب يدرس الأعراض ويكتب لك التقييم...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length < 3 && (
          <div className="px-4 py-2 bg-gray-50/50 dark:bg-gray-850 border-t border-gray-100 dark:border-gray-700 overflow-x-auto flex gap-2 no-scrollbar">
            {quickQuestions.map((q, qIdx) => (
              <button
                key={qIdx}
                onClick={() => setInputMessage(q)}
                className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-xl text-xs text-gray-700 dark:text-gray-300 transition-colors shadow-2xs"
              >
                💡 {q}
              </button>
            ))}
          </div>
        )}

        {/* Selected Image Preview Pill */}
        {imagePreview && (
          <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 border-t border-indigo-100 dark:border-indigo-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="w-12 h-12 object-cover rounded-xl border border-indigo-200"
              />
              <div>
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 block">
                  صورة جاهزة للتحليل
                </span>
                <span className="text-[11px] text-gray-500">سيتم إرسالها مع رسالتك للطبيب</span>
              </div>
            </div>
            <button
              onClick={removeImage}
              className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-700 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            {/* Image Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-500 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-2xl transition-colors border border-gray-200 dark:border-gray-600 flex-shrink-0"
              title="رفع صورة لتحليل الطفح الجلدي أو الجروح"
            >
              📷
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="اكتب استفسارك الطبي هنا أو ارفع صورة..."
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || (!inputMessage.trim() && !selectedImage)}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-md shadow-indigo-500/20 text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 flex-shrink-0"
            >
              <span>إرسال</span>
              <span>↗</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}