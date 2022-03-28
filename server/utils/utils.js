// NOTE: please do not put here any functions called by front-end apps.

const dfd = require('danfojs-node');
const { Sequelize } = require('sequelize');
const nodemailer = require('nodemailer');

require('dotenv').config();

const APPOINTMENT_CODE_MAP = {
  0: 'Pending',
  1: 'Confirmed',
  2: 'Waiting',
  3: 'BeingSeen',
  4: 'Completed',
  5: 'Late',
  6: 'Missed',
  7: 'Canceled',
  8: 'Rescheduled',
  9: 'Recalled',
  10: 'Unknown',
};

const APPOINTMENT_CODE_MAP_REV = {
  Pending: 0,
  Confirmed: 1,
  Waiting: 2,
  BeingSeen: 3,
  Completed: 4,
  Late: 5,
  Missed: 6,
  Canceled: 7,
  Rescheduled: 8,
  Recalled: 9,
  Unknown: 10,
};

const MONTH_NAME = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const monthNameIndex = new Map([
  ['Jan', 1],
  ['Feb', 2],
  ['Mar', 3],
  ['Apr', 4],
  ['May', 5],
  ['Jun', 6],
  ['Jul', 7],
  ['Aug', 8],
  ['Sep', 9],
  ['Oct', 10],
  ['Nov', 11],
  ['Dec', 12],
]);

const iovR1MainTable = [
  'Chart',
  'First_Name',
  'Last_Name',
  'DOB',
  'Age',
  'Race',
  'Email',
  'Primary_Code',
  'Address',
  'City',
  'State',
  'Ref_Source',
  'Ref_Source_Code',
  'Ref_Source_MD',
  'Latest_IOV_Appt_Status',
  'Latest_IOV_Appt_Date',
  'IOV Provider',
  'R1_Appt_Status',
  'R1_Appt_Date',
  'R1_Provider',
  'R1_Completion_Duration',
  'IVF_R1',
  'IVF_Start_Date',
  'Monitor',
  'First_Monitor_Appt_Date',
  'ER',
  'First_ER_Appt_Date',
  'Transfer',
  'First_Transfer_Type',
  'First_Transfer_Appt_Date',
];

const iovR1MonitorTable = [
  'Chart',
  'DOB',
  'Age',
  'Race',
  'Primary_Code',
  'Address',
  'City',
  'State',
  'Ref_Source',
  'IOV?',
  'IOV_Appt_Date',
  'IOV MD',
  'R1_Appt_Status',
  'R1_Appt_Date',
  'R1 Provider',
  'Monitor_Type',
  'Monitor_Status',
  'Monitor_Date',
  'Return Visit?',
  'Days of Interval',
];

const iovR1ERTable = [
  'Chart',
  'DOB',
  'Age',
  'Race',
  'Primary_Code',
  'Address',
  'City',
  'State',
  'Ref_Source',
  'IOV?',
  'IOV_Appt_Date',
  'IOV MD',
  'ER_Status',
  'ER_Date',
];

const iovR1TransferTable = [
  'Chart',
  'DOB',
  'Age',
  'Race',
  'Primary_Code',
  'Address',
  'City',
  'State',
  'Ref_Source',
  'IOV?',
  'IOV_Appt_Date',
  'IOV MD',
  'Transfer_Status',
  'Transfer_Type',
  'Transfer_Date',
];

const r1CodeList = [
  'R1',
  'R1MAKA',
  'MONITOR',
  'R1OM',
  'OM',
  'SCANMAKA',
  'HSG',
  'ZEITHSG',
  'GENCOUNS',
  'ZHANGCOUR',
  'OVAREJ',
  'ENDOSMAKA',
  'SCREENFEM',
  'WATERSONO',
  'ZEITCOURT',
  'IUI',
  'HYSTODC',
  'BLOOD',
  'DONORFU',
  'INJECTION',
  'SCANZEIT',
  'MONMTZHAN',
  'MONITORBK',
  'BHCG',
  'SIS',
  'SF',
  'ER',
  'ENDO',
  'PGDSIGN',
  'SA',
  'DARCON',
  'PAPSMEAR',
  'PRP',
];

const columnTitleList = [
  'Created_Date',
  'Booked_Date',
  'Calendly_Appt_Status',
  'Chart_Number',
  'Name',
  'Phone_Number',
  'Email',
  'Appt_Type',
  'Referral_Source',
  'Insurance_Info',
  'State',
  'IOV_Confirmed',
  'Latest_IOV_Status',
  'Latest_IOV_Date',
];

