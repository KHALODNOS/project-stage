import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Lightbulb, 
  Award, 
  Globe, 
  Heart, 
  BookOpen, 
  ShieldCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { cn } from '../utils/cn';

const stats = [
  { label: 'رواية متنوعة', value: '1,200+', icon: BookOpen, color: 'text-primary' },
  { label: 'قارئ نشط', value: '50K+', icon: Users, color: 'text-orange-500' },
  { label: 'فصل مترجم', value: '150K+', icon: Globe, color: 'text-emerald-500' },
  { label: 'تقييم إيجابي', value: '4.9/5', icon: Award, color: 'text-sage-500' },
];

const values = [
  {
    title: 'الجودة أولاً',
    description: 'نحن نلتزم بتقديم أرقى مستويات الترجمة والتدقيق اللغوي لضمان تجربة قراءة فريدة.',
    icon: ShieldCheck,
  },
  {
    title: 'الابتكار المستمر',
    description: 'نسعى دائماً لتطوير منصتنا وتقديم ميزات تقنية تسهل وصول القارئ لمحتواه المفضل.',
    icon: Lightbulb,
  },
  {
    title: 'مجتمع متكامل',
    description: 'نبني جسوراً بين المترجمين والقراء لخلق بيئة تعاونية تثري المحتوى العربي.',
    icon: Heart,
  },
];

const AboutUs = () => {
  return (
    <div className='relative min-h-[80vh] bg-background selection:bg-primary/20' dir="rtl">
      
      {/* ─── AMBIENT BACKGROUNDS ─── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 pt-10">
        
        {/* ─── HERO SECTION ─── */}
        <section className="pt-20 pb-16 px-6 text-center max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest"
          >
            <Sparkles className="w-3.5 h-3.5" />
            من نحن
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black font-elmessiri leading-tight text-foreground"
          >
            نحن نرسم <span className="text-primary">مستقبل</span> القراءة الرقمية
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed"
          >
            منصة "اقرأ" ليست مجرد موقع للروايات، بل هي شغف مشترك يجمع المبدعين والمترجمين في مكان واحد لخدمة القارئ العربي.
          </motion.p>
        </section>

        {/* ─── STATISTICS GRID ─── */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass p-8 rounded-[2.5rem] border border-border flex flex-col items-center text-center space-y-3 group hover:border-primary/30 transition-all duration-500"
              >
                <div className={cn("p-4 rounded-3xl bg-muted/50 group-hover:scale-110 transition-transform duration-500", stat.color)}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black font-sans text-foreground">{stat.value}</h3>
                  <p className="text-xs font-bold text-muted-foreground opacity-60 uppercase tracking-widest">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── MISSION & VISION BENTO ─── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden p-10 rounded-[3rem] bg-card border border-border shadow-xl h-full flex flex-col justify-between"
            >
              <div className="space-y-6 relative z-10">
                <div className="p-4 w-fit rounded-2xl bg-orange-500/10 text-orange-500">
                  <Target className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black font-elmessiri text-foreground">رسالتنا</h2>
                <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                  نهدف إلى إثراء المحتوى العربي الرقمي عبر تقديم ترجمات احترافية وبجودة عالية لأشهر الروايات العالمية، مع توفير بيئة تفاعلية تدعم القراء والمترجمين على حد سواء.
                </p>
              </div>
              <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden p-10 rounded-[3rem] bg-primary text-white shadow-2xl shadow-primary/20 h-full flex flex-col justify-between"
            >
              <div className="space-y-6 relative z-10">
                <div className="p-4 w-fit rounded-2xl bg-white/20 text-white">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black font-elmessiri">رؤيتنا</h2>
                <p className="text-white/80 text-lg leading-relaxed font-medium">
                  أن نصبح المنصة الأولى والرائدة في الوطن العربي في مجال نشر وترجمة الروايات، وأن نساهم بفعالية في نشر الثقافة والمعرفة عبر أدوات تقنية متطورة ترتقي بتجربة المستخدم.
                </p>
              </div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 blur-3xl" />
            </motion.div>
          </div>
        </section>

        {/* ─── CORE VALUES (OUR PROMISE) ─── */}
        <section className="max-w-7xl mx-auto px-6 py-20 space-y-16">
          <div className="text-center space-y-4">
             <h2 className="text-4xl font-black font-elmessiri text-foreground">قيمنا الجوهرية</h2>
             <p className="text-muted-foreground max-w-xl mx-auto font-medium">المبادئ التي تقودنا في كل خطوة نخطوها للأمام.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="flex flex-col items-center text-center space-y-6 p-6 rounded-3xl hover:bg-muted/30 transition-colors duration-500 group"
              >
                <div className="relative">
                   <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="relative p-5 bg-card border border-border rounded-full text-primary shadow-lg shadow-black/5">
                      <value.icon className="w-8 h-8" />
                   </div>
                </div>
                <div className="space-y-3 text-center">
                  <h3 className="text-xl font-bold font-elmessiri text-foreground">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── CALL TO ACTION (MODERN) ─── */}
        <section className="max-w-7xl mx-auto px-6 py-10 mb-20 text-center">
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="relative overflow-hidden p-12 md:p-20 rounded-[4rem] bg-gradient-to-br from-card via-card to-primary/5 border border-border space-y-8 group"
           >
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(93,163,151,0.05)_0%,transparent_50%)]" />
              <h2 className="text-4xl md:text-6xl font-black font-elmessiri leading-tight relative z-10 text-foreground">هل ترغب في الانضمام <br/> إلى <span className="text-primary italic">عائلتنا</span>؟</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto relative z-10 font-medium">نحن دائماً نبحث عن المبدعين والمترجمين الشغوفين للمشاركة في رحلتنا المثيرة.</p>
              <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
                 <button className="px-10 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform">تواصل معنا</button>
                 <button className="px-10 py-4 rounded-2xl glass font-black border border-border hover:bg-muted transition-colors text-foreground">تصفح الروايات</button>
              </div>
           </motion.div>
        </section>

      </div>
    </div>
  );
};

export default AboutUs;
