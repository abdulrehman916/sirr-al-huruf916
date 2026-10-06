// Holy Names Translator - Admin Tool
// Processes Divine Names from Tilimsani PDF and saves Malayalam translations
import { useState } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Loader2, Send, CheckCircle, AlertCircle, BookOpen, Languages } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/components/ui/use-toast";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
  bgCard: "rgba(8,16,40,0.98)",
};

// Pre-defined Divine Names from the PDFs with their Arabic text split into small chunks
// Each chunk is kept under 1200 characters to avoid timeout
const DIVINE_NAMES_QUEUE = [
  {
    name_id: "HN-TLM-010",
    arabic_name: "الغفور",
    arabic_transliteration: "Al-Ghafur",
    surah_name: "سورة البقرة",
    source_page: 79,
    order_index: 10,
    chunks: [
      `اسمه الغفور تعالى

أوّل وروده في البقرة في قوله تعالى ﴿فَلَا إِثْمَ عَلَيْهِ إِنَّ اللهَ غَفُورٌ رَّحِيمٌ﴾ وقد اتّفق الثلاثة على إيراده واشتقاق الاسم الغفور من الغفر الذي هو الستر ولذلك قيل المغفر والغفور بمعنًى فقال العلماء المعنى الساتر للعقوبة عمّن عفا عنه وقيل الساتر لذنوب من عفا عنه فيكون داخلاً في الاسم العفوّ ويدخل في الاسم الرحيم كما قال ﴿لا تَقْنَطُوا مِن رَّحْمَةِ اللهِ﴾ والمراد بالمغفرة إلى الرحمة الخاصّة بالمغفرة وهي من الغفور سبحانه.`,
      `واعلم أنّ الاسم الغفور يستعمل معاني الأسماء كلّها ويظهر بأحكامها فيغفر الذنوب بصراقة الغفران ويغفر الذنوب بنسبة الاسم الساتر أي يسترها وله مع الاسم الهادي يغفر من مقاصد الصوفية فلا تطمح إليها نفوسهم لأنّها قد صيّرت كرم الأخلاق ملكة فتنسى إلى الاسم الهادي وينفر طلب الآخرة من مطالح المحبين فينسون ذكرها لشغلهم بالمحبوب وذلك غفران بنسبة الاسم الهادي وينفر طكر ذكر الحسنات عنهم فلا يرون لهم حسنة لأنّهم رأوها من الله لا من أنفسهم وذلك بنسبة الاسم الهادي.`,
      `وقد يبدو ساتراً بنسبة الاسم المضلّ فيغفر وجه المصلحة عن الضلال فيمون عنها وهو غفوه وغفرمنه ﴿بَاطِنُهُ فِيهِ الرَّحْمَةُ وَظَاهِرُهُ مِن قِبَلِهِ الْعَذَابُ﴾ وهو الجهل وذلك بنسبة الاسم المضلّ وبنفر وجه الآخرة فلا تتعلق به فلا يجدون حلاوة الدنيا ولا حلاوة طلب الآخرة ثمّ قد يستر عنهم وجوه الترقيات فيقفون حيث انتهوا إلى الاسم المضلّ دقائق الاسم المضلّ أيضاً إذ هو وعيب كما قال:

ولَرَّ أرَ فِي عُيُوبِ النَّاسِ عَيْبَاً   كَنَقْصِ الْقَادِرِينَ عَلَى الثَّمَام

وقد يبلغ الاسم الغفور بهم إلى أن لا يبقى في قلب أحدهم حبّة خردل من الخير وهم أهل النار الذين هم أهلها وأمّا من في قلبه حبّة خردل من الخير فهم آخر من يخرج من النار كما ورد الحديث النبويّ.`
    ]
  },
  {
    name_id: "HN-TLM-011",
    arabic_name: "الغفور - التواب",
    arabic_transliteration: "Al-Ghafur / Al-Tawwab",
    surah_name: "سورة البقرة",
    source_page: 81,
    order_index: 11,
    chunks: [
      `اسمه التواب عزّ وجلّ

يخرج من النار كما ورد الحديث النبويّ وأمّا من خلا قلبه بالكليّة فهم أهل النار الذين هم أشدّ الناس عذاباً يوم تمرّ الرحمة ﴿يُبَدِّلُ اللهُ سَيِّئَاتِهِمْ حَسَنَاتٍ﴾ لملحقهم فتقصير مراتب العذاب التي قطعوا أطوارها للنعيم الذي لا يعرفه أهل الجنة لكنّ أهل الجنة لو عرض عليهم لكان في حقّهم عذاباً فلذلك اختصّ به هؤلاء.

وأصل هذه المسألة الذي يرجع إليه أنّ نعيم أتباع الاسم الهادي ضدّ لنعيم أتباع الاسم المضلّ والحقائق كلّها لا تبدّل فلا جرم في ملاقاة الملائم الذي يكون النعيم حتّى يكون الذي ليس في قلبه حبّة خير يساو في نعيمه حين ملاقاة الملائم للملائم المعادلة والحقائق واحداً والذات واحدة إلاّ أنّ الوجود أهل شهود أهل الوجود بالخير قد كلّ الخير كله في قلبه.

وهي مرتبة طلبها السيّد المسيح عليه السلام قال لمن يمشي عليه السلام أنت أولى لمن يكون تلميذاً له فإنّي أريد أن أُكمّل البرّ كلّه عنده من هو أولى أن يكون تلميذاً له.

فتكملة البرّ كلّه هو بتكملة الخير وهو مقام الجلال ويقابله مقام الجمال وهم الذين كلوا البرّ كلّه فأخذتهم السطوة الإلهيّة حتّى حدّ الاسم الشديد العذاب فكانت نهاية مطمح نظر الاسم المضلّ القيّوم عند المطلع الذي يقرأ من الثار ﴿يَطَّلِعُ عَلَى الأَفْئِدَةَ﴾ فناولهم إلى الاسم السلام فكانت النار إذ ذاك ﴿بَرْداً وَسَلَامَاً﴾.`
    ]
  },
  {
    name_id: "HN-TLM-012",
    arabic_name: "القريب",
    arabic_transliteration: "Al-Qarib",
    surah_name: "سورة البقرة",
    source_page: 82,
    order_index: 12,
    chunks: [
      `اسمه القريب تبارك وتعالى

أوّل وروده في البقرة في قوله تعالى ﴿وَإِذَا سَأَلَكَ عِبَادِى فَإِنِّى قَرِيبٌ﴾ ولم يذكره الغزاليّ قال علماء الرسوم معنى قربه أنّه يحيط علمه بكلّ شيء وأمّا القرب في اصطلاح هذه الطائفة فهو أن يصير الشاهد مداركه جميع مشاعره وفي الحقيقة وفي مداركه وقت يكوننا فيه الحقّ ولا نكونه وهو هذا.

واعلم أنّ الحقّ لا يكون ذات الشاهد لا يفن وإليه أشار ابن الفارض في قوله:

فَلَمْ تَهْوِنِي مَا لَمْ تَكُنْ فَانِيَاً   وَلَمْ تَفْنَ مَا لَمْ تُجْتَلَى فِيكَ صُورَتِي

والمتصوّر عين هذه الصورة بلا حلول وإذا في الشاهد في المشهود في الحقّ كان الحقّ ولا شيء معه والعزّ هو القرب والبعد هو شهوده عدم وهو كما قيل في المواقف تراني ولا تراني ذلك هو البعد في قول الشاهد.

فإذا القرب هو أن يصير المشهود هو الشاهد وإذا عرفت معنى القرب عرفت أنّ قربه تعالى هو بعده وأنّ قربه تعالى لا كرّب الشيء من الشيء والبعد هو شهوده كما قيل في المواقف تراني ولا تراني ذلك هو البعد وأنا أقرب إليك من رؤيتك.

وأمّا قرّب الحقّ تعالى بعلمه في حضرة الكشف فإنّ عالم كلّ عالم هو علمه ولم يبق شيء وإلاّ علم فهو وعالم بكلّ شيء قرّيباً من كلّ شيء قرّياً هو عين واحدة.`
    ]
  },
  {
    name_id: "HN-TLM-013",
    arabic_name: "المجيب",
    arabic_transliteration: "Al-Mujib",
    surah_name: "سورة البقرة",
    source_page: 84,
    order_index: 13,
    chunks: [
      `اسمه المجيب تبارك وتعالى

أوّل وروده في البقرة وهو قوله تعالى ﴿أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ﴾ واتّفق عليه الأئمة الثلاثة والمراد عند العلماء أنّه يجيب مسألة من سأله فيعطيه إمّا مُجَلاً وإمّا مُؤجَّلاً وإمّا مؤجَّلاً إلى مقام ما سأله.

وأمّا أهل الله تعالى فيرون أنّه الداعي الذي الله الداعي أيضاً فقال ﴿وَإِذَا سَأَلَكَ عِبَادِى فَإِنِّى قَرِيبٌ﴾ ثمّ قال ﴿فَلْيَسْتَجِيبُواْ لِي﴾ يجعل الاستجابة لهم في مقابلة دعائهم وإن كان معناه في التفسير غير هذا فيُرجح هذا الكشف المعنى المعنى إلى أنّه الداعي والمجيب.

وأمّا من امتحى عندهم الأغيار رسم الأغيار فليس فيه داعٍ ولا مجيب وهو المجيب وحده والداعي الحقّ فمن كان في حضرة قولهم إن نصرتك فنمّ في الصراخ في الصراخ فنمّ في الصراخ من نصري فالحظ يا أخي كيف يكون الصراخ معدوداً من النصرة ثمّ إذا لم يكن من النصرة فإذاً هو خير فإذاً هو نصر من الله المجيب من الاسم الصارخ وهي الإجابة للصارخ.

ومن جملة الاستجابة عند أهل الكشف إجابته ليونس عليه السلام في قوله ﴿فَنَادَى فِي الظُّلُمَاتِ أَنلَا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّى كُنتُ مِنَ الظَّالِمِينَ﴾ قال الله تعالى ﴿فَاسْتَجَبْنَا لَهُۥ﴾ وبعنون بهذه الظلمات ظلمات المحو وهي لا اسم لها والظلم هو وضع الشيء في غير موضعه في لغة العرب فصرّح بأنّه كان ظالماً في اعتقاده وجود الأغيار والاستجابة إلى هذه الحضرة المقدّسة وهذا هو الذي يسمّونه البقاء بعد الفناء فإذاً هذه الإجابة هي من الاسم المجيب سبحانه وهذا الاسم لا تخصر ونحن الآن نقتصر.`
    ]
  },
  {
    name_id: "HN-TLM-014",
    arabic_name: "السريع الحساب",
    arabic_transliteration: "As-Sari' Al-Hisab",
    surah_name: "سورة البقرة",
    source_page: 86,
    order_index: 14,
    chunks: [
      `اسمه السريع الحساب سبحانه

أوّل وروده في البقرة في قوله ﴿سَرِيعُ الحِسَابِ وَاذْكُرُواْ اللهَ فِي أَيَّامٍ﴾ ولم يذكره الغزاليّ ومعناه أنّه عالم بأحوال عباده فيسرع عليها حسابه وهو عند هذه الطائفة أنّ حسابه أن يمتاز لكلّ أحد وجه الحقيقة فيظهر له هل هو من قسط الباطل فمن كان من قسط الباطل فن أوّل الأمر إذلا يحتاجون إلى السبك حتّى ينشأ نشأة أخرى ملائمة للحقيقة.

والحقيقة إمّا من قسط الاسم الهادي وإمّا من قسط الاسم المضلّ وكلا الحقيقتين تقتضي النعيم أمّا قسط الاسم الهادي فن أوّل الأمر يحتاجون إلى السبك إذلا يس عذاب المعذّبين عند الاسم الهادي يسمّى نقمة.

ولمّا كان الرسول عليه السلام رسالته من حضرة الاسم الهادي سمّي ذلك السبك عذاباً وهو حقّ إنّما النطق إنّما هو عن ألسنة المراتب وكذلك كانت عبارات أهل الله تعالى تجمع بين الأضداد وليس كذلك بل لها عبارات مراتبيّة مختلفة بحسب اختلاف المراتب قد تكون متضادّة فينطق الإنسان المحجوب بمرتبة هي ضدّ تلك المرتبة فيقبّحه إذ هو وعيب إذ ذاك فتقبّحه لأنّ الحسن لا يقابل السيئ الاسم المضلّ عنه فاللجواب الحسن عن الصواب فإذاً الجواب بالصواب.`
    ]
  },
  {
    name_id: "HN-TLM-015",
    arabic_name: "الحليم",
    arabic_transliteration: "Al-Halim",
    surah_name: "سورة البقرة",
    source_page: 87,
    order_index: 15,
    chunks: [
      `اسمه الحليم سبحانه

هذا الاسم العظيم اتّفق على إيراده الأئمة الثلاثة وآيته من البقرة في قوله تعالى ﴿غَفُورٌ حَلِيمٌ﴾ حمل الحلم في لغة العرب مرّة على أنّه ضدّ الجهل ومرّة على أنّه ضدّ الانتقام من المذنب والحلم حقّي عندي أنّه موافقة الصواب وهذه الأحكام كلّها أحكام الاسم الحليم لا تضع السيف في موضع الندى ولا العكس.

وأمّا في حقّ الحقّ تعالى فهو علم مصلحة العبد بمصلحة العمل فإنّه علم فلمّ أنّه حلم أنّه قدر أنّه كان يستحقّ العقاب فعوملَ باللطف وليس كذلك بل ما عامل أحداً إلاّ بما يستحقّه ولكن يتلبّس الأمر على المحجوب فيعتقد أنّه سوّغ له الأمر على المحجوب وهو جهل بالله ولوكان حاكم العقل المجوب في ظلمة في ذلك الاسم الحليم فيكون الصواب موافقة الصواب وفعله لا يعدو الصواب من الجانبي في نظر المكاشف سواء فلحصل من هذا أنّ فعل الحقيقة موافق للصواب مطلقاً وأفعال الأغيار هنالك إلاّ باعتبار واحد وهما في نظر أهل الاغتراب سواء في أنّهما موافقان للصواب للمصلحة ويكون بذلك مرّة صواباً وخطأً وهما في نظر المكاشف وقسط الحقيقة مردود لا عند أهل المعقول والمنقول.

وإذا قلت إنّك قد منعت من ظهوره بهذه الحقيقة تعويضاً بالصواب والصفِ عمّن يستحقّ العقوبة فلا يكون الحقّ تعالى قد وافق الصواب فالجواب أنّ موافقة الصواب هي أعمّ مما أشرت إليه وهو أن يكون الصفح من الجاني في نظر الأغيار صواباً وأحياناً خطأً وهما في نظر المكاشف سواء فلُحصل من هذا أنّ فعل الحقيقة موافق للصواب مطلقاً ولا أغيار هنالك إلاّ باعتبار واحد وهذه المسألة غامضة تحتاج إلى ترقٍّ في النظر فهو الحليم الجامع المعنى بالمعنى سبحانه.`
    ]
  },
];