const referringPhysicianCode = {
  '0000ANZAI': 'YUZURU ANZAI, MD',
  ABING0000: 'ABINGTON OBGYN',
  ABRAM0000: 'ABRAMS, MD',
  ADAMI0000: 'JULIA ADAMIAN, MD',
  ADINA0000: 'ADINA ROSENZVEIG',
  ADLER0000: 'ALAN ADLER, MD',
  ADVIN0000: 'ARNOLD ADVINCULA, MD',
  AGARW0000: 'NEENA AGARWALA, MD',
  AGARW0001: 'RUCHI AGARWAL, MD',
  AGAYE0000: 'KAMILA AGAYEVA, MD',
  AGUST0000: 'PRAISE AGUSTUS, MD',
  AHMAD0000: 'LIDA AHMADY, LAC',
  ALBER0000: 'PAMELA ALBERT, PA',
  ALBRI0000: 'DEBRA CURETON, CNM',
  ALI0000: 'AAMIR ALI, MD',
  ALJAN0000: 'EMAN AL-JANABI, MD',
  ALLAH0000: 'GAUTAM ALLAHBADIA, MD',
  ALTER0000: 'SHIRA ALTER, MD',
  AMERI0000: 'ALI AMERI, MD',
  AMIRA0000: 'RICHARD AMIRAIN, MD',
  ANANI0000: 'CAROL ANANIA, MD',
  ANDER0000: 'Dr. Samantha Anderson, DNP',
  ANGEL0000: 'JESSICA ANGELSON, CNM',
  ANTOI0000: 'CLAREL ANTOINE, MD',
  ARCHI0000: 'CARMIT ARCHIBALD, MD, FACOG',
  ARE0000: 'GOPIKA ARE, MD',
  ASLAM0000: 'ANGELA ASLAMI, MD',
  AUVET0000: 'PATRICIA CASTRO-AUVET',
  AVEDI0000: 'HAROUTIUN AVEDISSIAN, MD',
  AVERB0000: 'LAUREN AVERBUCH, MD',
  BAGNE0000: 'MICHAEL BAGNER, MD',
  BAHR0000: 'GERALD BAHR, MD',
  BAICY0000: 'KATE BAICY, MD',
  BARBE0000: 'ANNA BARBIERI M.D.',
  BARR0000: 'RACHEL BARR, MD',
  BATIS0000: 'FRANKIE BATISTE, PA',
  BAUCH0000: 'GAIL BAUCHMAN, MD',
  BAUTI0000: 'JUDITA B BAUTISTA, MD.',
  BAYYA0000: 'VIJAYA BAYYA',
  BECKE0000: 'ASHLEY BECKER, MD',
  BELLE0000: 'BELLEVUE HOSPITAL',
  BENDE0000: 'SAMUEL BENDER, MD',
  BENED0000: 'MARIA ANZAI BENEDETTO, MD',
  BENHA0000: 'OSHRA BEN-HAI',
  BENIN0000: 'ASYA BENIN, MD',
  BERG0000: 'ROBERT BERG, MD',
  BERIN0000: 'INNA BERIN, MD',
  BERKL0000: 'ALAN BERKELEY, MD',
  BERKO0001: 'HARRY BERKOWITZ, MD',
  BERLI0000: 'SCOTT BERLINER',
  BERMA0000: 'JOAN BERMAN, MD',
  BEROO0000: 'BOBACK BEROOKHIM, MD',
  BHARA0000: 'MEENAKSHI BHARARA, MD',
  BINNS0000: 'ASHLEE BINNS, DOAM',
  BINSO0000: 'CLAIRE BINSOL, DO',
  BIRDS0000: 'STACIA BETH BIRDSALL, CNM',
  BIROS0000: 'JULIANNE BIROSCHAK, MD',
  BISWA0000: 'SMITA BISWAS, MD',
  BLAIR0000: 'MELISSA BLAIR, MD',
  BLAKE0000: 'YINOVA CENTER',
  BLANK0000: 'STEPHANIE BLANK, MD',
  BLANT0000: 'EMILY BLANTON, MD',
  BLICK0000: 'LINCOLN BLICKFORD',
  BLUMB0000: 'ISABEL BLUMBERG, MD',
  BOAFO0000: 'ALEX BOAFO, MD',
  BOOZA0000: 'FERESHTEH BOOZARJOMEHRI, MD',
  BOTER0000: 'LANA BOTER, MD',
  BOWER0000: 'DAN BOWERS, MD',
  BOZZO0000: 'FELIPE BOZZO, MD',
  BRADL0000: 'KATRINA BRADLEY, MD',
  BRAND0000: 'ILONA BRANDEIS, MD',
  BRASN0000: 'SHARI BRASNER, MD',
  BRAY0000: 'MARY BRAY, MD',
  BREGM0000: 'RACHEL BREGMAN, MD',
  BREGM0001: 'BERTIE BREGMAN, MD',
  BRENN0000: 'JENNIFER BRENNAN, NP',
  BRIGH0000: 'REBECCA BRIGHTMAN, MD',
  BRIGN0000: 'PAULA BRIGNONI-BLUME, MD',
  BRILL0000: 'HAYAMA BRILL, MD',
  BRODM0000: 'MICHAEL BRODMAN, MD',
  BROMB0000: 'ALICE BROMBERG, NP',
  BROWN0000: 'ROBIN BROWN, MD',
  BROWN0001: 'MAGDA BROWN, NP',
  BUI0000: 'SANDY BUI, MD',
  BUKMU0000: 'NADINE BUKMUZ, MD',
  BURNS0000: 'CHRISTINA BURNS, LAC',
  BURNS0001: 'CHRISTINA BURNS,  L.Ac',
  BURUI0000: 'ELENA-MARIA BURUIANA, M.D. FACOG',
  CALLI0000: 'FRANCESCO CALLIPARI, MD',
  CAMBU0000: 'DANIEL CAMBURN',
  CANTO0000: 'AVIVA CANTOR, PA',
  CARPE0000: 'ELIZABETH CARPENTER, LAC',
  CARRA0000: 'ALICIA CARRANZA, MD',
  CASTA0000: 'PAULA CASTANO, MD',
  CASTI0000: 'MERCEDES CASTIEL, MD',
  CATON0000: 'ANNIE CATON-WONG',
  CENTR0000: 'CENTRAL PARK SOUTH OBGYN',
  CEPIN0000: 'ANA CEPIN, MD',
  CHAN0000: 'ALEXANDER CHAN, MD',
  CHAN0001: 'EDWARD CHAN, MD',
  CHAN0002: 'YUEN KWAN CHAN, CNM',
  CHANG0000: 'LYNDON CHANG, MD',
  CHAUD0000: 'SONAL CHAUDRY',
  CHAVE0000: 'ROWLAND CHAVEZ, MD',
  CHEN0000: 'HAIFAN CHEN, MD',
  CHEN0001: 'ANLI CHEN, LAC',
  CHEN0002: 'CHING-LYNN CHEN, MD',
  CHEN0003: 'SZUYU JENNY CHEN, MD',
  CHEN0004: 'TINA CHEN',
  CHEN0005: 'GARY CHEN, MD',
  CHENG0000: 'SHIOW-JANE CHENG, MD',
  CHEON0000: 'TERESA CHEON, MD',
  CHEUN0000: 'WILLIAM CHEUNG, MD',
  CHEUN0001: 'CINDY CHEUNG, MD',
  CHEUN0002: 'MARGARET CHEUNG, PA',
  CHIN0000: 'JAMES CHIN, MD',
  CHIN0001: 'RENEE CHIN, MD',
  CHING0000: 'SAMUEL CHUNG-SHING, MD',
  CHO0000: 'HELEN CHO, MD',
  CHO0001: 'MICHAEL CHO, MD',
  CHOE0000: 'JENNIFER CHOE, MD',
  CHOI0000: 'YVONNE CHOI, MD',
  CHOI0001: 'JANET CHOI, MD',
  CHOI0002: 'LINDA CHO, MD',
  CHOU0000: 'YEH PING CHOU, MD',
  CHOWD0000: 'Dr. Rabeya Chowdhury',
  CHOY0000: 'YOUYIN CHOY, MD',
  CHRIS0000: 'CHRISTINA KWON, MD',
  CHRIS0001: 'SOPHIE CHRISOMALIS, MD',
  CHUN0000: 'EUNMEE CHUN, MD',
  CHUNG0001: 'BRUCE CHUNG, MD',
  CHUU0000: 'LOUISE CHUU, MD',
  CITYA0000: 'CITY ACUPUNCTURE',
  CLARE0000: 'FREDERICK CLARE, MD',
  CLUNI0000: 'GARFIELD CLUNIE, MD',
  COBBL0000: 'COBBLE HILL ACUPUNCTURE',
  COCUC0000: 'HUGO COCUCCI, MD',
  COHEN0000: 'NADINE COHEN, MD',
  COHEN0001: 'LAUREN COHEN, MD',
  COHEN0002: 'RACHEL COHEN, MD',
  COHEN0003: 'BARRY COHEN, MD',
  COLLI0000: 'TRENTON COLLIER, MD',
  COLTE0000: 'NANCY COLTER, NP',
  COMRI0000: 'MILLICENT COMRIE, MD',
  COPUR0000: 'HUSEYIN COPUR, MD',
  COREY0000: 'CHINARA COREY, NP',
  CORIO0000: 'LAURA CORIO, MD',
  CRENE0000: 'ANN CRENESSE-COZIEN, MD',
  CRUZ0000: 'VINA CRUZ, DO',
  CUEVA0000: 'JUANA CUEVAS, MD',
  CULOT0000: 'MARIA CULOTTA, MD',
  CUMMI0000: 'ALLEGRA CUMMINGS, MD',
  CURET0000: 'SANDRA CURET, MD',
  DAITE0000: 'Dr. Eric Daiter',
  DALEY0000: 'DEVORAH DALEY, MD',
  DALTO0000: "MARY D'ALTON",
  DANOW0000: 'ERIN DANOWSKI, MD',
  DARDI0000: 'RAQUEL DARDIK, MD',
  DAVID0000: 'SAMI DAVID, MD',
  DAVIS0000: 'ANNE DAVIS, MD',
  DAVIS0001: 'JANETTE DAVISON, MD',
  DAWOD0000: 'OLUGBENG DAWODU, MD',
  DELEO0000: 'EMILY DELEON, MD',
  DELGA0000: 'DANA DELGARDO, MD',
  DELPR0000: 'GIUSEPPE DELPRIORE, MD',
  DEWIT0000: 'WILL DEWITT, MD',
  DIAMO0000: 'SHARON DIAMOND, MD',
  DIANA0001: 'DIANA SANTINI, MD',
  DIGRE0000: 'KRISTIN DIGREGORIO, MD',
  DIMAN0000: 'EMILY DIMANGO, MD',
  DING0000: 'QING DING, MD',
  DODSO0000: 'CARA DODSON, MD',
  DOMIN0000: 'GLORIA DOMINGUEZ, CNM',
  DONAH0000: 'STEPHANIE DONAHUE, NP',
  DONAH0001: 'SUSANNAH DONAHUE, LM',
  DONOT0000: '',
  DOOLE0000: 'MICHAEL DOOLEY, MD',
  DOOLEY000: '',
  DORIS0000: 'DORIS TAN, MD',
  DOUEK0000: 'VICTOR DOUEK, MD',
  DOUGL0000: 'NATAKI DOUGLAS, MD',
  DOWNI0000: 'ERIN DOWNING, CNM',
  DRMERHI: 'Dr. Zaher Merhi',
  DRPIE0000: 'Dr. Piers',
  DUAN0000: 'HAIOU DUAN, MD',
  DUAN0001: 'DEWAN DUAN, CNM',
  DUBRO0000: 'CARA DUBROFF, NP',
  DUFFY0000: 'KATIE DUFFY',
  DUPER0000: 'MELISSA DUPERVAL, MD',
  DURAN0000: 'MARGARET DURANTE, MD',
  DY0000: 'KIMBERLY DY, NP',
  EASTG0000: 'EASTGATE ACUPUNCTURE',
  EDDEL0000: 'KEITH EDDELMAN, MD',
  EDELS0000: 'ELIZABETH EDELSTEIN, MD',
  EGBER0000: 'NEHA MARIA EGBERT, MD',
  EGGFR0000: 'EGG FREEZING EVENT',
  EISIN0000: 'KATARINA EISINGER, MD',
  ELIAS0000: 'RONY ELIAS, MD',
  ELLIS0000: 'LAUREN ELLISTON, MD',
  ENG0000: 'LILY ENG, MD',
  ENG0001: 'LISA ENG, DO',
  ENGEL0000: 'MARC ENGELBERT, MD',
  ENGLE0000: 'ENGLEWOOD WOMENS HEALTH',
  ENRIC0000: 'ENRICA BASILICO, MD',
  ENSCH0000: 'ELIZABETH ENSCHEDE, MD',
  ERIKF0000: 'ERIC FOK, MD',
  ESPOS0000: 'LINDSAY ESPOSITO, MD',
  EVANS0000: 'MARK EVANS, MD',
  FA: 'Fertility Authority',
  FAHMY0000: 'FARRIS FAHMY, MD',
  FALLI0000: 'ANDREW FALLIS, MD',
  FANTI: 'MD',
  FASHA0000: 'EMANUEL FASHAKIN, MD',
  FECHN0000: 'ADAM FECHNER, MD',
  FEDER0000: 'SAMANTHA FEDER, MD',
  FEIN0000: 'TRACY FEIN, MD',
  FELDM0000: 'DANIELLE FELDMAN, MD',
  FENSK0000: 'SUZANNE FENSKE, MD',
  FERBE0000: 'ASAF FERBER, MD',
  FERRA0000: 'LAUREN FERRARA, MD',
  FIELD0000: 'ANNA FIELDMAN, MD',
  FIORE0000: 'JESSICA FIORELLI, MD',
  FISHE0000: 'NELLI FISHER, MD',
  FISHM0000: 'DAVID FISHMAN, MD',
  FISS0000: 'CAITLIN FISS, MD',
  FLAGG0000: 'HEIDI FLAGG, MD',
  FLANA0000: 'Laura Flanagan, MSN, WHNP-BC',
  FLAND0000: 'ANTHONY FLANDERS, MD',
  FLAVI0000: 'FLAVIA THEIL, MD',
  FONG0000: 'SUSAN FONG, MD',
  FORBU0000: 'LAUREN FORBUS, NP',
  FORD0000: 'TARA FORD, PA',
  FOREM0000: 'MONICA FOREMAN-HYACINTHE, MD',
  FOX0000: 'NATHAN FOX, MD',
  FRANC0000: 'MICHELLE FRANCIS, MD',
  FRATE0000: 'PATRICK FRATELLONE, MD',
  FRIED0000: 'DAVID FRIEDMAN, MD',
  FRIED0001: 'DAVID A. FRIEDMAN',
  FRIED0002: 'RACHEL FRIEDMAN, MD',
  FROMB0000: 'EDEN FROMBERG, MD',
  FU0000: 'ANNIE FU',
  FU0001: 'XUPING FU, MD',
  FUNG0000: 'SANDY FUNG, MD',
  GAHR0000: 'DEBORAH GAHR, MD',
  GAO0000: 'PEI GAO, MD',
  GAO0001: 'CONNIE GAO',
  GARDE0000: 'GARDEN ACUPUNCTURE',
  GARDN0000: 'VICTORIA GARDNER, PA',
  GAREL0000: 'ALAN GARELY, MD',
  GERLA0000: 'KECIA GERLACH, MD',
  GERSH0000: 'JUDITH GERSHOWITZ, MD',
  GERVA0000: 'CARLA GERVASIO, L.Ac',
  GIL0000: 'PATRICIA GIL, MD',
  GITEL0000: 'DIMITRI GITELMAKER, MD',
  GLICK0000: 'JEFFREY GLICK, MD',
  GNATT0000: 'MICHAEL GNATT, MD',
  GNISC0000: 'JENNIFER GNISCI',
  GOFOR0000: 'THOMAS GOFORTH, MD',
  GOGA0000: 'CARLY GOGA, PA',
  GOHAR0000: 'JAMES GOHAR, MD',
  GOLDB0000: 'ALEX GOLDBERG, LAC, DIPL. OM',
  GOLDS0000: 'GOLDSTEIN, MD',
  GOLDS0001: 'MARC GOLDSTEIN, MD',
  GOLDS0002: 'JAMIE GOLDSTEIN, MD',
  GOLOV0000: 'VERONIKA GOLOVA, NP',
  GOLTY0000: 'NATALYA GOLTYAPINA, DO',
  GONCH0000: 'DIMITRY GONCHAROV, DO',
  GONG0000: 'MABEL GONG, MD',
  GONZA0000: 'ANGELA GONZALES, MD',
  GOODM0000: 'ANDREW GOODMAN, MD',
  GOODS0000: 'CATHERINE GOODSTEIN, MD',
  GOTTL0000: 'AREN GOTTLIEB, MD',
  GRATC0000: 'MARY GRATCH, MD',
  GRAY0000: 'MARK GRAY, MD',
  GREEN0000: 'GREENWICH FERTILITY CENTER',
  GREEN0001: 'KELLY GREENING, MD',
  GREGG0000: 'ISABEL GREGG, MD',
  GRIGO0000: 'GENNADIY A. GRIGORYAN, MD',
  GRUEN0000: 'HARRY GRUENSPAN, MD',
  GRUSS0000: 'LESLIE GRUSS, MD',
  GU0000: 'YANBO GU, MD',
  GUADR0000: 'RUDY GUADRON, NP',
  GUAR0000: 'VICTOR GUAR, MD',
  GUBER0000: 'MARTIN GUBERNICK, MD',
  GULAT0000: 'RASHIMI GULATI, MD',
  GUPTA000: 'Dr. Shalini Gupta',
  GUPTA0000: 'SIMI GUPTA, MD',
  GUPTA0001: 'ADEETI GUPTA, MD',
  GUTMA0000: 'JACQUELINE GUTMANN, MD',
  HABER0000: 'SHOSHANA HABERMAN, MD',
  HAFEE0000: 'ATTIYA HAFEEZ, MD',
  HAILU0000: 'MEKDES HAILU, MD',
  HALEM0000: 'MONICA HALEM, MD',
  HALER0000: 'MEREDITH HALERN, MD',
  HANNA0000: 'LILY HANNA, MD',
  HARPE0000: 'HARPER, MD',
  HARRI0000: 'DENA HARRIS, MD',
  HE0000: 'ZILI HE, MD',
  HENRY0000: 'DONNA HENRY, MD',
  HENRY0001: 'SHANA-KAY HENRY, PA',
  HERNA0000: 'ALICIA HERNANDEZ, MD',
  HIGGI0000: 'PAULINE HIGGINS',
  HO0000: 'ALISON HO, MD',
  HO0001: 'ALLAN HO, MD',
  HOBBE0000: 'KUMARI HOBBES, MD',
  HODES0000: 'BROOKE HODES-WERTZ',
  HOJRA0000: 'DIEGO HOJRAJ, MD',
  HOLLA0000: 'CLAUDIA HOLLAND, MD',
  HOPS0000: 'PAMELA HOPS, MD',
  HORT0000: 'HORT, MD',
  HUANG0001: 'AMY HUANG, MD',
  HUANG0002: 'WILLIAM HUANG, MD',
  HUANG0003: 'MELINDA HUANG, MD',
  HUANG0004: 'YANMING HUANG, LAC',
  HUANG0005: 'JESSICA HUANG, PA',
  HUANG0006: 'ANDY HUANG, MD',
  HUDES0000: 'MEREDITH HUDES-LOWDER, NP',
  HUEY0000: 'HOWARD HUEY, MD',
  HUFF0000: 'JULIA HUFF, NP',
  HUIFA0000: 'XIAO HUIFANG, MD',
  HUNYU0000: 'HUNYUAN ACUPUNCTURE CENTER',
  HZZ: 'Hangzhou Zhang',
  INADA0000: 'VICTOR INADA, MD',
  IOCOL0000: 'CAROLYN IOCOLANO, MD',
  IPPOL0000: 'ELIO IPPOLITO, MD',
  ISHEK0000: 'Dr. Isheka Watkins',
  ISRAE0000: 'DINA ISRAELOV, CM',
  ISTRI0000: 'RICHARD ISTRICO, MD',
  IWANI0000: 'JOSEPH IWANICKI, MD',
  JADHA0000: 'ASHWIN JADHAV, MD',
  JAFFE0000: 'JULIA JAFFE, MD',
  JANG0000: 'SOYOUNG JANG',
  JANIA0000: 'CANDACE JANIA',
  JANIC0000: 'REGINA JANICIK, MD',
  JASPE0000: 'NANCY JASPER, MD',
  JENG0000: 'ING-YANN JENG, MD',
  JENG0001: 'DAI-YUN JENG, MD',
  JEUDY0000: 'SABINE JEUDY, CNM',
  JEW0000: 'EDWARD JEW, MD',
  JIN0000: 'WENHUI JIN, MD',
  JIN0001: 'WENHUI JIN, MD',
  JIN0002: 'HONG JIN, MD',
  JIN0003: 'MING JIN, MD',
  JINAD0000: 'BABALOLA JINADU, MD',
  JOHNS0000: 'LISA JOHNSON, MD',
  JOHNS0001: 'JILLIAN JOHNSTON, MD',
  JOLY0000: 'ROCHELLE JOLY, MD',
  JOSE0000: 'NEETU JOSE, MD',
  JOSHU0000: 'RACHEAL JOSHUA, MD',
  JOVAN0000: 'KEVIN JOVANOVIC, MD',
  KADET0000: 'ALAN KADET, MD',
  KAKOS0000: 'IRENE KAKOSSIAN, MD',
  KANG0000: 'STELLA KANG, MD',
  KANOS0000: 'JASON KANOS, MD',
  KAO0000: 'DANIEL KAO, MD',
  KAPLA0000: 'BENJAMIN KAPLAN, MD',
  KARAM0001: 'HARRY KARAMITSOS MD',
  KARP0001: 'ADAM KARP, MD',
  KASSE0000: 'RACHEL KASSENHOFF, MD',
  KAUFM0000: 'DAVID KAUFMAN, MD',
  KAZUN0000: 'KUNO KAZUNARI, MD',
  KEATY0000: 'KATHRYN KEATY, MD',
  KEE0000: 'KEE SHUM, MD',
  KEEGA0000: 'DEBBRA KEEGAN, MD',
  KENNE0000: 'HOLLISTER KENNEDY, FNP',
  KERWI0000: 'SUSANNAH KERWIN, NP',
  KESSL0000: 'ALAN KESSLER, MD',
  KESTE0000: 'SAMANTHA KESTEN, NP',
  KHAN0000: 'ABIGAIL KHAN, MD',
  KIM0000: 'SONIA KIM, MD',
  KIM0001: 'JINN HEE (JEANNIE) KIM, MD',
  KIM0002: 'YUHAN KIM, CNM',
  KIM0003: 'KIM, MD',
  KIM0004: 'HYEJUNG KIM, MD',
  KIM0005: 'HEATHER KIM',
  KIPOL0000: 'LEZODE KIPOLIONGO, MD',
  KLEBA0000: 'REBECCA KLEBAN, MD',
  KO0000: 'RUBY KO, CNM',
  KOLTO0000: 'SHELLEY KOLTON, MD',
  KONG0000: 'CHRISTINA KONG, MD FACOG',
  KONG0001: 'KIN C KONG, MD',
  KOOPE0000: 'STEVEN KOOPERMAN, MD',
  KORIN0000: 'REBEKAH KORINE, CNM',
  KRAME0000: 'JAMIE KRAMER, MD',
  KRAUS0000: 'NANCY KRAUS, MD',
  KREME0000: 'ANNA KREMER, MD',
  KREMP0000: 'CHANCE KREMPASKY, NP',
  KRSTI0000: 'JASMINA KRSTIC, MD',
  KUPER0000: 'MARINA KUPERMAN, MD',
  KURTZ0000: 'HOWARD KURTZ, MD',
  KUSHN0000: 'DANIEL KUSHNER, MD',
  KWEI0000: 'KAREN KWEI, MD',
  KWOK0000: 'PHYLLIS KWOK, MD',
  LABOT0000: 'LEOVINA LABOT-RAMA',
  LACOS0000: 'NICOLE LACOSTE, PA',
  LAI0000: 'CHRISTINA LAI, MD',
  LAI0001: 'AMY LAI, MD',
  LAJOI0000: 'SUZANNE LAJOIE, MD',
  LAL: 'LAL- LIANLI',
  LALMI0000: 'DANIELLA LALMIEV, PA',
  LAM0000: 'HENRY LAM, MD',
  LAM0001: 'STEPHANIE LAM, MD',
  LAMRA0000: 'JENNIFER LAM-RACHLIN',
  LANDI0000: 'VALERIE LANDIS',
  LANGE0000: 'HOPE LANGER, MD',
  LANS0000: 'CLONES LANS, MD',
  LARSO0000: 'CAROL LARSON, MD',
  LATIM0000: 'DUSTY LATIMER, PA',
  LAU0000: 'GRACE LAU, MD',
  LAU0001: 'FLORA LAU, PA',
  LAVIAN: 'PEJMAN LAVIAN, MD',
  LAWSO0000: 'LISA LAWSON, MD',
  LAYNE0000: 'KRISTIN LAYNE, PA',
  LE0000: 'ANGELA LE, L.Ac., FABORM',
  LEAL0000: 'GERTRUDES LEAL, NP',
  LEE0000: 'SANA LEE, MD',
  LEE0001: 'YOUNG MI LEE, MD',
  LEE0002: 'HARRY LEE, MD',
  LEE0003: 'WILL LEE, MD',
  LEE001: 'ROBERT LEE, MD',
  LEIPZ0000: 'SHARI LEIPZIG, MD',
  LEITE0000: 'GILA LEITER, MD',
  LESE0000: 'LAUREN LESE, CNM',
  LEUNG0000: 'GRACE LEUNG, LAC',
  LEVEY0000: 'KENNETH LEVEY, MD',
  LEVIN0000: 'MARC LEVIN, MD',
  LEVIT0000: 'JANE LEVITT, MD',
  LEVY0000: 'YAKOV LEVY, MD',
  LEVY0001: 'EDUARD LEVY, MD',
  LI0000: 'QI LI LI, MD',
  LI0001: 'ANGIE LI, MD',
  LI0002: 'BAOQING LI, MD',
  LICCI0000: 'FREDERICK L. LICCICARDI, MD',
  LIN: 'LIN- LINDA',
  LIN0001: 'SUN CO LIN, MD',
  LINCO0000: 'LINCOLN HOSPITAL',
  LISNE0000: 'THERESA LISNER, MD',
  LIU0000: 'CONNIE LIU, MD',
  LIU0001: 'LUCY LIU, LAC',
  LIX: 'Linda Xiong',
  LLOPI0000: 'CARMEN LLOPIZ-VALLE, MD',
  LONG0000: 'ANN LONG, MD',
  LOONA0000: 'REENA LOONA, MD',
  LOWER0000: 'ADRIAN LOWER, MD',
  LUKS0000: 'JULIE LUKS, MD',
  LUMIE0000: 'RICHARD LUMIERE, MD',
  LURIE0000: 'HEATHER LURIE, MD',
  LUSSK0000: 'SHARI LUSSKIN, MD',
  LYNN0000: 'LYNN, MD',
  MACA0000: 'MACA-NHFC MACAU',
  MACQU0000: 'CORALIE MACQUEEN, CNM',
  MAGGI0000: 'GAYGE MAGGIO, NP',
  MAHMO0000: 'AMMAR MAHMOUD, MD',
  MALDO0000: 'BRINA MALDONADO, MD',
  MANFI0000: 'JENNIFER MANFIELD, PA',
  MARKO0000: 'GARY MARKOFF, MD',
  MARKO0001: 'JACOB MARKOWITZ, MD',
  MARKP0000: 'MARK PARK, MD',
  MARKS0000: 'PAUL MARKS, LAC',
  MARKS0001: 'CRYSTAL MARKS, LAC',
  MARTI0000: 'ZANE MARTINDALE, MD',
  MARTI0001: 'STACY MARTINUCCI, MD',
  MATAM0000: 'MATAMALA, MD',
  MAX0000: 'MAX, MD',
  MCBRI0000: 'MOLLY MCBRIDE, MD',
  MCCAL0000: 'SANDRA MCCALLA, MD',
  MCCAR0000: 'MAUREEN MCCARTHY, RN',
  MCCLE0000: 'SPENCER MCCLELLAND, MD',
  MCDAN0000: 'SHA-BARBARA MCDANIEL, MD',
  MCKEN0000: 'PAULA MCKENZIE, MD',
  MCLAT0000: 'JACQUELINE MCLATCHY, MD',
  MDC: 'MD Connect',
  MEACH0000: 'PETER MEACHER, MD',
  MECHL0000: 'LEAT MECHLOVITZ, MD',
  MEEHA0000: 'BRIAN MEEHAN, MD',
  MEIMA0000: 'NATALIA MEIMARIS, MD',
  MEIMA0001: 'DR.',
  MELKA0000: 'STEPHANIE MELKA, MD',
  MELZE0000: 'KATHERINE MELZER ROSS, MD',
  MERAZ0000: 'EDDIE MERAZ, MD',
  MERCA0000: 'RAY MERCADO, MD',
  METZG0000: 'LISA METZGER, LAC, CIPL. AC',
  MEX0000: 'MEX-NHFC MEXICO',
  MI0000: 'LI JUN MI, MD',
  MI0001: 'LIJUN MI, MD',
  MICHEL: 'KETLY MITCHEL, MD',
  MIERL0000: 'JULIAN MIERLAK, MD',
  MIGLI0000: 'THOMAS MIGLIACCIO, MD',
  MIKHE0000: 'IRINA MIKHEYEVA, MD',
  MILES0000: 'SUSANNAH MILESHINA',
  MILES0001: 'SUSANNAH MILESHINA,',
  MILLA0000: 'KAYLENE MILLARD, MD',
  MILLE0000: 'JAMES MILLER, MD',
  MILLS0000: 'DAVISA MILLS, PA',
  MIN0000: 'DOROTHY MIN, MD',
  MINIO0000: 'VICTORIA MINIOR, MD',
  MOH: 'MOH- MORE HEALTH',
  MOHAM0000: 'IBRAHIM MOHAMMAD MIAN, MD',
  MOISA0000: 'ECATERINA MOISA-BABII',
  MONTE0000: 'ANA MONTEAGUDO, MD',
  MOORE0000: 'PEACE MOORE, NP',
  MORGA0000: 'MICHELLE MORGAN, MD',
  MORIT0000: 'JACQUES L. MORITZ, MD',
  MORRI0000: 'MORRIS, MD',
  MOSKO0000: 'JOEL MOSKOWITZ, MD',
  MOSS0000: 'DOUGLAS MOSS, MD',
  MOSS0001: 'RICHARD BOB MOSS, MD',
  MOUNT0000: 'MOUNT SINAI',
  MOUSH0000: 'DATTA MOUSHUMI, MD',
  MUCCI0000: 'GARY MUCCIOLO, MD',
  MUGDH0000: 'TANWAR MUGDHA, MD',
  MUHAM0000: 'ZAHEDA MUHAMMAD, MD',
  MULLI0000: 'KATHLEEN MULLIGAN, MD',
  MUNNE0000: 'MUNNEY, MD',
  MURRA0000: 'MURRAY HILL MEDICAL GROUP',
  MUSHA0000: 'TAONEI MUSHAYANADEBVU, MD',
  MUSSA0000: 'GEORGE MUSSALI, MD',
  MXW: 'MXW- MIXED WISDOM',
  MXW0000: 'MXW-MIXED WISDOM',
  NABIZ0000: 'FARZANEH NABIZADEH, MD',
  NAGY0000: 'SZILVIA NAGY, MD',
  NAMNO0000: 'JAMES NAMNOUM, MD',
  NAQVI0000: 'MARIAM NAQVI, MD',
  NAVAR0000: 'ALTAGRACIA GRACE NAVARRO, PA',
  NEELY0000: 'THOMAS NEELY, MD',
  NETZE0000: 'IRIS NETZER, LAC',
  NEWMD0000: 'New MD (See Notes)',
  NEZHA0000: 'FARR NEZHAT, MD',
  NG0000: 'PATTY NG, MD',
  NG0001: 'VINCENT NG, MD',
  NGAI0000: 'MAN LING NGAI, MD',
  NINAY0000: '',
  NISIM0000: 'BELLA NISIMOVA, PA',
  NITKI0000: 'LEON NITKIN, MD',
  NJACU0000: 'NJ ACUPUNCTURE & WELLNESS CENTER',
  NOEL0000: 'YVONNE NOEL, MD',
  NOUMI0000: 'GEORGE NOUMI, MD',
  NUNZI0000: 'PALOMA NUNZIATA, LCSW',
  NURAN0000: 'SOPHIE NURANI, NP',
  NUSTA0000: 'SHAHNOZ RUSTAMOVA, MD',
  NYEIN0000: 'BETTY NYEIN, MD',
  NYEIN0001: 'ROLAND NYEIN, MD',
  OHENR0000: "SEAN O'HENRY, MD",
  OKAFO0000: 'JOANA OKAFOR, MD',
  OLIVA0000: 'MARGARITA TRIVINO OLIVARES, MD',
  ONBRY0000: 'VICTORIA ONBREYT, MD',
  ONER0000: 'CEYDA ONER, MD',
  ORAM0000: 'VALERIE ORAM, MD',
  ORBUC0000: 'IRIS ORBUCH, MD',
  ORBUC0001: 'LAURENCE ORBUCH, MD',
  ORIEN0000: 'ORIENS LIVING ACUPUNCTURE',
  OSBOR0000: 'HEATHER OSBORNE, CNM',
  OSTRO0000: 'NIKOLE OSTROV, MD',
  OTTEN0000: 'DEBORAH OTTENHEIMER, MD',
  OVITS0000: 'EPHRAIM OVITSH, MD',
  OVULINE: 'OVULINE',
  OWEN0000: 'JANE OWEN, MD',
  OWUSU0000: 'GEORGE EVANS OWUSU, MD',
  PAKA0000: 'RENUKA PAKA, MD',
  PAKA0001: 'CHANDHANA PAKA, MD',
  PAN0000: 'EDWIN PAN',
  PARIS0000: 'MELISSA PARISH, NP',
  PARK0000: 'JOONHEE PARK, MD',
  PARK0001: 'MARY PARK, MD',
  PARK0002: 'BRIAN PARK, MD',
  PARK0003: 'SUSAN PARK, MD',
  PARKS0000: 'PARK SLOPE OBGYN',
  PARRI0000: 'JENISE PARRIS, LAC',
  PASTE0000: 'CAROLINE PASTER, CM',
  PATEL0000: 'AKASH PATEL, DO',
  PAUL0000: 'ALLISON PAUL, MD',
  PAVLO0000: 'ESTEE PAVLOUNIS',
  PAVLO0001: 'ESTEE PAVLOUNIS, MD',
  PAYER0000: 'REYNA PAYERO, MD',
  PEARC0000: 'ORIN PEARCE, MD',
  PEARL0000: 'ORA PEARLSTEIN, MD',
  PEARS0000: 'CHAD PEARSON',
  PERLM0000: 'KATARZYNA PERLMAN, MD',
  PETRI0000: 'BORIS PETRIKOVSKY, MD',
  PHILI0000: 'CAMILLE PHILIPPE, MD',
  PHILL0000: 'KAMEELAH PHILLIPS, MD',
  PILLS0000: 'HELEN PILSBURY, MD',
  PILSH0000: 'LINA PILSHCHIK, MD',
  PLAKO0000: 'MICHAEL PLAKOGIANNIS, MD',
  PLANC0000: 'KEVIN PLANCHER, MD',
  PLONK0000: 'SHIRA PLONKA, GC',
  POCHE0000: 'SAMANTHA POCHERT, MD',
  PODOL0000: 'REBECCA PODOLSKY, MD',
  POLES0000: 'HUNTER POLESE, NP',
  PONGN0000: 'SHEILA PONGNON, MD',
  PONGN0001: 'Sheila Pongnon, MD',
  PRASA0000: 'LONA PRASAD, MD',
  PREGN0000: 'PREGNANTISH',
  PUREO0000: 'PURE OBGYN',
  QIAN0000: 'CONNIE QIAN',
  QIONG0000: 'WU QIONG, MD',
  RADIX0000: 'ASA RADIX, MD',
  RAFAL0000: 'SAMUEL RAFALIN, MD',
  RATSE0000: 'DIMITRIY RATSENBERG, MD',
  REATH0000: 'VIRGINIA REATH, RPA MPH',
  REBAR0000: 'ANDREI REBARBER, MD',
  REN0000: 'LILI REN, MD',
  REPRO0000: 'REPRODUCTIVE SPECIALIST OF NY',
  REVIV0000: 'LEIGH REVIV',
  RHEE0000: 'ANNA RHEE, MD',
  RICHA0000: 'RICHARD AMIRIAN, MD',
  RICHI0000: 'RICHIE MENDIOLA, MD',
  RITTM0000: 'MICHAELINE RITTMAN, NP',
  RIVER0000: 'MONIQUE RIVERA',
  ROBER0000: 'JACLYN ROBERTS, MD',
  ROBIN0000: 'MICHELLE ROBINS, NP',
  RODKE0000: 'GAE RODKE, MD',
  ROGER0000: 'ELIZABETH ROGERS, MD',
  ROHDE0000: 'ERIN ROHDE, MD',
  ROHR0000: 'MARGARITA ROHR, MD',
  ROMER0000: 'JULIE ROMERO, MD',
  ROSCA0000: 'ANCA ROSCA, MD',
  ROSEN0000: 'LARA ROSENTHAL, LAC',
  ROSEN0001: 'HEIDI ROSENBERG, MD',
  ROSEN0002: 'AMBER ROSENTHAL, NP',
  ROSEN0003: 'CARLYN ROSENBLUM',
  ROSEN0004: 'JESSE ROSENTHAL, MD',
  ROTH0000: 'DIANA ROTH, MD',
  ROTH001: 'ALAN ROTHBERGER, MD',
  ROTHE0000: 'DESIDER ROTHE, MD',
  ROTTE0000: 'ERIC ROTTENBERG, MD',
  ROWEN0000: 'HEIDI ROWEN, MD',
  RUDIC0000: 'BRIANA RUDICK, MD',
  RUSHH0000: 'RUSH HOSPITAL',
  RUSSE0000: 'BERNADITH RUSSELL, MD',
  RUTEN0000: 'KATHRYN RUTENBERG, MD',
  RUTSE0000: 'ZHANNA RUTSEIN-SHULINA, MD',
  RUTST0000: 'ZHANNA RUTSTEIN-SHULINA, MD',
  RYBAK0000: 'ELI RYBAK, MD',
  RYNTZ0000: 'TIMOTHY RYNTZ, MD',
  SABO0000: 'MARY K SABO, DAOM',
  SACHE0000: 'MARY SACHER, MD',
  SAFIA0000: 'PATTY SAFIAN, MS, LAC',
  SAHAN0000: 'PARITA SAHANI, D0',
  SAITT0000: 'JACQUELINE SAITTA, MD',
  SALTZ0000: 'DANIEL SALTZMAN, MD',
  SARAH0000: 'SUMIT SARAF, MD',
  SASAN0000: 'FAHIMEH SASAN, MD',
  SASSO0000: 'ALBERT SASSOON, MD',
  SASSO0001: 'BOB SASSOON, MD',
  SASSO0002: 'ROBERT BOB SASSOON, MD',
  SASTR0000: 'AMBICA SASTRY, MD',
  SAUND0000: 'ALICIA SAUNDERS, MD',
  SCHEE0000: 'ALEXANDER SCHEER, MD',
  SCHER0000: 'JONATHAN SCHER, MD',
  SCHIL0000: 'LAURA SCHILLER, MD',
  SCHUL0000: 'JAMIE SCHULTIS, MD',
  SCHWA0000: 'IDA E. SCHWAB, MD',
  SCHWA0001: 'MOSCHE SCHWARTZ, MD',
  SCOTT0000: 'KIMBERLY SCOTTO-WETZEL, MD',
  SEGAL0000: 'SAYA SEGAL, MD',
  SEIDM0000: 'YARON SEIDMAN, MD',
  SELET0000: 'TAMILA SELITSKY',
  SELIT0000: 'LANA SELITSKY, DO',
  SERVA0000: 'ELSBET SERVAY, NP',
  SESE0000: 'LINDA SESE, MD',
  SHAFR0000: 'GAIL SHAFRAN, MD',
  SHAH0000: 'AMI SHAH, MD',
  SHAH0001: 'SONA SHAH',
  SHAH0002: 'ANUPAMA SHAH, MD',
  SHAH0003: 'BHADRA SHAH, MD',
  SHAHI0001: 'ABE SHAHIM, MD',
  SHAMI0000: 'SARAH SHAMI, PA',
  SHAMS0000: 'SETAREH SHAMS, MD',
  SHANN0000: 'SHANNON HUDSON, MD',
  SHAPI0000: 'PHYLLIS SHAPIRO, LAC',
  SHARM0000: 'GEETA SHARMA, MD',
  SHAW0000: 'HOWARD SHAW, MD',
  SHENG0000: 'STEVEN SHENG, MD',
  SHETH0000: 'NEHA SHETH, DO',
  SHIFR0000: 'GREGORY SHIFRIN, MD',
  SHIRA0000: 'TARANEH SHIRAZIAN, MD',
  SHNAY0000: 'RIMMA SHNAYDMAN, MD',
  SHOMA0000: 'ADAM SHOMAN, MD',
  SHONG0000: 'DONG-HONG SHONG',
  SHRIV0000: 'ANITA SHRIVASTAVA, MD',
  SI0000: 'SHUI H. SI, MD',
  SI0001: 'SEONGPAN SI, MD',
  SIERE0000: 'AVA SIERECKI, MD',
  SIGLE0000: 'KATHRYN SIGLER, CM',
  SILBE0002: 'SHERMAN SILBER',
  SILVE0000: 'MICHAEL SILVERSTEIN, MD',
  SILVE0001: 'DAVID SILVERMAN, MD',
  SILVE0002: 'MATTHEW SILVERMAN, MD',
  SIMON0000: 'RAYZE SIMONSON, MD',
  SIMON0001: 'MONICA SIMONS, MD',
  SINOG0000: 'SINOG MEDICAL ASSOCIATES',
  SIS: 'SIS- SISTER',
  SITCH0000: 'SHANNON SITCHENKO, NP',
  SKLAR0000: 'Dr. Marc Sklar',
  SKLAR0001: 'ELAINE SKLAR, DO',
  SMETH0000: 'KATHERINE SMETHURST',
  SMITH0000: 'AGGIE SMITH, NP',
  SO0000: 'SHIU HUNG SO, MD',
  SONG0000: 'XIAOYAN SONG, MD',
  SONG0001: 'JOON SONG, MD',
  SONG0002: 'JOON SONG, MD',
  SOREN0000: 'CARLY SORENSEN, LAC',
  SOSKI0000: 'LUBA SOSKIN, MD',
  SPIEL0000: 'NORA SPIELMAN, MD',
  SPOTI0000: 'SPOTIFY PATIENT',
  SPRUI0000: 'TERRI SPRUILL, PA',
  STAVR0000: 'STAVROS LAZAROU, MD',
  STEIN0000: 'DANIEL STEIN, MD',
  STEPH0000: 'GAIL STEPHEN-JOHNSON, MD',
  STEPH0001: 'PATRICIA STEPHENS, NP',
  STOEP0000: 'JEREMY STOEPKER, MD',
  STONE0000: 'JOANNE STONE, MD',
  STRAU0000: 'SOOHEE STRAUB, DACM LAC',
  STRAU0001: 'ALYSSA STRAUSS',
  STRON0000: 'MICHAEL STRONGIN, MD',
  STYLE0000: 'MARIANNE STYLER, MD',
  SU0000: 'MARI SU',
  SUMMERS: 'REBECCA SUMMERS, MD',
  SUN0000: 'JAIJI SUN, LAC',
  SUNG0000: 'MAX SUNG, MD',
  SUSAN0000: '',
  SY0000: 'MANUEL SY, MD',
  SYRTA0000: 'ANDREA SYRTASH',
  SZLAC0000: 'SZLACHTER BETTY, MD',
  TALIB0000: 'MAHINO TALIB, MD',
  TANG0002: 'JENNY TANG, MD',
  TARR0000: 'DIANE TARR, MD',
  TAYLO0000: 'KATHERINE TAYLOR, MD',
  TAZUK0000: 'SALLI TAZUKE, MD',
  TEAIW0000: 'MARIA TEAIWA-RUTHERFORD, MD',
  TEDON0000: 'ASHLEY TEDONE, NP',
  TENG0000: 'RUI ER TENG, MD',
  TEPPE0000: 'ALEX TEPPER, MD',
  TERRA0000: 'MICHAEL TERRANI, MD',
  TERRA0001: 'MIHCAEL TERRANI, MD',
  TEST0000: 'Daniel Test',
  TEST1: 'John Zhang MD PhD',
  THAMM0000: 'MICHELLE THAM METZ, MD',
  THECE0000: 'GUOPING ZHENG',
  THOMA0000: 'THAFARIE THOMAS, NP',
  THORN0000: 'KAREN THORNTON, MD',
  THUM0000: 'YAU THUM, MD',
  TISE0000: 'SUHEILY TISE, NP',
  TORTO0000: 'DREW TORTORIELLO, MD',
  TOTH0000: 'ATTILA TOTH, MD',
  TOU0000: 'CHENG MAN TOU, MD',
  TRAFL0000: 'ELIZABETH TRAFLET, NP',
  TRAN0000: 'RICHIE TRAN, MD',
  TRING0000: 'DIANE NICHOLSON, CNM',
  TRING0001: 'TANYA TRINGALI, CNM',
  TRIPP0000: 'TANYA TRIPPETT, MD',
  TROPE0000: 'JACK TROPER, MD',
  TROSS0000: 'CATHERINE TROSSELLO, NP',
  TROTI0000: 'MELISSA TROTINER, NP',
  TSE0000: 'LIM TSE, MD',
  TSIMI0000: 'FLORA TSIMIS, NP',
  TSUNG0000: 'IRIS TSUNG, MD',
  TUN0000: 'KAN TUN, MD',
  TUNCH0000: 'YOLANDA TUN-CHIONG, MD',
  TUNG0000: 'PEARL TUNG, CNM',
  TUNG0001: 'JUDY TUNG, MD',
  UCHYT0000: 'AIMEE UCHYTIL, NP',
  UNTER0000: 'ALISON UNTERREINER',
  VAIL0000: 'RONA VAIL, MD',
  VANDY0000: 'WENDY VANDYKE, MD',
  VIOLI0000: 'CATERINA VIOLI, MD',
  VON0000: 'SCOTT VON',
  VON0001: 'JULIE VON',
  WADE0000: 'LEIGH WADE, MD',
  WALIA0000: 'JENNIFER WALIA, MD',
  WAN0000: 'STEPHEN WAN, MD',
  WANG0000: 'CHARLES B. WANG, MD',
  WANG0001: 'MEI WANG, MD',
  WANG0002: 'LINDA WANG, MD',
  WANG0003: 'SHENG WANG',
  WANG0004: 'JENNY WANG, MD',
  WANG0005: 'XIAO HUI WANG',
  WEBER0000: 'LAUREN WEBER, MD',
  WEI0000: 'ALEX WEI, MD',
  WEIMI0000: 'QU WEIMIN, MD',
  WEING0000: 'AMANDA WEINGARTEN, CNM',
  WEISS0000: 'JESSICA WEISS, NP',
  WEISS0001: 'SUSAN WEISS, NP',
  WELLE0000: 'VALERIE WELLS, MD',
  WERNE0000: 'MARIE WERNER, MD',
  WESLL0000: 'WESLLYNE THERASSE, NP',
  WESTC0000: 'WESTCARE MEDICAL ASSOCIATES',
  WESTH0000: 'CAROLYN WESTHOFF, MD',
  WICZY0000: 'HALINA WICZYK, MD',
  WIDOF0000: 'JULIET WIDOFF, MD',
  WILLI0000: 'CARLA WILLIAMS, MD',
  WILSO0000: 'ANGELA WILSON, MD',
  WIRTH0000: 'JOHN WIRTH, MD',
  WOLF0000: 'SUSAN WOLF, MD',
  WONG0000: 'LILY WONG, MD',
  WONG0001: 'SOMAN MARY WONG, MD',
  WONG0002: 'RAYMOND WONG, MD',
  WONG0003: 'SAMUEL WONG',
  WONG0004: 'YOKE WONG, MD',
  WONG0005: 'SAMUEL WONG, MD',
  WONG0006: 'SARAH WONG, MD',
  WONG0007: 'PETER WONG, MD',
  WONG0008: 'LILY WONG, MD',
  WONG0009: 'DANIEL WONG, MD',
  WONG0010: 'JEREMY WONG, MD',
  WOO0000: 'PHYLLIS WOO, MD',
  WORRE0000: 'HELAINE WORRELL, MD',
  WORTH: 'JACQUELINE WORTH, MD',
  WU0000: 'JENNIFER WU, MD',
  WU0001: 'SOPHIA WU, MD',
  WU0002: 'BENJAMIN WU, MD',
  XIAO0000: 'HUIFANG XIAO',
  XIAOY0001: 'ZHAO XIAOYUAN, MD',
  YAN0000: 'WEIHONG YAN, MD FACOG',
  YAN0001: 'TINA YAN, CDN',
  YANG0000: 'SUZANNE YANG, MD',
  YERET0000: 'ELISHEVA YERET, CM',
  YIH0000: 'PEGGY YIH, MD',
  YIN0000: 'XIAOQIN SARAH YIN, MD',
  YODFA0000: 'EDAN YODFAT, MD',
  YONG0000: 'YU YONG, MD',
  YOON0000: 'JEANNIE YOON',
  YU0000: 'SARAH YU, MD',
  YU0001: 'JEFFREY YU, MD',
  YUE0000: 'GUIXIANG (CHARLES) YUE',
  YUN0000: 'SUN YUN, MD',
  ZAFAR0000: 'MONAA ZAFAR, MD',
  ZAFRA0000: 'KATHLEEN ZAFRA, MD',
  ZEITOUN00: 'Khaled Zeitoun',
  ZENG0000: 'MING HEALTH',
  ZENG0001: 'MING ZENG, MD',
  ZEVAL0000: 'MICHELLE ZELLAGOS-RAMOS, NP',
  ZHANG0000: 'XUEBIN YIN, MD',
  ZHANG0001: 'MARY ZHANG, LAC',
  ZHENG0000: 'GUOPING ZHENG',
  ZHENG0001: 'LI ZHENG, MD',
  ZHUO0000: 'YING ZHUO, MD',
  ZIMME0000: 'RALF ZIMMERMANN, MD',
  ZOCDOC: 'ZOCDOC',
  ZUKIN0000: 'ZUKIN, MD',
  ZUO0002: 'HAILIU ZUO, MD',
};

