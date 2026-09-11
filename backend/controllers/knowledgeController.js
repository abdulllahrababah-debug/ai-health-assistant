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
      results = results.filter(m => 
        m.category && m.category.toLowerCase().includes(cat)
      );
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