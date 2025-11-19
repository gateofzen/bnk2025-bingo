// common.js

// ★ここにFirebaseの設定を貼り付けます（後述の手順で取得）
const firebaseConfig = {
  apiKey: "AIzaSyDNPT6qv47ku9PBYLm_9FDl-hY0sQqZHn8",
  authDomain: "bnk2025-bingo.firebaseapp.com",
  databaseURL: "https://bnk2025-bingo-default-rtdb.firebaseio.com",
  projectId: "bnk2025-bingo",
  storageBucket: "bnk2025-bingo.firebasestorage.app",
  messagingSenderId: "127094139624",
  appId: "1:127094139624:web:703cf76da95ba05154b75d",
  measurementId: "G-2LVWF4GVS5"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// プログラムリスト（ご提供いただいたもの）
const candidates = [
    "BB1 10s 1", "BB1 10s 2", "BB1 90s 1", "BB1 Comp 1", "BB1 Comp 2", "BB1 Comp 3", "BB1 Comp 4", "BB1 Hit 1",
    "BB1 Hit 2", "BB1 Hit 3", "BB1 Hit 4", "BB1 Hit 5", "BB1 Hit 6", "BB1 Hit 7", "BB1 Hit 8", "BB1 Hit 9", "BB1 Hit 10",
    "BB1 Hit 11", "BB1 Hous 1", "BB1 Hous 2", "BB1 DVGT", "BB1 Queen", "BB1 TSFT", "BB1 GRMY 65", "BB2 10s 1",
    "BB2 10s 2", "BB2 Hit 1", "BB2 Hit 2", "BB2 Hit 3", "BB2 Hit 4", "BB2 Hit 5", "BB2 Hit 6", "BB2 Hit 7", "BB2 Hit 8",
    "BB2 Hit 9", "BB2 Hit 10", "BB2 Hit 11", "BB2 Hit 12", "BB2 Hit 13", "BB2 Hit 14", "BB2 Hit 15", "BB2 Hit 16",
    "BB2 Hit 17", "BB2 Hit 18", "BB2 Hit 19", "BB2 Hit 20", "BB2 Hit 21", "BB2 Hit 22", "BB2 Comp 1", "BB2 Comp 2",
    "BB2 Comp 3", "BB2 Comp 4", "BB2 Comp 5", "BB2 Comp 6", "BB2 90s 1", "BB2 90s 2", "BB2 UPGD 1", "BB2 UPGD 2",
    "BB2 UPGD 3", "BB2 HH 1", "BB2 HH 2", "BB2 Hous 1", "BB2 Hous 2", "BB2 Hous 3", "BB2 Hous 4", "BB2 Metal 1",
    "BB2 Metal 2", "BB2 Jazz 1", "BB2 Deep 1", "BB2 Deep 2", "BB2 Deep 3", "BB2 JONAS", "BB2 JUSTIN", "BB2 MDNA",
    "BB2 MJ 1", "BB2 MJ 2", "BB2 MJ 3", "BB2 MLN 1", "BB2 MLN 2", "BB2 MLN 3", "BB2 Soul 1", "BB2 Soul 2", "BB2 Rock 1",
    "BB2 Rock 2", "BB2 Movie 1", "BB2 Movie 2", "BB2 MTGX", "BB2 P!NK", "BB2 PTX", "BB2 QOP 1", "BB2 Queen",
    "BB2 Regg 1", "BB2 Regg 2", "BB2 RHNA", "BB2 SUMR 1", "BB2 SUMR 2", "BB2 Xmas 1", "BB2 Xmas 2", "BB2 Xmas 3",
    "BB2 BTLS 1", "BB2 BTLS 2", "BB2 BTLS 3", "BB2 ARGD", "BB2 ADELE", "BB2 BEYONCE", "BB2 BRJ", "BB2 BRMS",
    "BB2 BMLY", "BB2 Avicii", "BB2 DVGT", "BB2 EDM", "BB2 FLG", "BB2 GRDY", "BB2 ZEDD", "BB2 1D", "BB2 BNJV",
    "BB2 BRIT 2023", "BB2 BRMS 2", "BB2 CDPY", "BB2 CSBW", "BB2 CVHS", "BB2 Dua Lipa", "BB2 EDSR", "BB2 EMINEM",
    "BB2 FLOB", "BB2 HBHC", "BB2 KYGO", "BB2 LDGG", "BB2 Lizzo", "BB2 MRN5", "BB2 NE-YO", "BB2 USHER", "BB2 USHER 2",
    "BB2 SMST", "BB2 CDPY 2", "BB2 R&B 1", "BB2 R&B 2", "BB2 3Y-1", "BB2 3Y-2", "BB2 2016", "BB2 2017", "BB2 2018",
    "BB2 2019", "BB3 Hit 1", "BB3 Hit 2", "BB3 Hit 3", "BB3 Hit 4", "BB3 Hit 5", "BB3 Hit 6", "BB3 UPGD 1",
    "BB3 Comp 1", "BB3 HH 1", "BB3 HH 2", "BB3 Hous 1", "BB3 Hous 2", "BB3 Hous 3", "BB3 Deep 1", "BB3 Regg 1",
    "BB3 World 1", "BB3 Soul 1", "BB3 Rock 1", "BB3 Rock 2", "BB3 IRMD", "BEERCYCLE", "BSW Hit 1", "BSW Hit 2",
    "BSW Hit 3", "BSW Hit 4", "BSW Hit 5", "BSW Hit 6", "BSW Hit 7", "BSW Hit 8", "BSW Hous 1", "BSW Hous 2", "BSW Comp 1",
    "BSW Comp 2", "BSW Comp 3", "BSW Rock 1", "BSW Soul 1", "BSW Jazz 1", "BSW Regg 1", "BSB 10s 1", "BSB Hit 1",
    "BSB Hit 2", "BSB Hit 3", "BSB Hit 4", "BSB Hit 5", "BSB Hit 6", "BSB Hit 7", "BSB Hous 1", "BSB Comp 1", "BSB Rock 1",
    "BSB Deep 1", "BSB Jazz 1", "BSB Regg 1", "BSL Hit 1", "BSL Hit 2", "BSL Hit 3", "BSL Hit 4", "BSL Hit 5", "BSL Hit 6",
    "BSL Hit 7", "BSL Hit 8", "BSL Hous 1", "BSL Hous 2", "BSL Comp 1", "BSL Rock 1", "BSL Deep 1", "BSL Deep 2",
    "BSWi Hous 1", "BSWi Hous 2", "BSWi Hous 3", "BSWi HH 1", "BSWi Metal 1", "BSBi Hous 1", "BSBi Hous 2", "SKRILLEX",
    "FEEL NOW B4", "8th SP", "9th SP 1", "9th SP 2", "10th SP", "FEEL DEEP", "FEEL HIGH", "BSW R&B 1",
    "FEEL NOW B3", "FEEL NOW B2", "FEEL NOW B1", "FEEL NOW S1", "FEEL NOW S2", "FEEL NOW S3", "FEEL NOW G1", "FEEL NOW G2", "FEEL NOW G3",
    "BB2 Hous 6", "BSW 10s 1", "BB2 GRMY 66", "L 24 FEEL", "L 24 FREE", "BB1 BRIT 2024", "BB2 Dua Lipa 2", "BSWi BMLY",
    "BSBi BMLY", "BB1 Hous 3", "BB3 Hous 4", "BB1 NOW 1", "BSL Deep 3", "BB2 10s 3", "L 24 FREE 2", "L 24 FEEL 2",
    "BB1 Hous 4", "BB2 Xmas 4", "BB2 CHARLI", "BB2 RDMC", "BB2 RHCP", "BB2 JMCF", "BB2 Jeff Beck", "BB2 SIGALA", 
    "BB2 CSBW 2", "BB2 NOW 1", "BSW L&S", "BB1 GRMY 67", "BB2 BRIT 2025", "BB2 LDGG 2", "BB2 NOW 2", "BB2 10s 4", "BSL Deep 4",
    "BSW Hous 3", "BB2 Hous 7", "BSB HH 2", "L 25 FEEL", "L 25 FREE", "BSWi Hous 4", "L 25 BTM", "BB3 10s 1", "BB1 NOW 2",
    "BSBi Deep 1", "BB2 Comp 7", "BB1 Hous 5", "BSL R&B 1",
];

// スタイル適用関数（ご提供いただいたものを共通化）
function applyStyle(element, text, isHistoryItem = false) {
  element.removeAttribute('style');
  element.removeAttribute('class');
  
  let bgColor = '';
  let textColor = '';
  
  if (text.substring(0, 3) === "BB1") { bgColor = '#FFFF00'; textColor = 'black'; }
  else if (text.substring(0, 3) === "BB2") { bgColor = '#FF9933'; textColor = 'black'; }
  else if (text.substring(0, 3) === "BB3") { bgColor = '#FF3300'; textColor = 'black'; }
  else if (text.startsWith("BSBi")) { bgColor = '#336699'; textColor = '#DEFF66'; }
  else if (text.startsWith("BSB")) { bgColor = '#00CCFF'; textColor = 'black'; }
  else if (text.startsWith("BSWi")) { bgColor = '#990099'; textColor = '#FFEF7F'; }
  else if (text.startsWith("BSW")) { bgColor = '#CC66FF'; textColor = 'white'; }
  else if (text.startsWith("BSL")) { bgColor = '#0000CC'; textColor = 'white'; }
  else if (text.includes("FEEL NOW G")) { bgColor = '#B08A3A'; textColor = 'white'; }
  else if (text.includes("FEEL NOW S")) { bgColor = '#666666'; textColor = 'white'; }
  else if (text.includes("FEEL NOW B")) { bgColor = '#00121C'; textColor = 'white'; }
  else if (text.includes("FEEL HIGH")) { bgColor = 'white'; textColor = 'black'; }
  else if (text.includes("FEEL DEEP")) { bgColor = 'white'; textColor = 'black'; }
  else if (text.includes("BTM")) { bgColor = '#00121C'; textColor = '#BD3EA4'; }
  else if (text.includes("FREE")) { bgColor = '#00121C'; textColor = '#D61C1C'; }
  else if (text.includes("FEEL")) { bgColor = '#00121C'; textColor = '#0761F1'; }
  else if (text.includes("SP")) { bgColor = '#00121C'; textColor = 'white'; }
  else if (text === "BEERCYCLE") { bgColor = '#7A3202'; textColor = 'white'; }
  else if (text === "SKRILLEX") { bgColor = 'white'; textColor = 'black'; }
  else { bgColor = 'transparent'; textColor = 'white'; }

  if (!isHistoryItem) {
    element.style.padding = '20px 40px';
    element.style.cursor = 'pointer';
  } else {
    element.style.padding = '5px 15px';
    element.style.display = 'inline-block';
    element.style.margin = '3px';
  }
  
  element.style.backgroundColor = bgColor;
  element.style.color = textColor;
}