function formatPhoneNumber(phoneNumberString) {
  try {
    if (phoneNumberString.substring(0, 2) === '+1') {
      return `(${phoneNumberString.substring(3, 6)}) ${phoneNumberString.substring(
        7,
        10,
      )}-${phoneNumberString.substring(11, 15)}`;
    }
    return phoneNumberString.replace(/\s/g, '').substring(1, 11);
  } catch (err) {
    return '';
  }
}

function dateDiff(first, second) {
  return Math.abs(Math.round((second - first) / (1000 * 60 * 60 * 24)));
}

function formatDate(date) {
  try {
    let month = `${date.getMonth() + 1}`;
    let day = `${date.getDate()}`;
    const year = date.getFullYear();

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;

    return [year, month, day].join('-');
  } catch (err) {
    return null;
  }
}

function formatUTCDate(date) {
  try {
    let month = `${date.getUTCMonth() + 1}`;
    let day = `${date.getUTCDate()}`;
    const year = date.getUTCFullYear();

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;

    return [year, month, day].join('-');
  } catch (err) {
    return null;
  }
}

function formatUTCDatetime(date) {
  try {
    let month = `${date.getUTCMonth() + 1}`;
    let day = `${date.getUTCDate()}`;
    const year = date.getUTCFullYear();
    let hour = `${date.getUTCHours()}`;
    let min = `${date.getUTCMinutes()}`;
    let second = `${date.getUTCSeconds()}`;

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;
    if (hour.length < 2) hour = `0${hour}`;
    if (min.length < 2) min = `0${min}`;
    if (second.length < 2) second = `0${second}`;

    return `${[year, month, day].join('-')}T${[hour, min, second].join(':')}Z`;
  } catch (err) {
    return null;
  }
}

