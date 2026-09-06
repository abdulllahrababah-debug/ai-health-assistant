const diseases = require('../data/diseasesData');
const medicines = require('../data/medicinesData');

exports.getDiseases = (req, res) => {
  try {
    const { search = '', category = '' } = req.query;
    let results = diseases;
    
    if (category) {
      results = results.filter(d => d.category === category);
    }
    
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter(d => 
        d.name_ar.toLowerCase().includes(q) || 
        d.name_en.toLowerCase().includes(q) ||
        (d.symptoms && d.symptoms.toLowerCase().includes(q))
      );
    }

    res.json({ diseases: results, total: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في جلب بيانات القاموس الطبي' });
  }
};

exports.getMedicines = (req, res) => {
  try {
    const { search = '', category = '' } = req.query;
    let results = medicines;

    if (category) {
      results = results.filter(m => m.category.includes(category));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter(m => 
        m.name_ar.toLowerCase().includes(q) || 
        m.name_en.toLowerCase().includes(q) ||
        m.uses.toLowerCase().includes(q)
      );
    }

    res.json({ medicines: results, total: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في جلب بيانات دليل الأدوية' });
  }
};