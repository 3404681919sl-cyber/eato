// 品牌库：输店名时模糊匹配，命中即用品牌色块头像，免去手动传图。
// aliases 含中/英/缩写；color 为品牌主色（色块底）；short 为色块上的字（1-2字）。

export type BrandEntry = {
  name: string;
  aliases: string[];
  color: string;
  short: string;
};

export const BRANDS: BrandEntry[] = [
  { name: '海底捞', aliases: ['海底捞', 'haidilao'], color: '#E60012', short: '海' },
  { name: '麦当劳', aliases: ['麦当劳', 'mcdonald', '金拱门', 'm记'], color: '#FFC72C', short: 'M' },
  { name: '肯德基', aliases: ['肯德基', 'kfc'], color: '#D6232A', short: 'K' },
  { name: '星巴克', aliases: ['星巴克', 'starbucks'], color: '#00704A', short: '星' },
  { name: '瑞幸咖啡', aliases: ['瑞幸', 'luckin', '小蓝杯'], color: '#002D72', short: '瑞' },
  { name: '喜茶', aliases: ['喜茶', 'heytea'], color: '#111111', short: '喜' },
  { name: '蜜雪冰城', aliases: ['蜜雪冰城', '蜜雪', 'mxbc'], color: '#FE0000', short: '雪' },
  { name: '霸王茶姬', aliases: ['霸王茶姬', 'bawangchaji', '霸王'], color: '#0B1E3F', short: '霸' },
  { name: '茶百道', aliases: ['茶百道', 'chabaidao'], color: '#C8102E', short: '茶' },
  { name: '古茗', aliases: ['古茗', 'guming'], color: '#1B5E20', short: '古' },
  { name: '西贝莜面村', aliases: ['西贝', '西贝莜面村'], color: '#C8102E', short: '西' },
  { name: '太二酸菜鱼', aliases: ['太二', '太二酸菜鱼'], color: '#E60012', short: '二' },
  { name: '汉堡王', aliases: ['汉堡王', 'burgerking', 'bk'], color: '#D6232A', short: '王' },
  { name: '必胜客', aliases: ['必胜客', 'pizza hut', 'pizzahut'], color: '#E23744', short: '客' },
  { name: '呷哺呷哺', aliases: ['呷哺', '呷哺呷哺'], color: '#E60012', short: '呷' },
  { name: '凑凑火锅', aliases: ['凑凑', '凑凑火锅'], color: '#C02942', short: '凑' },
  { name: '小龙坎', aliases: ['小龙坎'], color: '#A4161A', short: '龙' },
  { name: '大董', aliases: ['大董'], color: '#1A1A1A', short: '董' },
  { name: '外婆家', aliases: ['外婆家'], color: '#C0392B', short: '外' },
  { name: '绿茶餐厅', aliases: ['绿茶', '绿茶餐厅'], color: '#2E7D32', short: '绿' },
  { name: '南京大牌档', aliases: ['大牌档', '南京大牌档'], color: '#8B5A2B', short: '牌' },
  { name: '永和豆浆', aliases: ['永和', '永和豆浆'], color: '#1E88E5', short: '永' },
  { name: '真功夫', aliases: ['真功夫'], color: '#C62828', short: '功' },
  { name: '老乡鸡', aliases: ['老乡鸡'], color: '#F9A825', short: '乡' },
  { name: '杨国福麻辣烫', aliases: ['杨国福', '杨国福麻辣烫'], color: '#D32F2F', short: '杨' },
  { name: '张亮麻辣烫', aliases: ['张亮', '张亮麻辣烫'], color: '#388E3C', short: '张' },
];