function getUTCTimeRangeByCalenderMonth(dateObj) {
  const fullYear = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const startDate = new Date(fullYear, month, 1, 0, 0, 0);
  const endDate = new Date(fullYear, month + 1, 0, 23, 59, 59);
  const startUTCDateString = formatUTCDatetime(startDate);
  const endUTCDateString = formatUTCDatetime(endDate);
  return [startUTCDateString, endUTCDateString];
}

function getLocalTimeRangeByCalenderMonth(dateObj) {
  const fullYear = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const startDate = new Date(fullYear, month, 1, 0, 0, 0);
  const endDate = new Date(fullYear, month + 1, 0, 23, 59, 59);
  const startUTCDateString = formatDate(startDate);
  const endUTCDateString = formatDate(endDate);
  return [startUTCDateString, endUTCDateString];
}

function getTodayInNextYear(dateObj) {
  const fullYear = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDay();
  const nextYearDate = new Date(fullYear + 1, month, day, 0, 0, 0);
  const nextYearDateString = formatDate(nextYearDate);
  return nextYearDateString;
}

function newMysqlInstance() {
  return new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
      host: process.env.MYSQL_SERVER,
      dialect: 'mysql',
    },
  );
}

function processDate(dateArray) {
  const values = dateArray.map((dateString) => new Date(`${dateString}`));
  return values;
}

