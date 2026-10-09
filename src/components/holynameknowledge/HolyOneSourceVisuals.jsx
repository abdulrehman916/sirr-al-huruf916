import { useState } from 'react';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

function figureUrl(visual) {
  if (typeof visual?.visual_data_uri === 'string' && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(visual.visual_data_uri)) return visual.visual_data_uri;
  return typeof visual?.visual_url === 'string' && /^https:\/\//i.test(visual.visual_url) ? visual.visual_url : null;
}

function SourceVisual({ visual, language }) {
  const [failed, setFailed] = useState(false);
  const url = figureUrl(visual);
  const title = (language === 'ml' ? visual.title_ml : visual.title_en) || (language === 'ml' ? 'മൂലഗ്രന്ഥത്തിലെ കളം / പ്രത്യേക ലിപി' : 'Source figure / special script');
  return <figure className="rounded-xl border border-gold-dim p-3 space-y-3">
    <figcaption className="text-base text-gold">{title}</figcaption>
    {url && !failed ? <img src={url} alt={title} loading="lazy" onError={() => setFailed(true)} className="w-full max-w-2xl mx-auto h-auto rounded-lg bg-white" />
      : <p className="text-sm text-white/60">{language === 'ml' ? 'ഈ കളത്തിന്റെ മൂലചിത്രം ഇപ്പോൾ തുറക്കാനായില്ല.' : 'The original figure is currently unavailable.'}</p>}
    <p className="text-xs text-white/60 break-words">{visual.source_reference} · {language === 'ml' ? 'പേജ്' : 'page'} {visual.source_page}</p>
    <p className="text-white/85 text-base leading-loose whitespace-pre-wrap">{language === 'ml' ? visual.description_ml : visual.description_en}</p>
    <p className="text-xs text-white/50">{language === 'ml' ? 'മൂലഗ്രന്ഥത്തിലെ കളം അതേപടി എടുത്തതാണ്; അക്കങ്ങളോ ലിപികളോ പുനർനിർമിച്ചിട്ടില്ല. ഗുണങ്ങൾ ഗ്രന്ഥത്തിലെ അവകാശവാദങ്ങളാണ്.' : 'Extracted from the source, preserving its numbers and script. Claimed properties are the book’s accounts.'}</p>
  </figure>;
}

export default function HolyOneSourceVisuals({ visuals, cardId }) {
  const { language } = useHolyNamesLanguage();
  const seen = new Set();
  const items = (Array.isArray(visuals) ? visuals : []).filter(v => {
    // Ordinary page scans and unrelated imported pictures are intentionally excluded.
    if (!v || !['wafq', 'talisman', 'special_script'].includes(v.visual_type) || v.review_status !== 'checked_against_scan' || v.matched_pdf_name_id !== cardId) return false;
    const key = v.image_sha256 || JSON.stringify([v.visual_url, v.source_reference, v.source_page]);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
  if (!items.length) return null;
  return <section className="rounded-xl border border-gold-dim p-4">
    <h2 className="text-gold font-semibold">{language === 'ml' ? 'യഥാർത്ഥ കളങ്ങളും പ്രത്യേക ലിപികളും' : 'Original figures and special scripts'} · {items.length}</h2>
    <div className="mt-3 space-y-4">{items.map((v,i) => <SourceVisual key={i} visual={v} language={language} />)}</div>
  </section>;
}