export default function AdminHolyNamesTranslator() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(null);
  const [queue, setQueue] = useState(DIVINE_NAMES_QUEUE.map(n => ({ ...n, status: 'pending', result: null, error: null })));
  const [processing, setProcessing] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(null);

  useState(() => {
    base44.auth.me().then(u => setIsAdmin(["owner", "admin"].includes(u?.role))).catch(() => setIsAdmin(false));
  });

  const translateOne = async (nameData, idx) => {
    setCurrentIdx(idx);
    setQueue(prev => prev.map((item, i) => i === idx ? { ...item, status: 'processing' } : item));

    // Combine all chunks into one text
    const fullText = nameData.chunks.join('\n\n');
    
    try {
      const result = await base44.functions.invoke('translateDivineNameChunk', {
        name_id: nameData.name_id,
        arabic_name: nameData.arabic_name,
        arabic_transliteration: nameData.arabic_transliteration,
        surah_name: nameData.surah_name,
        source_page: nameData.source_page,
        order_index: nameData.order_index,
        arabic_text: fullText,
        dry_run: false
      });

      setQueue(prev => prev.map((item, i) => i === idx ? { 
        ...item, 
        status: result.data?.success ? 'done' : 'error',
        result: result.data,
        error: result.data?.error || null
      } : item));

      if (result.data?.success) {
        toast({ title: `✓ ${nameData.arabic_name} saved`, description: `${result.data.explanation_length} chars` });
      }
    } catch (err) {
      setQueue(prev => prev.map((item, i) => i === idx ? { 
        ...item, 
        status: 'error', 
        error: err.message 
      } : item));
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setCurrentIdx(null);
  };

  const runAll = async () => {
    setProcessing(true);
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status === 'pending' || queue[i].status === 'error') {
        await translateOne(queue[i], i);
        await new Promise(r => setTimeout(r, 2000)); // 2s pause between calls
      }
    }
    setProcessing(false);
  };

  const retryOne = (idx) => {
    setQueue(prev => prev.map((item, i) => i === idx ? { ...item, status: 'pending', error: null } : item));
    translateOne(queue[idx], idx);
  };

  if (isAdmin === false) return <Navigate to="/" replace />;

  const doneCount = queue.filter(q => q.status === 'done').length;
  const errorCount = queue.filter(q => q.status === 'error').length;

  return (
    <AdminLayout title="Holy Names Translator" subtitle="Tilimsani PDF → Malayalam">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: queue.length, color: G.text },
            { label: 'Done', value: doneCount, color: '#4ade80' },
            { label: 'Errors', value: errorCount, color: '#f87171' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border p-3 text-center" style={{ background: G.bg, borderColor: G.border }}>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-white/40">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Run All Button */}
        <button
          onClick={runAll}
          disabled={processing || doneCount === queue.length}
          className="w-full py-3 rounded-xl font-inter font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#f6d860,#c98a14)", color: "#0d1b2a" }}
        >
          {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Languages className="w-4 h-4" /> Translate All Names</>}
        </button>
        <p className="text-xs text-white/30 text-center -mt-4">Each name takes ~2 minutes. Do not close this page.</p>

        {/* Queue */}
        <div className="space-y-3">
          {queue.map((item, idx) => (
            <div key={item.name_id} className="rounded-xl border p-4" style={{
              background: item.status === 'done' ? "rgba(34,197,94,0.06)" :
                item.status === 'error' ? "rgba(239,68,68,0.06)" :
                item.status === 'processing' ? "rgba(212,175,55,0.10)" : G.bg,
              borderColor: item.status === 'done' ? "rgba(34,197,94,0.30)" :
                item.status === 'error' ? "rgba(239,68,68,0.30)" :
                item.status === 'processing' ? G.border : "rgba(255,255,255,0.10)"
            }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {item.status === 'done' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {item.status === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                    {item.status === 'processing' && <Loader2 className="w-5 h-5 animate-spin" style={{ color: G.text }} />}
                    {item.status === 'pending' && <BookOpen className="w-5 h-5 text-white/30" />}
                  </div>
                  <div>
                    <p className="font-amiri text-lg font-bold" style={{ color: item.status === 'done' ? '#4ade80' : G.text }}>{item.arabic_name}</p>
                    <p className="text-xs text-white/40">{item.name_id} · {item.surah_name} p.{item.source_page}</p>
                    {item.status === 'done' && item.result && (
                      <p className="text-xs text-green-400 mt-1">{item.result.explanation_length} chars saved</p>
                    )}
                    {item.status === 'error' && (
                      <p className="text-xs text-red-400 mt-1 truncate max-w-[200px]">{item.error}</p>
                    )}
                    {item.status === 'processing' && (
                      <p className="text-xs text-yellow-400 mt-1 animate-pulse">Translating to Malayalam...</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {item.status === 'error' && (
                    <button
                      onClick={() => retryOne(idx)}
                      disabled={processing}
                      className="px-3 py-1.5 rounded-lg text-xs font-inter font-bold disabled:opacity-50"
                      style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.30)" }}
                    >
                      Retry
                    </button>
                  )}
                  {(item.status === 'pending' || item.status === 'done') && !processing && (
                    <button
                      onClick={() => translateOne(item, idx)}
                      disabled={processing || currentIdx !== null}
                      className="px-3 py-1.5 rounded-lg text-xs font-inter font-bold disabled:opacity-50 flex items-center gap-1"
                      style={{ background: G.bg, color: G.text, border: `1px solid ${G.border}` }}
                    >
                      <Send className="w-3 h-3" />
                      {item.status === 'done' ? 'Redo' : 'Run'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="rounded-xl border p-4 text-xs text-white/40 space-y-1" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="font-semibold text-white/60">Instructions:</p>
          <p>1. Click "Translate All Names" to process the queue sequentially.</p>
          <p>2. Each name takes ~2 minutes. The page must stay open.</p>
          <p>3. On timeout/error, click "Retry" for that specific name.</p>
          <p>4. Results are saved directly to HolyOneName database.</p>
          <p>5. Use individual "Run" buttons to process one name at a time.</p>
        </div>

      </motion.div>
    </AdminLayout>
  );
}