function utcMonth(dateArray) {
  return new dfd.Series(dateArray.map((date) => date.getUTCMonth()));
}

function utcMonthName(dateArray) {
  return new dfd.Series(dateArray.map((date) => MONTH_NAME[date.getUTCMonth()]));
}

function utcYear(dateArray) {
  return new dfd.Series(dateArray.map((date) => date.getUTCFullYear()));
}

function sortWithIndices(toSort) {
  for (let i = 0; i < toSort.length; i += 1) {
    toSort[i] = [toSort[i], i];
  }
  toSort.sort((left, right) => {
    return left[0] < right[0] ? -1 : 1;
  });
  toSort.sortIndices = [];
  for (let j = 0; j < toSort.length; j += 1) {
    toSort.sortIndices.push(toSort[j][1]);
    toSort[j] = toSort[j][0];
  }
  return toSort;
}

function reorderCalendarMonths(myArray) {
  const integerArray = [];
  myArray.forEach((dateStr) => {
    const monthNum = monthNameIndex.get(dateStr.slice(0, 3));
    const yearNum = parseInt(dateStr.slice(3)) * 100;
    integerArray.push(yearNum + monthNum);
  });
  sortWithIndices(integerArray);
  return integerArray.sortIndices;
}

function convertIntegerToCapLetter(myInt) {
  const remainder = myInt % 26;
  const quotient = myInt / 26 >> 0; //eslint-disable-line
  if (quotient === 0) {
    return (remainder + 9).toString(36).toUpperCase();
  }
  if (remainder === 0) {
    return (quotient + 9).toString(36).toUpperCase() + (26 + 9).toString(36).toUpperCase();
  }
  return (quotient + 9).toString(36).toUpperCase() + (remainder + 9).toString(36).toUpperCase();
}

