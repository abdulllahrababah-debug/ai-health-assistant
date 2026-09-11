const diseases = require('../data/diseasesData');
const medicines = require('../data/medicinesData');

exports.getDiseases = (req, res) => {
  try {
    const { search = '', category = '' } = req.query;
    let results = diseases;
    
    if (category && category.trim()) {
      const cat = category.trim().toLowerCase();
      results = results.filter(d => 
        (d.category && d.category.toLowerCase() === cat) ||
        (d.category && d.category.toLowerCase().includes(cat)) ||
        (d.specialist && d.specialist.toLowerCase().includes(cat))
      );
    }
    
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter(d => 
        (d.name_ar && d.name_ar.toLowerCase().includes(q)) || 
        (d.name_en && d.name_en.toLowerCase().includes(q)) ||
        (d.description_ar && d.description_ar.toLowerCase().includes(q)) ||
        (d.description_en && d.description_en.toLowerCase().includes(q)) ||
        (d.symptoms && d.symptoms.toLowerCase().includes(q)) ||
        (d.specialist && d.specialist.toLowerCase().includes(q))
      );
    }

    res.json({ diseases: results, total: results.length });
  } catch (err) {
    console.error('Error fetching diseases:', err);
    res.status(500).json({ message: 'خطأ في جلب بيانات القاموس الطبي' });
  }
};

exports.getMedicines = (req, res) => {
  try {
    const { search = '', category = '' } = req.query;
    let results = medicines;

    if (category && category.trim()) {
      const cat = category.trim().toLowerCase();
      results = results.filter(m => {
        if (!m.category) return false;
        const mc = m.category.toLowerCase();
        if (mc.includes(cat)) return true;
        if (cat === 'مسكن' && (mc.includes('مسكن') || mc.includes('التهاب'))) return true;
        if (cat === 'مضاد' && (mc.includes('مضاد') || mc.includes('فطريات') || mc.includes('مطهر'))) return true;
        if (cat === 'القلب' && (mc.includes('قلب') || mc.includes('ضغط') || mc.includes('تخثر') || mc.includes('كوليسترول') || mc.includes('دهون') || mc.includes('مدرات') || mc.includes('مميع'))) return true;
        if (cat === 'السكري' && (mc.includes('سكر') || mc.includes('غدة') || mc.includes('نقرس'))) return true;
        if (cat === 'المعدة' && (mc.includes('معدة') || mc.includes('حموضة') || mc.includes('قولون') || mc.includes('إسهال') || mc.includes('ملين') || mc.includes('غثيان') || mc.includes('قيء'))) return true;
        if (cat === 'الصدر' && (mc.includes('صدر') || mc.includes('ربو') || mc.includes('تنفس') || mc.includes('بلغم') || mc.includes('قصبات'))) return true;
        if (cat === 'الحساسية' && (mc.includes('حساسية') || mc.includes('هيستامين') || mc.includes('احتقان'))) return true;
        if (cat === 'الأعصاب' && (mc.includes('أعصاب') || mc.includes('اكتئاب') || mc.includes('صداع') || mc.includes('دوخة') || mc.includes('نفس'))) return true;
        if (cat === 'مراهم' && (mc.includes('مرهم') || mc.includes('كريم') || mc.includes('جلد') || mc.includes('قطر') || mc.includes('موضعي'))) return true;
        if (cat === 'فيتامين' && (mc.includes('فيتامين') || mc.includes('مكمل') || mc.includes('معادن') || mc.includes('حديد'))) return true;
        return false;
      });
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter(m => 
        (m.name_ar && m.name_ar.toLowerCase().includes(q)) || 
        (m.name_en && m.name_en.toLowerCase().includes(q)) ||
        (m.uses && m.uses.toLowerCase().includes(q)) ||
        (m.category && m.category.toLowerCase().includes(q)) ||
        (m.warnings && m.warnings.toLowerCase().includes(q))
      );
    }

    res.json({ medicines: results, total: results.length });
  } catch (err) {
    console.error('Error fetching medicines:', err);
    res.status(500).json({ message: 'خطأ في جلب بيانات دليل الأدوية' });
  }
};