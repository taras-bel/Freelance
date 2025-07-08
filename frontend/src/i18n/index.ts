import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all language files
import en from './locales/en.json';
import ru from './locales/ru.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import zh from './locales/zh.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';
import tr from './locales/tr.json';
import pl from './locales/pl.json';
import nl from './locales/nl.json';
import sv from './locales/sv.json';
import da from './locales/da.json';
import no from './locales/no.json';
import fi from './locales/fi.json';
import cs from './locales/cs.json';
import sk from './locales/sk.json';
import hu from './locales/hu.json';
import ro from './locales/ro.json';
import bg from './locales/bg.json';
import hr from './locales/hr.json';
import sr from './locales/sr.json';
import sl from './locales/sl.json';
import et from './locales/et.json';
import lv from './locales/lv.json';
import lt from './locales/lt.json';
import uk from './locales/uk.json';
import be from './locales/be.json';
import kk from './locales/kk.json';
import uz from './locales/uz.json';
import ky from './locales/ky.json';
import tg from './locales/tg.json';
import az from './locales/az.json';
import ka from './locales/ka.json';
import am from './locales/am.json';
import he from './locales/he.json';
import fa from './locales/fa.json';
import ur from './locales/ur.json';
import bn from './locales/bn.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import gu from './locales/gu.json';
import pa from './locales/pa.json';
import or from './locales/or.json';
import as from './locales/as.json';
import ne from './locales/ne.json';
import si from './locales/si.json';
import my from './locales/my.json';
import km from './locales/km.json';
import lo from './locales/lo.json';
import th from './locales/th.json';
import vi from './locales/vi.json';
import id from './locales/id.json';
import ms from './locales/ms.json';
import tl from './locales/tl.json';
import fil from './locales/fil.json';
import jv from './locales/jv.json';
import su from './locales/su.json';
import min from './locales/min.json';
import ace from './locales/ace.json';
import ban from './locales/ban.json';
import bug from './locales/bug.json';
import mad from './locales/mad.json';
import mak from './locales/mak.json';
import mg from './locales/mg.json';
import mi from './locales/mi.json';
import sm from './locales/sm.json';
import to from './locales/to.json';
import fj from './locales/fj.json';
import haw from './locales/haw.json';
import qu from './locales/qu.json';
import gn from './locales/gn.json';
import ay from './locales/ay.json';
import sw from './locales/sw.json';
import yo from './locales/yo.json';
import ig from './locales/ig.json';
import ha from './locales/ha.json';
import zu from './locales/zu.json';
import xh from './locales/xh.json';
import af from './locales/af.json';
import st from './locales/st.json';
import sn from './locales/sn.json';
import nso from './locales/nso.json';
import ve from './locales/ve.json';
import ts from './locales/ts.json';
import ss from './locales/ss.json';
import nr from './locales/nr.json';
import nd from './locales/nd.json';
import is from './locales/is.json';
import fo from './locales/fo.json';
import gl from './locales/gl.json';
import eu from './locales/eu.json';
import ca from './locales/ca.json';
import oc from './locales/oc.json';
import co from './locales/co.json';
import br from './locales/br.json';
import cy from './locales/cy.json';
import ga from './locales/ga.json';
import gd from './locales/gd.json';
import kw from './locales/kw.json';
import gv from './locales/gv.json';
import mt from './locales/mt.json';
import sq from './locales/sq.json';
import mk from './locales/mk.json';
import bs from './locales/bs.json';
import me from './locales/me.json';
import cnr from './locales/cnr.json';
import sh from './locales/sh.json';
import rn from './locales/rn.json';
import rw from './locales/rw.json';
import ki from './locales/ki.json';
import lg from './locales/lg.json';
import ak from './locales/ak.json';
import tw from './locales/tw.json';
import ee from './locales/ee.json';
import fon from './locales/fon.json';
import dyu from './locales/dyu.json';
import bm from './locales/bm.json';
import wo from './locales/wo.json';
import ff from './locales/ff.json';
import fuv from './locales/fuv.json';
import ibo from './locales/ibo.json';
import yor from './locales/yor.json';
import hau from './locales/hau.json';
import zul from './locales/zul.json';
import xho from './locales/xho.json';
import afr from './locales/afr.json';
import sot from './locales/sot.json';
import sna from './locales/sna.json';
import nso from './locales/nso.json';
import tso from './locales/tso.json';
import ssw from './locales/ssw.json';
import nbl from './locales/nbl.json';
import nde from './locales/nde.json';
import isl from './locales/isl.json';
import fao from './locales/fao.json';
import glg from './locales/glg.json';
import eus from './locales/eus.json';
import cat from './locales/cat.json';
import oci from './locales/oci.json';
import cos from './locales/cos.json';
import bre from './locales/bre.json';
import cym from './locales/cym.json';
import gle from './locales/gle.json';
import gla from './locales/gla.json';
import cor from './locales/cor.json';
import glv from './locales/glv.json';
import mlt from './locales/mlt.json';
import alb from './locales/alb.json';
import mkd from './locales/mkd.json';
import bos from './locales/bos.json';
import cnr from './locales/cnr.json';
import hrv from './locales/hrv.json';
import kin from './locales/kin.json';
import run from './locales/run.json';
import lug from './locales/lug.json';
import aka from './locales/aka.json';
import twi from './locales/twi.json';
import ewe from './locales/ewe.json';
import fon from './locales/fon.json';
import dyu from './locales/dyu.json';
import bam from './locales/bam.json';
import wol from './locales/wol.json';
import ful from './locales/ful.json';
import fuv from './locales/fuv.json';