async function filterDataByColumn(twoDArray, myCol, mode, threshold) {
  try {
    // const tensor_arr = tf.tensor2d(twoDArray.slice(1));
    // const df = new dfd.DataFrame(tensor_arr, { columns: twoDArray[0] });
    // console.log(twoDArray.slice(1));
    // console.log(twoDArray[0]);
    const df = new dfd.DataFrame(twoDArray.slice(1), { columns: twoDArray[0] });

    let dummy;
    if (typeof threshold === 'string') {
      dummy = 'N';
    } else {
      dummy = 0;
    }
    df.fillNa([dummy], { columns: [myCol], inplace: true });
    // df.print();
    if (typeof threshold === 'number' && mode === 'gt') {
      return df.loc({ rows: df.column(myCol).gt(threshold) });
    }

    if (typeof threshold === 'number' && mode === 'le') {
      return df.loc({ rows: df.column(myCol).le(threshold) });
    }

    if (typeof threshold === 'string' && mode === 'full') {
      return df.loc({ rows: df.column(myCol).eq(threshold) });
    }
    return null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function statDataByTime(df, myCol, interval) {
  // console.log(myCol);
  // df.sort_values({ by: myCol, inplace: true });
  // console.log(df[myCol].values);
  const dt = processDate(df[myCol].values);
  // dt.month_name().print();
  // df.addColumn({ column: 'year', values: dt.year().astype('string').values, inplace: true });
  // df.addColumn({ column: 'month', values: dt.month_name().values, inplace: true });
  df.addColumn('year', utcYear(dt).asType('string').values, { inplace: true });
  df.addColumn('month', utcMonthName(dt).values, { inplace: true });
  // df.sortValues(myCol, { inplace: true });
  // df.print();
  if (interval === 'monthly') {
    // const grp = df.groupby(['year', 'month']);
    // df.groupby(['year', 'month']).col(['year']).count().print();
    return df.groupby(['year', 'month']).col(['year']).count();
  }
  // const grp = df.groupby(['year', 'month']);
  // df.groupby(['year', 'month']).col(['year']).count().print();
  return df.groupby(['year']).col(['year']).count();
}

async function pruneDataByDate(df, myCol, targetDateObj) {
  // console.log(myCol);
  // df.sort_values({ by: myCol, inplace: true });
  // console.log(df[myCol].values);
  const targetYear = targetDateObj.getUTCFullYear();
  const targetMonth = targetDateObj.getUTCMonth();
  // console.log([targetYear, targetMonth]);

  const dt = processDate(df.column(myCol).values);
  // console.log(dt);
  // dt.month_name().print();
  // df.addColumn({ column: 'year', values: dt.year().astype('string').values, inplace: true });
  // df.addColumn({ column: 'month', values: dt.month_name().values, inplace: true });
  df.addColumn('year', utcYear(dt).asType('int32').values, { inplace: true });
  df.addColumn('month', utcMonth(dt).asType('int32').values, { inplace: true });
  // df.sort_values({ by: myCol, inplace: true });
  // df.loc({
  //   rows: df.column('year').eq(targetYear).and(df.column('month').eq(targetMonth)),
  // }).print();
  // df.loc({ rows: df.column('month').eq(targetMonth) }).print();
  // df.loc({ rows: df.column('year').eq(targetYear) })
  //   .loc({ rows: df.column('month').eq(targetMonth) })
  //   .print();
  return df.loc({
    rows: df.column('year').eq(targetYear).and(df.column('month').eq(targetMonth)),
  });
}

async function organizeCalendlyFullModeData(twoDArray, dateObj) {
  let returnArray = [];
  const df = new dfd.DataFrame(twoDArray.slice(1), { columns: twoDArray[0] });
  const pruneDataFrame = await pruneDataByDate(df, 'Created_Date', dateObj);
  // console.log(pruneDataFrame.values);
  if (pruneDataFrame.values.length !== 0) {
    returnArray = pruneDataFrame.loc({ columns: twoDArray[0] }).values;
    returnArray.unshift(twoDArray[0]);
  } else {
    returnArray.push(twoDArray[0]);
  }

  const bookedDateCountDf = await statDataByTime(df, 'Booked_Date', 'monthly');
  bookedDateCountDf.rename({ year_count: 'Group_by_Booked_Date_count' }, { inplace: true });
  const createdDateCountDf = await statDataByTime(df, 'Created_Date', 'monthly');
  createdDateCountDf.rename({ year_count: 'Group_by_Created_Date_count' }, { inplace: true });

  const innerJoinDf = dfd.merge({
    left: bookedDateCountDf,
    right: createdDateCountDf,
    on: ['year', 'month'],
    how: 'outer',
  });

  innerJoinDf.addColumn(
    'month+year',
    innerJoinDf.month.str.concat(innerJoinDf.year.asType('string').values, 1).values,
    { inplace: true },
  );

  // innerJoinDf.print();
  const returnChartArray = innerJoinDf.loc({
    columns: ['month+year', 'Group_by_Created_Date_count', 'Group_by_Booked_Date_count'],
  }).values;

  const indexArray = reorderCalendarMonths(innerJoinDf['month+year'].values);
  // console.log(indexArray);

  const sortedReturnChartArray = indexArray.map((i) => returnChartArray[i]);
  sortedReturnChartArray.unshift([
    'month+year',
    'Group_by_Created_Date_count',
    'Group_by_Booked_Date_count',
  ]);
  return [returnArray, sortedReturnChartArray];
}

async function organizeIovR1DataForChart(twodArray, interval) {
  const iovDf = await filterDataByColumn(twodArray, 'Latest_IOV_Appt_Status', 'full', 'Completed');
  const iovCountDf = await statDataByTime(iovDf, 'Latest_IOV_Appt_Date', 'monthly');
  iovCountDf.rename({ year_count: 'IOV_count' }, { inplace: true });

  const R1Df = await filterDataByColumn(twodArray, 'R1_Appt_Status', 'full', 'Completed');
  const R1CountDf = await statDataByTime(R1Df, 'R1_Appt_Date', 'monthly');
  R1CountDf.rename({ year_count: 'R1_count' }, { inplace: true });

  const ivfR1Df = await filterDataByColumn(twodArray, 'IVF_R1', 'full', 'Y');
  const ivfR1CountDf = await statDataByTime(ivfR1Df, 'IVF_Start_Date', 'monthly');
  ivfR1CountDf.rename({ year_count: 'IVF_R1_count' }, { inplace: true });

  const innerJoinDfA = dfd.merge({
    left: iovCountDf,
    right: R1CountDf,
    on: ['year', 'month'],
    how: 'inner',
  });

  const innerJoinDfB = dfd.merge({
    left: iovCountDf,
    right: ivfR1CountDf,
    on: ['year', 'month'],
    how: 'inner',
  });

  // innerJoinDf.print();
  innerJoinDfA.addColumn(
    'month+year',
    innerJoinDfA.month.str.concat(innerJoinDfA.year.asType('string').values, 1).values,
    { inplace: true },
  );
  innerJoinDfA.addColumn('IVF_R1_count', innerJoinDfB.IVF_R1_count.values, { inplace: true });
  // innerJoinDf.print();
  const returnArray = innerJoinDfA.loc({
    columns: ['month+year', 'IOV_count', 'R1_count', 'IVF_R1_count'],
  }).values;

  const indexArray = reorderCalendarMonths(innerJoinDfA['month+year'].values);
  // console.log(indexArray);

  const sortedReturnArray = indexArray.map((i) => returnArray[i]);
  sortedReturnArray.unshift(['month+year', 'IOV_count', 'R1_count', 'IVF_R1_count']);
  return sortedReturnArray;
}

async function sendEmail(senderObj, toEmailAddress, subject, content, htmlMode) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: senderObj.email,
      clientId: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_CLIENTSECRET,
      refreshToken: senderObj.googleRefreshToken,
      accessToken: senderObj.googleAccessToken,
    },
  });

  const mail = {
    from: senderObj.email,
    to: toEmailAddress,
    subject,
  };
  if (htmlMode === true) {
    mail.html = content;
  } else {
    mail.text = content;
  }

  transporter.sendMail(mail, (err, info) => {
    if (err) {
      console.log(err);
      return null;
    }
    // see https://nodemailer.com/usage
    // console.log(`info.messageId: ${info.messageId}`);
    // console.log(`info.envelope: ${info.envelope}`);
    // console.log(`info.accepted: ${info.accepted}`);
    // console.log(`info.rejected: ${info.rejected}`);
    // console.log(`info.pending: ${info.pending}`);
    // console.log(`info.response: ${info.response}`);
    // console.log(info);

    return info;
    // transporter.close();
  });
}

function getState(zipString) {
  /* Ensure param is a string to prevent unpredictable parsing results */
  if (typeof zipString !== 'string') {
    // console.log('Must pass the zipcode as a string.');
    return null;
  }

  /* Ensure we have exactly 5 characters to parse */
  if (zipString.length !== 5) {
    // console.log('Must pass a 5-digit zipcode.');
    return null;
  }

  /* Ensure we don't parse strings starting with 0 as octal values */
  const zipcode = parseInt(zipString, 10);

  let st;
  let state;

  /* Code cases alphabetized by state */
  if (zipcode >= 35000 && zipcode <= 36999) {
    st = 'AL';
    state = 'Alabama';
  } else if (zipcode >= 99500 && zipcode <= 99999) {
    st = 'AK';
    state = 'Alaska';
  } else if (zipcode >= 85000 && zipcode <= 86999) {
    st = 'AZ';
    state = 'Arizona';
  } else if (zipcode >= 71600 && zipcode <= 72999) {
    st = 'AR';
    state = 'Arkansas';
  } else if (zipcode >= 90000 && zipcode <= 96699) {
    st = 'CA';
    state = 'California';
  } else if (zipcode >= 80000 && zipcode <= 81999) {
    st = 'CO';
    state = 'Colorado';
  } else if ((zipcode >= 6000 && zipcode <= 6389) || (zipcode >= 6391 && zipcode <= 6999)) {
    st = 'CT';
    state = 'Connecticut';
  } else if (zipcode >= 19700 && zipcode <= 19999) {
    st = 'DE';
    state = 'Delaware';
  } else if (zipcode >= 32000 && zipcode <= 34999) {
    st = 'FL';
    state = 'Florida';
  } else if ((zipcode >= 30000 && zipcode <= 31999) || (zipcode >= 39800 && zipcode <= 39999)) {
    st = 'GA';
    state = 'Georgia';
  } else if (zipcode >= 96700 && zipcode <= 96999) {
    st = 'HI';
    state = 'Hawaii';
  } else if (zipcode >= 83200 && zipcode <= 83999) {
    st = 'ID';
    state = 'Idaho';
  } else if (zipcode >= 60000 && zipcode <= 62999) {
    st = 'IL';
    state = 'Illinois';
  } else if (zipcode >= 46000 && zipcode <= 47999) {
    st = 'IN';
    state = 'Indiana';
  } else if (zipcode >= 50000 && zipcode <= 52999) {
    st = 'IA';
    state = 'Iowa';
  } else if (zipcode >= 66000 && zipcode <= 67999) {
    st = 'KS';
    state = 'Kansas';
  } else if (zipcode >= 40000 && zipcode <= 42999) {
    st = 'KY';
    state = 'Kentucky';
  } else if (zipcode >= 70000 && zipcode <= 71599) {
    st = 'LA';
    state = 'Louisiana';
  } else if (zipcode >= 3900 && zipcode <= 4999) {
    st = 'ME';
    state = 'Maine';
  } else if (zipcode >= 20600 && zipcode <= 21999) {
    st = 'MD';
    state = 'Maryland';
  } else if ((zipcode >= 1000 && zipcode <= 2799) || zipcode === 5501 || zipcode === 5544) {
    st = 'MA';
    state = 'Massachusetts';
  } else if (zipcode >= 48000 && zipcode <= 49999) {
    st = 'MI';
    state = 'Michigan';
  } else if (zipcode >= 55000 && zipcode <= 56899) {
    st = 'MN';
    state = 'Minnesota';
  } else if (zipcode >= 38600 && zipcode <= 39999) {
    st = 'MS';
    state = 'Mississippi';
  } else if (zipcode >= 63000 && zipcode <= 65999) {
    st = 'MO';
    state = 'Missouri';
  } else if (zipcode >= 59000 && zipcode <= 59999) {
    st = 'MT';
    state = 'Montana';
  } else if (zipcode >= 27000 && zipcode <= 28999) {
    st = 'NC';
    state = 'North Carolina';
  } else if (zipcode >= 58000 && zipcode <= 58999) {
    st = 'ND';
    state = 'North Dakota';
  } else if (zipcode >= 68000 && zipcode <= 69999) {
    st = 'NE';
    state = 'Nebraska';
  } else if (zipcode >= 88900 && zipcode <= 89999) {
    st = 'NV';
    state = 'Nevada';
  } else if (zipcode >= 3000 && zipcode <= 3899) {
    st = 'NH';
    state = 'New Hampshire';
  } else if (zipcode >= 7000 && zipcode <= 8999) {
    st = 'NJ';
    state = 'New Jersey';
  } else if (zipcode >= 87000 && zipcode <= 88499) {
    st = 'NM';
    state = 'New Mexico';
  } else if (
    (zipcode >= 10000 && zipcode <= 14999) ||
    zipcode === 6390 ||
    zipcode === 501 ||
    zipcode === 544
  ) {
    st = 'NY';
    state = 'New York';
  } else if (zipcode >= 43000 && zipcode <= 45999) {
    st = 'OH';
    state = 'Ohio';
  } else if ((zipcode >= 73000 && zipcode <= 73199) || (zipcode >= 73400 && zipcode <= 74999)) {
    st = 'OK';
    state = 'Oklahoma';
  } else if (zipcode >= 97000 && zipcode <= 97999) {
    st = 'OR';
    state = 'Oregon';
  } else if (zipcode >= 15000 && zipcode <= 19699) {
    st = 'PA';
    state = 'Pennsylvania';
  } else if (zipcode >= 300 && zipcode <= 999) {
    st = 'PR';
    state = 'Puerto Rico';
  } else if (zipcode >= 2800 && zipcode <= 2999) {
    st = 'RI';
    state = 'Rhode Island';
  } else if (zipcode >= 29000 && zipcode <= 29999) {
    st = 'SC';
    state = 'South Carolina';
  } else if (zipcode >= 57000 && zipcode <= 57999) {
    st = 'SD';
    state = 'South Dakota';
  } else if (zipcode >= 37000 && zipcode <= 38599) {
    st = 'TN';
    state = 'Tennessee';
  } else if (
    (zipcode >= 75000 && zipcode <= 79999) ||
    (zipcode >= 73301 && zipcode <= 73399) ||
    (zipcode >= 88500 && zipcode <= 88599)
  ) {
    st = 'TX';
    state = 'Texas';
  } else if (zipcode >= 84000 && zipcode <= 84999) {
    st = 'UT';
    state = 'Utah';
  } else if (zipcode >= 5000 && zipcode <= 5999) {
    st = 'VT';
    state = 'Vermont';
  } else if (
    (zipcode >= 20100 && zipcode <= 20199) ||
    (zipcode >= 22000 && zipcode <= 24699) ||
    zipcode === 20598
  ) {
    st = 'VA';
    state = 'Virginia';
  } else if (
    (zipcode >= 20000 && zipcode <= 20099) ||
    (zipcode >= 20200 && zipcode <= 20599) ||
    (zipcode >= 56900 && zipcode <= 56999)
  ) {
    st = 'DC';
    state = 'Washington DC';
  } else if (zipcode >= 98000 && zipcode <= 99499) {
    st = 'WA';
    state = 'Washington';
  } else if (zipcode >= 24700 && zipcode <= 26999) {
    st = 'WV';
    state = 'West Virginia';
  } else if (zipcode >= 53000 && zipcode <= 54999) {
    st = 'WI';
    state = 'Wisconsin';
  } else if (zipcode >= 82000 && zipcode <= 83199) {
    st = 'WY';
    state = 'Wyoming';
  } else {
    st = null;
    state = null;
    // console.log('No state found matching', zipcode);
  }

  return st;
}

module.exports = {
  convertIntegerToCapLetter,
  organizeIovR1DataForChart,
  newMysqlInstance,
  sendEmail,
  getUTCTimeRangeByCalenderMonth,
  getLocalTimeRangeByCalenderMonth,
  formatDate,
  formatUTCDate,
  formatPhoneNumber,
  getState,
  getTodayInNextYear,
  organizeCalendlyFullModeData,
  dateDiff,
  iovR1MainTable,
  iovR1MonitorTable,
  iovR1ERTable,
  iovR1TransferTable,
  r1CodeList,
  APPOINTMENT_CODE_MAP,
  APPOINTMENT_CODE_MAP_REV,
  columnTitleList,
  referringPhysicianCode,
};