const resources = {
  en,
  ru,
  es,
  fr,
  de,
  it,
  pt,
  ja,
  ko,
  zh,
  ar,
  hi,
  tr,
  pl,
  nl,
  sv,
  da,
  no,
  fi,
  cs,
  sk,
  hu,
  ro,
  bg,
  hr,
  sr,
  sl,
  et,
  lv,
  lt,
  uk,
  be,
  kk,
  uz,
  ky,
  tg,
  az,
  ka,
  am,
  he,
  fa,
  ur,
  bn,
  ta,
  te,
  kn,
  ml,
  gu,
  pa,
  or,
  as,
  ne,
  si,
  my,
  km,
  lo,
  th,
  vi,
  id,
  ms,
  tl,
  fil,
  jv,
  su,
  min,
  ace,
  ban,
  bug,
  mad,
  mak,
  mg,
  mi,
  sm,
  to,
  fj,
  haw,
  qu,
  gn,
  ay,
  sw,
  yo,
  ig,
  ha,
  zu,
  xh,
  af,
  st,
  sn,
  nso,
  ve,
  ts,
  ss,
  nr,
  nd,
  is,
  fo,
  gl,
  eu,
  ca,
  oc,
  co,
  br,
  cy,
  ga,
  gd,
  kw,
  gv,
  mt,
  sq,
  mk,
  bs,
  me,
  cnr,
  sh,
  rn,
  rw,
  ki,
  lg,
  ak,
  tw,
  ee,
  fon,
  dyu,
  bm,
  wo,
  ff,
  fuv,
  ibo,
  yor,
  hau,
  zul,
  xho,
  afr,
  sot,
  sna,
  nso,
  tso,
  ssw,
  nbl,
  nde,
  isl,
  fao,
  glg,
  eus,
  cat,
  oci,
  cos,
  bre,
  cym,
  gle,
  gla,
  cor,
  glv,
  mlt,
  alb,
  mkd,
  bos,
  cnr,
  hrv,
  kin,
  run,
  lug,
  aka,
  twi,
  ewe,
  fon,
  dyu,
  bam,
  wol,
  ful,
  fuv,
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Language metadata for UI
export const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', flag: '🇧🇾' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша', flag: '🇰🇿' },
  { code: 'uz', name: 'Uzbek', nativeName: 'O'zbekcha', flag: '🇺🇿' },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча', flag: '🇰🇬' },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ', flag: '🇹🇯' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', flag: '🇬🇪' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', flag: '🇰🇭' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ', flag: '🇱🇦' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', flag: '🇵🇭' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭' },
  { code: 'jv', name: 'Javanese', nativeName: 'Basa Jawa', flag: '🇮🇩' },
  { code: 'su', name: 'Sundanese', nativeName: 'Basa Sunda', flag: '🇮🇩' },
  { code: 'min', name: 'Minangkabau', nativeName: 'Baso Minang', flag: '🇮🇩' },
  { code: 'ace', name: 'Acehnese', nativeName: 'Bahsa Acèh', flag: '🇮🇩' },
  { code: 'ban', name: 'Balinese', nativeName: 'Basa Bali', flag: '🇮🇩' },
  { code: 'bug', name: 'Buginese', nativeName: 'Basa Ugi', flag: '🇮🇩' },
  { code: 'mad', name: 'Madurese', nativeName: 'Basa Madura', flag: '🇮🇩' },
  { code: 'mak', name: 'Makassarese', nativeName: 'Basa Mangkasara', flag: '🇮🇩' },
  { code: 'mg', name: 'Malagasy', nativeName: 'Fiteny Malagasy', flag: '🇲🇬' },
  { code: 'mi', name: 'Maori', nativeName: 'Te Reo Māori', flag: '🇳🇿' },
  { code: 'sm', name: 'Samoan', nativeName: 'Gagana Samoa', flag: '🇼🇸' },
  { code: 'to', name: 'Tongan', nativeName: 'Lea Faka-Tonga', flag: '🇹🇴' },
  { code: 'fj', name: 'Fijian', nativeName: 'Vosa Vakaviti', flag: '🇫🇯' },
  { code: 'haw', name: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi', flag: '🇺🇸' },
  { code: 'qu', name: 'Quechua', nativeName: 'Runa Simi', flag: '🇵🇪' },
  { code: 'gn', name: 'Guarani', nativeName: 'Avañe\'ẽ', flag: '🇵🇾' },
  { code: 'ay', name: 'Aymara', nativeName: 'Aymar Aru', flag: '🇧🇴' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇹🇿' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Èdè Yorùbá', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', nativeName: 'Harshen Hausa', flag: '🇳🇬' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  { code: 'st', name: 'Southern Sotho', nativeName: 'Sesotho', flag: '🇿🇦' },
  { code: 'sn', name: 'Shona', nativeName: 'chiShona', flag: '🇿🇼' },
  { code: 'nso', name: 'Northern Sotho', nativeName: 'Sesotho sa Leboa', flag: '🇿🇦' },
  { code: 've', name: 'Venda', nativeName: 'Tshivenda', flag: '🇿🇦' },
  { code: 'ts', name: 'Tsonga', nativeName: 'Xitsonga', flag: '🇿🇦' },
  { code: 'ss', name: 'Swati', nativeName: 'siSwati', flag: '🇸🇿' },
  { code: 'nr', name: 'Southern Ndebele', nativeName: 'isiNdebele', flag: '🇿🇦' },
  { code: 'nd', name: 'Northern Ndebele', nativeName: 'isiNdebele', flag: '🇿🇼' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', flag: '🇮🇸' },
  { code: 'fo', name: 'Faroese', nativeName: 'Føroyskt', flag: '🇫🇴' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego', flag: '🇪🇸' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', flag: '🇪🇸' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: '🇪🇸' },
  { code: 'oc', name: 'Occitan', nativeName: 'Occitan', flag: '🇫🇷' },
  { code: 'co', name: 'Corsican', nativeName: 'Corsu', flag: '🇫🇷' },
  { code: 'br', name: 'Breton', nativeName: 'Brezhoneg', flag: '🇫🇷' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', flag: '🇬🇧' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', flag: '🇮🇪' },
  { code: 'gd', name: 'Scottish Gaelic', nativeName: 'Gàidhlig', flag: '🇬🇧' },
  { code: 'kw', name: 'Cornish', nativeName: 'Kernewek', flag: '🇬🇧' },
  { code: 'gv', name: 'Manx', nativeName: 'Gaelg', flag: '🇮🇲' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', flag: '🇲🇹' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', flag: '🇦🇱' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', flag: '🇲🇰' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', flag: '🇧🇦' },
  { code: 'me', name: 'Montenegrin', nativeName: 'Crnogorski', flag: '🇲🇪' },
  { code: 'cnr', name: 'Montenegrin', nativeName: 'Crnogorski', flag: '🇲🇪' },
  { code: 'sh', name: 'Serbo-Croatian', nativeName: 'Srpskohrvatski', flag: '🇷🇸' },
  { code: 'rn', name: 'Kirundi', nativeName: 'Ikirundi', flag: '🇧🇮' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', flag: '🇷🇼' },
  { code: 'ki', name: 'Kikuyu', nativeName: 'Gĩkũyũ', flag: '🇰🇪' },
  { code: 'lg', name: 'Luganda', nativeName: 'Luganda', flag: '🇺🇬' },
  { code: 'ak', name: 'Akan', nativeName: 'Akan', flag: '🇬🇭' },
  { code: 'tw', name: 'Twi', nativeName: 'Twi', flag: '🇬🇭' },
  { code: 'ee', name: 'Ewe', nativeName: 'Eʋegbe', flag: '🇹🇬' },
  { code: 'fon', name: 'Fon', nativeName: 'Fon gbè', flag: '🇧🇯' },
  { code: 'dyu', name: 'Dyula', nativeName: 'Julakan', flag: '🇨🇮' },
  { code: 'bm', name: 'Bambara', nativeName: 'Bamanankan', flag: '🇲🇱' },
  { code: 'wo', name: 'Wolof', nativeName: 'Wolof', flag: '🇸🇳' },
  { code: 'ff', name: 'Fula', nativeName: 'Fulfulde', flag: '🇸🇳' },
  { code: 'fuv', name: 'Nigerian Fulfulde', nativeName: 'Fulfulde', flag: '🇳🇬' },
  { code: 'ibo', name: 'Igbo', nativeName: 'Asụsụ Igbo', flag: '🇳🇬' },
  { code: 'yor', name: 'Yoruba', nativeName: 'Èdè Yorùbá', flag: '🇳🇬' },
  { code: 'hau', name: 'Hausa', nativeName: 'Harshen Hausa', flag: '🇳🇬' },
  { code: 'zul', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦' },
  { code: 'xho', name: 'Xhosa', nativeName: 'isiXhosa', flag: '🇿🇦' },
  { code: 'afr', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  { code: 'sot', name: 'Southern Sotho', nativeName: 'Sesotho', flag: '🇿🇦' },
  { code: 'sna', name: 'Shona', nativeName: 'chiShona', flag: '🇿🇼' },
  { code: 'nso', name: 'Northern Sotho', nativeName: 'Sesotho sa Leboa', flag: '🇿🇦' },
  { code: 'tso', name: 'Tsonga', nativeName: 'Xitsonga', flag: '🇿🇦' },
  { code: 'ssw', name: 'Swati', nativeName: 'siSwati', flag: '🇸🇿' },
  { code: 'nbl', name: 'Southern Ndebele', nativeName: 'isiNdebele', flag: '🇿🇦' },
  { code: 'nde', name: 'Northern Ndebele', nativeName: 'isiNdebele', flag: '🇿🇼' },
  { code: 'isl', name: 'Icelandic', nativeName: 'Íslenska', flag: '🇮🇸' },
  { code: 'fao', name: 'Faroese', nativeName: 'Føroyskt', flag: '🇫🇴' },
  { code: 'glg', name: 'Galician', nativeName: 'Galego', flag: '🇪🇸' },
  { code: 'eus', name: 'Basque', nativeName: 'Euskara', flag: '🇪🇸' },
  { code: 'cat', name: 'Catalan', nativeName: 'Català', flag: '🇪🇸' },
  { code: 'oci', name: 'Occitan', nativeName: 'Occitan', flag: '🇫🇷' },
  { code: 'cos', name: 'Corsican', nativeName: 'Corsu', flag: '🇫🇷' },
  { code: 'bre', name: 'Breton', nativeName: 'Brezhoneg', flag: '🇫🇷' },
  { code: 'cym', name: 'Welsh', nativeName: 'Cymraeg', flag: '🇬🇧' },
  { code: 'gle', name: 'Irish', nativeName: 'Gaeilge', flag: '🇮🇪' },
  { code: 'gla', name: 'Scottish Gaelic', nativeName: 'Gàidhlig', flag: '🇬🇧' },
  { code: 'cor', name: 'Cornish', nativeName: 'Kernewek', flag: '🇬🇧' },
  { code: 'glv', name: 'Manx', nativeName: 'Gaelg', flag: '🇮🇲' },
  { code: 'mlt', name: 'Maltese', nativeName: 'Malti', flag: '🇲🇹' },
  { code: 'alb', name: 'Albanian', nativeName: 'Shqip', flag: '🇦🇱' },
  { code: 'mkd', name: 'Macedonian', nativeName: 'Македонски', flag: '🇲🇰' },
  { code: 'bos', name: 'Bosnian', nativeName: 'Bosanski', flag: '🇧🇦' },
  { code: 'cnr', name: 'Montenegrin', nativeName: 'Crnogorski', flag: '🇲🇪' },
  { code: 'hrv', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  { code: 'kin', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', flag: '🇷🇼' },
  { code: 'run', name: 'Kirundi', nativeName: 'Ikirundi', flag: '🇧🇮' },
  { code: 'lug', name: 'Luganda', nativeName: 'Luganda', flag: '🇺🇬' },
  { code: 'aka', name: 'Akan', nativeName: 'Akan', flag: '🇬🇭' },
  { code: 'twi', name: 'Twi', nativeName: 'Twi', flag: '🇬🇭' },
  { code: 'ewe', name: 'Ewe', nativeName: 'Eʋegbe', flag: '🇹🇬' },
  { code: 'fon', name: 'Fon', nativeName: 'Fon gbè', flag: '🇧🇯' },
  { code: 'dyu', name: 'Dyula', nativeName: 'Julakan', flag: '🇨🇮' },
  { code: 'bam', name: 'Bambara', nativeName: 'Bamanankan', flag: '🇲🇱' },
  { code: 'wol', name: 'Wolof', nativeName: 'Wolof', flag: '🇸🇳' },
  { code: 'ful', name: 'Fula', nativeName: 'Fulfulde', flag: '🇸🇳' },
  { code: 'fuv', name: 'Nigerian Fulfulde', nativeName: 'Fulfulde', flag: '🇳🇬' },
];

export const getLanguageByCode = (code: string) => {
  return languages.find(lang => lang.code === code) || languages[0];
};

export const getLanguageName = (code: string) => {
  const lang = getLanguageByCode(code);
  return lang.nativeName || lang.name;
}; 