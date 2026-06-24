---
theme: default
title: Analisis Getaran Berbasis Fourier Transform
titleTemplate: '%s — Getaran Mekanik'
info: |
  ## Analisis Getaran Berbasis Fourier Transform
  Materi Kuliah Getaran Mekanik — S1 Teknik Mesin
  Universitas Mercu Buana
author: Dedik Romahadi
colorSchema: dark
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
transition: slide-left
mdc: true
fonts:
  sans: 'Inter'
  mono: 'Fira Code'
layout: none
---

<div class="cover" style="background:#080e1a;position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden;color:#f1f5f9;">

  <div class="wave-track">
    <svg viewBox="0 0 2880 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,40.0 C2.5,38.9 10.0,35.1 15,33.6 C20.0,32.1 25.0,30.9 30,30.8 C35.0,30.7 40.0,31.8 45,32.8 C50.0,33.8 55.0,35.5 60,36.7 C65.0,37.9 70.0,38.8 75,40.0 C80.0,41.2 85.0,42.2 90,43.7 C95.0,45.2 100.0,47.4 105,48.9 C110.0,50.4 115.0,52.5 120,52.7 C125.0,52.9 130.0,52.1 135,50.0 C140.0,47.9 145.0,43.5 150,40.0 C155.0,36.5 160.0,31.8 165,29.3 C170.0,26.9 175.0,25.4 180,25.3 C185.0,25.2 190.0,27.3 195,28.9 C200.0,30.5 205.0,33.1 210,35.0 C215.0,36.9 220.0,38.3 225,40.0 C230.0,41.7 235.0,43.2 240,45.2 C245.0,47.2 250.0,50.2 255,52.1 C260.0,54.0 265.0,56.7 270,56.8 C275.0,56.9 280.0,55.6 285,52.8 C290.0,50.0 295.0,44.3 300,40.0 C305.0,35.7 310.0,29.8 315,26.9 C320.0,24.0 325.0,22.5 330,22.5 C335.0,22.5 340.0,25.1 345,27.1 C350.0,29.1 355.0,32.2 360,34.4 C365.0,36.5 370.0,38.1 375,40.0 C380.0,41.9 385.0,43.5 390,45.6 C395.0,47.7 400.0,50.8 405,52.7 C410.0,54.6 415.0,57.2 420,57.2 C425.0,57.2 430.0,55.7 435,52.8 C440.0,49.9 445.0,44.2 450,40.0 C455.0,35.8 460.0,30.2 465,27.5 C470.0,24.8 475.0,23.6 480,23.7 C485.0,23.8 490.0,26.4 495,28.3 C500.0,30.2 505.0,33.0 510,35.0 C515.0,37.0 520.0,38.4 525,40.0 C530.0,41.6 535.0,43.0 540,44.7 C545.0,46.5 550.0,49.0 555,50.5 C560.0,52.0 565.0,53.9 570,53.8 C575.0,53.7 580.0,52.3 585,50.0 C590.0,47.7 595.0,43.2 600,40.0 C605.0,36.8 610.0,32.7 615,30.8 C620.0,28.9 625.0,28.2 630,28.4 C635.0,28.6 640.0,30.5 645,31.9 C650.0,33.3 655.0,35.4 660,36.7 C665.0,38.1 670.0,39.0 675,40.0 C680.0,41.0 685.0,41.9 690,42.9 C695.0,43.9 700.0,45.5 705,46.3 C710.0,47.1 715.0,47.9 720,47.9 C725.0,47.9 730.0,47.7 735,46.4 C740.0,45.1 745.0,42.3 750,40.0 C755.0,37.7 760.0,34.3 765,32.6 C770.0,30.9 775.0,29.7 780,29.6 C785.0,29.5 790.0,30.8 795,31.9 C800.0,33.0 805.0,34.9 810,36.3 C815.0,37.6 820.0,38.7 825,40.0 C830.0,41.3 835.0,42.5 840,44.1 C845.0,45.7 850.0,48.1 855,49.7 C860.0,51.3 865.0,53.6 870,53.8 C875.0,54.0 880.0,53.0 885,50.7 C890.0,48.4 895.0,43.7 900,40.0 C905.0,36.3 910.0,31.2 915,28.6 C920.0,26.0 925.0,24.4 930,24.4 C935.0,24.3 940.0,26.6 945,28.3 C950.0,30.0 955.0,32.8 960,34.8 C965.0,36.8 970.0,38.2 975,40.0 C980.0,41.8 985.0,43.3 990,45.4 C995.0,47.5 1000.0,50.5 1005,52.5 C1010.0,54.5 1015.0,57.1 1020,57.2 C1025.0,57.3 1030.0,56.0 1035,53.1 C1040.0,50.2 1045.0,44.4 1050,40.0 C1055.0,35.6 1060.0,29.7 1065,26.8 C1070.0,23.9 1075.0,22.3 1080,22.4 C1085.0,22.4 1090.0,25.1 1095,27.1 C1100.0,29.1 1105.0,32.2 1110,34.4 C1115.0,36.5 1120.0,38.1 1125,40.0 C1130.0,41.9 1135.0,43.4 1140,45.5 C1145.0,47.6 1150.0,50.6 1155,52.5 C1160.0,54.4 1165.0,56.8 1170,56.8 C1175.0,56.8 1180.0,55.3 1185,52.5 C1190.0,49.7 1195.0,44.1 1200,40.0 C1205.0,35.9 1210.0,30.6 1215,28.0 C1220.0,25.4 1225.0,24.2 1230,24.4 C1235.0,24.5 1240.0,27.1 1245,28.9 C1250.0,30.7 1255.0,33.4 1260,35.3 C1265.0,37.1 1270.0,38.5 1275,40.0 C1280.0,41.5 1285.0,42.8 1290,44.4 C1295.0,46.0 1300.0,48.3 1305,49.7 C1310.0,51.1 1315.0,52.8 1320,52.7 C1325.0,52.6 1330.0,51.3 1335,49.2 C1340.0,47.1 1345.0,42.9 1350,40.0 C1355.0,37.1 1360.0,33.4 1365,31.7 C1370.0,30.0 1375.0,29.4 1380,29.6 C1385.0,29.8 1390.0,31.5 1395,32.8 C1400.0,34.0 1405.0,35.9 1410,37.1 C1415.0,38.3 1420.0,39.1 1425,40.0 C1430.0,40.9 1435.0,41.5 1440,42.5 C1445.0,43.5 1450.0,45.2 1455,46.3 C1460.0,47.4 1465.0,49.0 1470,49.2 C1475.0,49.4 1480.0,48.9 1485,47.4 C1490.0,45.9 1495.0,42.6 1500,40.0 C1505.0,37.4 1510.0,33.6 1515,31.7 C1520.0,29.8 1525.0,28.5 1530,28.4 C1535.0,28.3 1540.0,29.9 1545,31.1 C1550.0,32.4 1555.0,34.4 1560,35.9 C1565.0,37.4 1570.0,38.6 1575,40.0 C1580.0,41.4 1585.0,42.6 1590,44.4 C1595.0,46.1 1600.0,48.8 1605,50.5 C1610.0,52.2 1615.0,54.6 1620,54.7 C1625.0,54.9 1630.0,53.9 1635,51.4 C1640.0,48.9 1645.0,43.9 1650,40.0 C1655.0,36.1 1660.0,30.7 1665,28.0 C1670.0,25.3 1675.0,23.7 1680,23.7 C1685.0,23.7 1690.0,26.1 1695,27.9 C1700.0,29.7 1705.0,32.6 1710,34.6 C1715.0,36.6 1720.0,38.2 1725,40.0 C1730.0,41.8 1735.0,43.4 1740,45.5 C1745.0,47.6 1750.0,50.7 1755,52.7 C1760.0,54.7 1765.0,57.4 1770,57.5 C1775.0,57.6 1780.0,56.1 1785,53.2 C1790.0,50.3 1795.0,44.4 1800,40.0 C1805.0,35.6 1810.0,29.7 1815,26.8 C1820.0,23.9 1825.0,22.4 1830,22.5 C1835.0,22.6 1840.0,25.3 1845,27.3 C1850.0,29.3 1855.0,32.4 1860,34.5 C1865.0,36.6 1870.0,38.2 1875,40.0 C1880.0,41.8 1885.0,43.4 1890,45.4 C1895.0,47.4 1900.0,50.3 1905,52.1 C1910.0,53.9 1915.0,56.3 1920,56.3 C1925.0,56.3 1930.0,54.7 1935,52.0 C1940.0,49.3 1945.0,43.9 1950,40.0 C1955.0,36.1 1960.0,31.1 1965,28.6 C1970.0,26.2 1975.0,25.2 1980,25.3 C1985.0,25.4 1990.0,27.8 1995,29.5 C2000.0,31.2 2005.0,33.9 2010,35.6 C2015.0,37.4 2020.0,38.6 2025,40.0 C2030.0,41.4 2035.0,42.6 2040,44.1 C2045.0,45.6 2050.0,47.6 2055,48.9 C2060.0,50.1 2065.0,51.7 2070,51.6 C2075.0,51.5 2080.0,50.2 2085,48.3 C2090.0,46.4 2095.0,42.6 2100,40.0 C2105.0,37.4 2110.0,34.1 2115,32.6 C2120.0,31.1 2125.0,30.6 2130,30.8 C2135.0,31.0 2140.0,32.6 2145,33.7 C2150.0,34.8 2155.0,36.5 2160,37.5 C2165.0,38.5 2170.0,39.1 2175,40.0 C2180.0,40.9 2185.0,41.7 2190,42.9 C2195.0,44.1 2200.0,46.0 2205,47.2 C2210.0,48.5 2215.0,50.2 2220,50.4 C2225.0,50.6 2230.0,50.0 2235,48.3 C2240.0,46.6 2245.0,42.9 2250,40.0 C2255.0,37.1 2260.0,32.9 2265,30.8 C2270.0,28.7 2275.0,27.4 2280,27.3 C2285.0,27.2 2290.0,28.9 2295,30.3 C2300.0,31.7 2305.0,34.0 2310,35.6 C2315.0,37.2 2320.0,38.5 2325,40.0 C2330.0,41.5 2335.0,42.9 2340,44.7 C2345.0,46.6 2350.0,49.3 2355,51.1 C2360.0,52.9 2365.0,55.5 2370,55.6 C2375.0,55.8 2380.0,54.6 2385,52.0 C2390.0,49.4 2395.0,44.1 2400,40.0 C2405.0,35.9 2410.0,30.3 2415,27.5 C2420.0,24.7 2425.0,23.2 2430,23.2 C2435.0,23.2 2440.0,25.6 2445,27.5 C2450.0,29.4 2455.0,32.4 2460,34.5 C2465.0,36.6 2470.0,38.1 2475,40.0 C2480.0,41.9 2485.0,43.5 2490,45.6 C2495.0,47.8 2500.0,50.9 2505,52.9 C2510.0,54.9 2515.0,57.5 2520,57.6 C2525.0,57.7 2530.0,56.1 2535,53.2 C2540.0,50.3 2545.0,44.4 2550,40.0 C2555.0,35.6 2560.0,29.8 2565,26.9 C2570.0,24.0 2575.0,22.7 2580,22.8 C2585.0,22.9 2590.0,25.5 2595,27.5 C2600.0,29.5 2605.0,32.5 2610,34.6 C2615.0,36.7 2620.0,38.2 2625,40.0 C2630.0,41.8 2635.0,43.2 2640,45.2 C2645.0,47.2 2650.0,50.0 2655,51.7 C2660.0,53.4 2665.0,55.7 2670,55.6 C2675.0,55.5 2680.0,54.0 2685,51.4 C2690.0,48.8 2695.0,43.7 2700,40.0 C2705.0,36.3 2710.0,31.6 2715,29.3 C2720.0,27.0 2725.0,26.0 2730,26.2 C2735.0,26.4 2740.0,28.7 2745,30.3 C2750.0,31.9 2755.0,34.3 2760,35.9 C2765.0,37.5 2770.0,38.7 2775,40.0 C2780.0,41.3 2785.0,42.4 2790,43.7 C2795.0,45.1 2800.0,47.0 2805,48.1 C2810.0,49.2 2815.0,50.5 2820,50.4 C2825.0,50.3 2830.0,49.1 2835,47.4 C2840.0,45.7 2845.0,42.3 2850,40.0 C2855.0,37.7 2860.0,34.9 2865,33.6 C2870.0,32.3 2877.5,32.4 2880,32.1" fill="none" stroke="rgba(0,229,255,0.45)" stroke-width="1.6"/>
    </svg>
  </div>
  <div class="wave-track w2">
    <svg viewBox="0 0 2880 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,34.4 C3.0,34.4 12.0,34.1 18,34.5 C24.0,34.9 30.0,35.9 36,36.7 C42.0,37.5 48.0,38.5 54,39.2 C60.0,40.0 66.0,40.5 72,41.2 C78.0,41.9 84.0,42.4 90,43.2 C96.0,44.0 102.0,45.0 108,45.8 C114.0,46.5 120.0,47.5 126,47.7 C132.0,47.9 138.0,47.8 144,46.8 C150.0,45.8 156.0,43.8 162,41.8 C168.0,39.8 174.0,36.8 180,34.9 C186.0,33.0 192.0,31.0 198,30.2 C204.0,29.4 210.0,29.7 216,30.3 C222.0,30.9 228.0,32.6 234,34.0 C240.0,35.4 246.0,37.1 252,38.4 C258.0,39.7 264.0,40.6 270,41.6 C276.0,42.6 282.0,43.4 288,44.4 C294.0,45.4 300.0,46.8 306,47.8 C312.0,48.8 318.0,50.3 324,50.6 C330.0,50.9 336.0,50.8 342,49.6 C348.0,48.4 354.0,45.8 360,43.3 C366.0,40.8 372.0,36.9 378,34.4 C384.0,31.9 390.0,29.4 396,28.3 C402.0,27.2 408.0,27.3 414,28.0 C420.0,28.7 426.0,30.8 432,32.4 C438.0,34.0 444.0,36.1 450,37.6 C456.0,39.1 462.0,40.3 468,41.4 C474.0,42.5 480.0,43.3 486,44.4 C492.0,45.5 498.0,46.8 504,47.9 C510.0,49.0 516.0,50.4 522,50.8 C528.0,51.2 534.0,51.2 540,50.1 C546.0,49.0 552.0,46.5 558,44.1 C564.0,41.7 570.0,38.0 576,35.5 C582.0,33.0 588.0,30.4 594,29.3 C600.0,28.2 606.0,28.1 612,28.7 C618.0,29.2 624.0,31.1 630,32.6 C636.0,34.1 642.0,36.1 648,37.5 C654.0,38.9 660.0,39.9 666,40.9 C672.0,41.9 678.0,42.5 684,43.4 C690.0,44.3 696.0,45.3 702,46.1 C708.0,46.9 714.0,48.1 720,48.4 C726.0,48.7 732.0,48.8 738,48.0 C744.0,47.2 750.0,45.5 756,43.7 C762.0,42.0 768.0,39.3 774,37.5 C780.0,35.7 786.0,33.8 792,32.9 C798.0,32.0 804.0,31.9 810,32.2 C816.0,32.5 822.0,33.8 828,34.8 C834.0,35.8 840.0,37.2 846,38.1 C852.0,39.0 858.0,39.8 864,40.4 C870.0,41.0 876.0,41.3 882,41.8 C888.0,42.3 894.0,42.7 900,43.2 C906.0,43.8 912.0,44.7 918,45.1 C924.0,45.5 930.0,46.0 936,45.7 C942.0,45.4 948.0,44.6 954,43.4 C960.0,42.2 966.0,40.0 972,38.4 C978.0,36.8 984.0,34.7 990,33.6 C996.0,32.5 1002.0,31.7 1008,31.7 C1014.0,31.7 1020.0,32.7 1026,33.6 C1032.0,34.5 1038.0,36.0 1044,37.1 C1050.0,38.2 1056.0,39.3 1062,40.2 C1068.0,41.1 1074.0,41.7 1080,42.6 C1086.0,43.5 1092.0,44.4 1098,45.4 C1104.0,46.4 1110.0,47.8 1116,48.5 C1122.0,49.2 1128.0,49.9 1134,49.5 C1140.0,49.1 1146.0,47.8 1152,46.0 C1158.0,44.2 1164.0,41.0 1170,38.5 C1176.0,36.0 1182.0,32.8 1188,31.1 C1194.0,29.4 1200.0,28.3 1206,28.2 C1212.0,28.1 1218.0,29.4 1224,30.6 C1230.0,31.8 1236.0,34.1 1242,35.6 C1248.0,37.1 1254.0,38.7 1260,39.9 C1266.0,41.1 1272.0,41.9 1278,43.0 C1284.0,44.1 1290.0,45.1 1296,46.3 C1302.0,47.4 1308.0,49.1 1314,49.9 C1320.0,50.7 1326.0,51.7 1332,51.3 C1338.0,50.9 1344.0,49.6 1350,47.6 C1356.0,45.6 1362.0,42.1 1368,39.3 C1374.0,36.5 1380.0,33.0 1386,31.0 C1392.0,29.0 1398.0,27.6 1404,27.4 C1410.0,27.2 1416.0,28.5 1422,29.8 C1428.0,31.1 1434.0,33.4 1440,35.0 C1446.0,36.6 1452.0,38.2 1458,39.5 C1464.0,40.8 1470.0,41.6 1476,42.6 C1482.0,43.6 1488.0,44.5 1494,45.5 C1500.0,46.5 1506.0,48.0 1512,48.8 C1518.0,49.6 1524.0,50.5 1530,50.2 C1536.0,50.0 1542.0,48.9 1548,47.3 C1554.0,45.6 1560.0,42.6 1566,40.3 C1572.0,37.9 1578.0,34.9 1584,33.2 C1590.0,31.5 1596.0,30.2 1602,29.9 C1608.0,29.6 1614.0,30.6 1620,31.6 C1626.0,32.6 1632.0,34.4 1638,35.7 C1644.0,37.0 1650.0,38.3 1656,39.3 C1662.0,40.3 1668.0,41.0 1674,41.7 C1680.0,42.4 1686.0,42.9 1692,43.6 C1698.0,44.3 1704.0,45.2 1710,45.7 C1716.0,46.2 1722.0,46.8 1728,46.7 C1734.0,46.6 1740.0,45.9 1746,44.9 C1752.0,43.9 1758.0,42.1 1764,40.7 C1770.0,39.3 1776.0,37.5 1782,36.4 C1788.0,35.3 1794.0,34.7 1800,34.4 C1806.0,34.1 1812.0,34.1 1818,34.5 C1824.0,34.9 1830.0,35.9 1836,36.7 C1842.0,37.5 1848.0,38.5 1854,39.2 C1860.0,40.0 1866.0,40.5 1872,41.2 C1878.0,41.9 1884.0,42.4 1890,43.2 C1896.0,44.0 1902.0,45.0 1908,45.8 C1914.0,46.5 1920.0,47.5 1926,47.7 C1932.0,47.9 1938.0,47.8 1944,46.8 C1950.0,45.8 1956.0,43.8 1962,41.8 C1968.0,39.8 1974.0,36.8 1980,34.9 C1986.0,33.0 1992.0,31.0 1998,30.2 C2004.0,29.4 2010.0,29.7 2016,30.3 C2022.0,30.9 2028.0,32.6 2034,34.0 C2040.0,35.4 2046.0,37.1 2052,38.4 C2058.0,39.7 2064.0,40.6 2070,41.6 C2076.0,42.6 2082.0,43.4 2088,44.4 C2094.0,45.4 2100.0,46.8 2106,47.8 C2112.0,48.8 2118.0,50.3 2124,50.6 C2130.0,50.9 2136.0,50.8 2142,49.6 C2148.0,48.4 2154.0,45.8 2160,43.3 C2166.0,40.8 2172.0,36.9 2178,34.4 C2184.0,31.9 2190.0,29.4 2196,28.3 C2202.0,27.2 2208.0,27.3 2214,28.0 C2220.0,28.7 2226.0,30.8 2232,32.4 C2238.0,34.0 2244.0,36.1 2250,37.6 C2256.0,39.1 2262.0,40.3 2268,41.4 C2274.0,42.5 2280.0,43.3 2286,44.4 C2292.0,45.5 2298.0,46.8 2304,47.9 C2310.0,49.0 2316.0,50.4 2322,50.8 C2328.0,51.2 2334.0,51.2 2340,50.1 C2346.0,49.0 2352.0,46.5 2358,44.1 C2364.0,41.7 2370.0,38.0 2376,35.5 C2382.0,33.0 2388.0,30.4 2394,29.3 C2400.0,28.2 2406.0,28.1 2412,28.7 C2418.0,29.2 2424.0,31.1 2430,32.6 C2436.0,34.1 2442.0,36.1 2448,37.5 C2454.0,38.9 2460.0,39.9 2466,40.9 C2472.0,41.9 2478.0,42.5 2484,43.4 C2490.0,44.3 2496.0,45.3 2502,46.1 C2508.0,46.9 2514.0,48.1 2520,48.4 C2526.0,48.7 2532.0,48.8 2538,48.0 C2544.0,47.2 2550.0,45.5 2556,43.7 C2562.0,42.0 2568.0,39.3 2574,37.5 C2580.0,35.7 2586.0,33.8 2592,32.9 C2598.0,32.0 2604.0,31.9 2610,32.2 C2616.0,32.5 2622.0,33.8 2628,34.8 C2634.0,35.8 2640.0,37.2 2646,38.1 C2652.0,39.0 2658.0,39.8 2664,40.4 C2670.0,41.0 2676.0,41.3 2682,41.8 C2688.0,42.3 2694.0,42.7 2700,43.2 C2706.0,43.8 2712.0,44.7 2718,45.1 C2724.0,45.5 2730.0,46.0 2736,45.7 C2742.0,45.4 2748.0,44.6 2754,43.4 C2760.0,42.2 2766.0,40.0 2772,38.4 C2778.0,36.8 2784.0,34.7 2790,33.6 C2796.0,32.5 2802.0,31.7 2808,31.7 C2814.0,31.7 2820.0,32.7 2826,33.6 C2832.0,34.5 2838.0,36.0 2844,37.1 C2850.0,38.2 2856.0,39.3 2862,40.2 C2868.0,41.1 2877.0,42.2 2880,42.6" fill="none" stroke="rgba(167,139,250,0.25)" stroke-width="1.2"/>
    </svg>
  </div>
  <div class="wave-track w3">
    <svg viewBox="0 0 2880 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,34.3 C2.0,35.3 8.0,38.9 12,40.6 C16.0,42.4 20.0,43.5 24,44.8 C28.0,46.1 32.0,47.3 36,48.6 C40.0,49.9 44.0,52.0 48,52.4 C52.0,52.8 56.0,52.9 60,50.8 C64.0,48.7 68.0,43.8 72,39.6 C76.0,35.4 80.0,28.6 84,25.5 C88.0,22.4 92.0,20.2 96,20.7 C100.0,21.2 104.0,25.2 108,28.3 C112.0,31.4 116.0,36.3 120,39.4 C124.0,42.5 128.0,44.6 132,46.7 C136.0,48.8 140.0,50.3 144,52.1 C148.0,53.9 152.0,56.9 156,57.7 C160.0,58.5 164.0,59.3 168,56.8 C172.0,54.3 176.0,48.4 180,42.8 C184.0,37.2 188.0,27.9 192,23.2 C196.0,18.5 200.0,14.7 204,14.6 C208.0,14.5 212.0,19.1 216,22.9 C220.0,26.7 224.0,33.3 228,37.3 C232.0,41.3 236.0,44.3 240,46.9 C244.0,49.5 248.0,50.9 252,53.0 C256.0,55.1 260.0,58.2 264,59.3 C268.0,60.4 272.0,61.9 276,59.8 C280.0,57.6 284.0,52.1 288,46.4 C292.0,40.7 296.0,30.8 300,25.4 C304.0,20.0 308.0,14.9 312,14.1 C316.0,13.3 320.0,17.1 324,20.6 C328.0,24.1 332.0,31.0 336,35.1 C340.0,39.2 344.0,42.8 348,45.5 C352.0,48.2 356.0,49.3 360,51.2 C364.0,53.1 368.0,55.5 372,56.7 C376.0,57.9 380.0,59.6 384,58.2 C388.0,56.8 392.0,52.8 396,48.2 C400.0,43.6 404.0,35.3 408,30.5 C412.0,25.7 416.0,20.6 420,19.4 C424.0,18.1 428.0,20.5 432,23.0 C436.0,25.5 440.0,31.1 444,34.5 C448.0,37.9 452.0,40.9 456,43.1 C460.0,45.3 464.0,46.2 468,47.5 C472.0,48.8 476.0,50.2 480,51.1 C484.0,52.0 488.0,53.3 492,52.6 C496.0,51.9 500.0,49.8 504,47.0 C508.0,44.2 512.0,39.0 516,35.9 C520.0,32.8 524.0,29.2 528,28.1 C532.0,27.0 536.0,28.1 540,29.3 C544.0,30.5 548.0,33.1 552,35.1 C556.0,37.1 560.0,39.7 564,41.5 C568.0,43.3 572.0,44.3 576,45.7 C580.0,47.1 584.0,48.5 588,49.8 C592.0,51.1 596.0,53.4 600,53.4 C604.0,53.4 608.0,52.7 612,50.0 C616.0,47.3 620.0,41.5 624,37.0 C628.0,32.5 632.0,25.9 636,23.2 C640.0,20.5 644.0,19.5 648,20.6 C652.0,21.7 656.0,26.5 660,29.9 C664.0,33.3 668.0,38.0 672,41.0 C676.0,44.0 680.0,45.7 684,47.8 C688.0,49.9 692.0,51.6 696,53.4 C700.0,55.2 704.0,58.3 708,58.7 C712.0,59.1 716.0,58.9 720,55.7 C724.0,52.5 728.0,45.4 732,39.5 C736.0,33.6 740.0,24.5 744,20.4 C748.0,16.3 752.0,13.9 756,14.7 C760.0,15.5 764.0,21.0 768,25.1 C772.0,29.2 776.0,35.5 780,39.3 C784.0,43.1 788.0,45.6 792,48.1 C796.0,50.6 800.0,52.1 804,54.1 C808.0,56.1 812.0,59.4 816,60.1 C820.0,60.8 824.0,61.4 828,58.5 C832.0,55.6 836.0,49.0 840,43.0 C844.0,37.0 848.0,27.3 852,22.5 C856.0,17.7 860.0,14.2 864,14.3 C868.0,14.4 872.0,19.2 876,23.1 C880.0,27.0 884.0,33.5 888,37.4 C892.0,41.3 896.0,44.1 900,46.5 C904.0,48.9 908.0,50.0 912,51.8 C916.0,53.6 920.0,56.2 924,57.1 C928.0,58.0 932.0,59.0 936,57.0 C940.0,55.0 944.0,50.2 948,45.4 C952.0,40.6 956.0,32.5 960,28.2 C964.0,23.9 968.0,20.2 972,19.7 C976.0,19.2 980.0,22.4 984,25.2 C988.0,28.0 992.0,33.3 996,36.4 C1000.0,39.5 1004.0,42.0 1008,43.9 C1012.0,45.8 1016.0,46.5 1020,47.7 C1024.0,48.9 1028.0,50.5 1032,51.1 C1036.0,51.8 1040.0,52.6 1044,51.6 C1048.0,50.6 1052.0,48.0 1056,45.1 C1060.0,42.2 1064.0,37.2 1068,34.4 C1072.0,31.6 1076.0,29.4 1080,28.5 C1084.0,27.6 1088.0,28.0 1092,29.3 C1096.0,30.6 1100.0,33.9 1104,36.1 C1108.0,38.3 1112.0,40.7 1116,42.5 C1120.0,44.3 1124.0,45.3 1128,46.7 C1132.0,48.1 1136.0,49.9 1140,51.1 C1144.0,52.3 1148.0,54.5 1152,54.1 C1156.0,53.7 1160.0,52.1 1164,48.8 C1168.0,45.5 1172.0,38.8 1176,34.2 C1180.0,29.6 1184.0,23.3 1188,21.1 C1192.0,18.9 1196.0,19.1 1200,20.9 C1204.0,22.7 1208.0,28.1 1212,31.7 C1216.0,35.3 1220.0,39.6 1224,42.5 C1228.0,45.4 1232.0,46.9 1236,48.9 C1240.0,50.9 1244.0,53.0 1248,54.8 C1252.0,56.5 1256.0,59.5 1260,59.4 C1264.0,59.3 1268.0,58.0 1272,54.1 C1276.0,50.2 1280.0,42.0 1284,36.0 C1288.0,30.0 1292.0,21.3 1296,17.9 C1300.0,14.4 1304.0,13.7 1308,15.3 C1312.0,16.9 1316.0,23.2 1320,27.5 C1324.0,31.8 1328.0,37.6 1332,41.2 C1336.0,44.8 1340.0,46.8 1344,49.1 C1348.0,51.4 1352.0,53.3 1356,55.2 C1360.0,57.1 1364.0,60.3 1368,60.6 C1372.0,60.9 1376.0,60.3 1380,56.8 C1384.0,53.3 1388.0,45.6 1392,39.5 C1396.0,33.4 1400.0,24.2 1404,20.1 C1408.0,16.0 1412.0,14.1 1416,15.0 C1420.0,15.9 1424.0,21.6 1428,25.7 C1432.0,29.8 1436.0,35.8 1440,39.4 C1444.0,43.0 1448.0,45.1 1452,47.3 C1456.0,49.5 1460.0,50.9 1464,52.5 C1468.0,54.1 1472.0,56.7 1476,57.2 C1480.0,57.7 1484.0,58.0 1488,55.5 C1492.0,53.0 1496.0,47.3 1500,42.4 C1504.0,37.5 1508.0,30.0 1512,26.3 C1516.0,22.6 1520.0,20.2 1524,20.4 C1528.0,20.6 1532.0,24.6 1536,27.5 C1540.0,30.4 1544.0,35.3 1548,38.1 C1552.0,40.9 1556.0,42.9 1560,44.5 C1564.0,46.1 1568.0,46.8 1572,47.9 C1576.0,49.0 1580.0,50.5 1584,50.9 C1588.0,51.3 1592.0,51.7 1596,50.4 C1600.0,49.1 1604.0,45.9 1608,43.1 C1612.0,40.3 1616.0,36.0 1620,33.4 C1624.0,30.8 1628.0,27.8 1632,27.2 C1636.0,26.6 1640.0,27.9 1644,29.5 C1648.0,31.1 1652.0,34.8 1656,37.1 C1660.0,39.4 1664.0,41.7 1668,43.5 C1672.0,45.3 1676.0,46.2 1680,47.7 C1684.0,49.2 1688.0,51.2 1692,52.4 C1696.0,53.5 1700.0,55.5 1704,54.6 C1708.0,53.7 1712.0,51.0 1716,47.1 C1720.0,43.2 1724.0,35.8 1728,31.2 C1732.0,26.6 1736.0,21.0 1740,19.4 C1744.0,17.8 1748.0,19.3 1752,21.7 C1756.0,24.1 1760.0,29.9 1764,33.6 C1768.0,37.3 1772.0,41.2 1776,43.9 C1780.0,46.6 1784.0,48.0 1788,50.0 C1792.0,52.0 1796.0,54.5 1800,56.1 C1804.0,57.7 1808.0,60.5 1812,59.8 C1816.0,59.1 1820.0,56.5 1824,51.9 C1828.0,47.3 1832.0,38.4 1836,32.4 C1840.0,26.4 1844.0,18.6 1848,16.0 C1852.0,13.3 1856.0,14.2 1860,16.5 C1864.0,18.8 1868.0,25.6 1872,30.0 C1876.0,34.4 1880.0,39.5 1884,42.9 C1888.0,46.2 1892.0,47.9 1896,50.1 C1900.0,52.3 1904.0,54.4 1908,56.2 C1912.0,58.0 1916.0,61.0 1920,60.8 C1924.0,60.5 1928.0,58.9 1932,54.7 C1936.0,50.6 1940.0,42.0 1944,35.9 C1948.0,29.8 1952.0,21.5 1956,18.2 C1960.0,14.9 1964.0,14.6 1968,16.3 C1972.0,18.0 1976.0,24.2 1980,28.3 C1984.0,32.4 1988.0,37.8 1992,41.1 C1996.0,44.4 2000.0,46.1 2004,48.1 C2008.0,50.1 2012.0,51.6 2016,53.1 C2020.0,54.6 2024.0,57.1 2028,57.2 C2032.0,57.3 2036.0,56.5 2040,53.6 C2044.0,50.7 2048.0,44.4 2052,39.6 C2056.0,34.8 2060.0,27.8 2064,24.8 C2068.0,21.8 2072.0,20.8 2076,21.6 C2080.0,22.4 2084.0,26.8 2088,29.8 C2092.0,32.8 2096.0,37.1 2100,39.6 C2104.0,42.1 2108.0,43.5 2112,44.9 C2116.0,46.3 2120.0,47.0 2124,48.0 C2128.0,49.0 2132.0,50.4 2136,50.6 C2140.0,50.8 2144.0,50.6 2148,49.1 C2152.0,47.6 2156.0,44.4 2160,41.4 C2164.0,38.4 2168.0,33.9 2172,31.3 C2176.0,28.8 2180.0,26.3 2184,26.1 C2188.0,25.9 2192.0,28.1 2196,30.1 C2200.0,32.1 2204.0,35.9 2208,38.3 C2212.0,40.7 2216.0,42.8 2220,44.5 C2224.0,46.2 2228.0,47.3 2232,48.8 C2236.0,50.3 2240.0,52.7 2244,53.7 C2248.0,54.7 2252.0,56.2 2256,54.7 C2260.0,53.2 2264.0,49.4 2268,45.0 C2272.0,40.6 2276.0,32.7 2280,28.2 C2284.0,23.7 2288.0,19.0 2292,18.1 C2296.0,17.2 2300.0,20.0 2304,22.9 C2308.0,25.8 2312.0,31.8 2316,35.5 C2320.0,39.2 2324.0,42.6 2328,45.2 C2332.0,47.8 2336.0,49.2 2340,51.2 C2344.0,53.2 2348.0,56.0 2352,57.4 C2356.0,58.8 2360.0,61.1 2364,59.7 C2368.0,58.4 2372.0,54.4 2376,49.3 C2380.0,44.1 2384.0,34.6 2388,28.8 C2392.0,23.0 2396.0,16.4 2400,14.6 C2404.0,12.8 2408.0,15.1 2412,18.1 C2416.0,21.1 2420.0,28.1 2424,32.5 C2428.0,36.9 2432.0,41.3 2436,44.4 C2440.0,47.5 2444.0,48.9 2448,51.0 C2452.0,53.1 2456.0,55.6 2460,57.2 C2464.0,58.8 2468.0,61.5 2472,60.6 C2476.0,59.8 2480.0,56.8 2484,52.1 C2488.0,47.4 2492.0,38.4 2496,32.5 C2500.0,26.6 2504.0,19.3 2508,16.9 C2512.0,14.5 2516.0,15.7 2520,18.0 C2524.0,20.3 2528.0,26.8 2532,30.9 C2536.0,35.0 2540.0,39.6 2544,42.6 C2548.0,45.6 2552.0,46.9 2556,48.7 C2560.0,50.5 2564.0,52.2 2568,53.6 C2572.0,55.0 2576.0,57.1 2580,56.8 C2584.0,56.4 2588.0,54.8 2592,51.5 C2596.0,48.2 2600.0,41.5 2604,36.9 C2608.0,32.3 2612.0,26.2 2616,23.9 C2620.0,21.6 2624.0,21.8 2628,23.1 C2632.0,24.5 2636.0,29.1 2640,32.0 C2644.0,34.9 2648.0,38.5 2652,40.7 C2656.0,42.9 2660.0,44.0 2664,45.2 C2668.0,46.4 2672.0,47.2 2676,48.0 C2680.0,48.8 2684.0,50.2 2688,50.1 C2692.0,50.0 2696.0,49.3 2700,47.6 C2704.0,45.9 2708.0,42.8 2712,39.7 C2716.0,36.6 2720.0,31.6 2724,29.2 C2728.0,26.8 2732.0,25.0 2736,25.3 C2740.0,25.6 2744.0,28.5 2748,30.9 C2752.0,33.3 2756.0,37.2 2760,39.6 C2764.0,42.0 2768.0,43.8 2772,45.5 C2776.0,47.2 2780.0,48.4 2784,50.0 C2788.0,51.6 2792.0,54.2 2796,54.9 C2800.0,55.6 2804.0,56.5 2808,54.4 C2812.0,52.3 2816.0,47.3 2820,42.4 C2824.0,37.5 2828.0,29.4 2832,25.2 C2836.0,21.0 2840.0,17.4 2844,17.3 C2848.0,17.2 2852.0,21.0 2856,24.4 C2860.0,27.8 2864.0,33.8 2868,37.5 C2872.0,41.2 2878.0,45.0 2880,46.5" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    </svg>
  </div>

  <header class="hdr">
    <div class="hdr-l">
      <img class="hdr-logo" src="./Logo/UMB.png" alt="Universitas Mercu Buana" />
      <div>
        <div class="hdr-uni">Universitas Mercu Buana</div>
        <div class="hdr-dept">Program Studi Teknik Mesin</div>
      </div>
    </div>
    <div class="hdr-tag">Getaran Mekanik</div>
  </header>

  <main class="ctr">
    <div class="badge">📊 &nbsp; Materi Kuliah</div>
    <div class="ttl1">Analisis Getaran</div>
    <div class="ttl2">Berbasis Fourier Transform</div>
    <div class="fml">X(f) = ∫<sub>−∞</sub><sup>+∞</sup> x(t) &middot; e<sup>−j2πft</sup> dt</div>
    <div class="sep"></div>
    <div class="au">
      <span class="au-name">Dedik Romahadi, S.T., M.T.</span>
      <span class="au-sem">Semester Genap 2025/2026</span>
    </div>
  </main>

  <div class="spectrum">
    <div class="bar" style="--pk:14px;--d:0.00s"></div>
    <div class="bar" style="--pk:32px;--d:0.10s"></div>
    <div class="bar" style="--pk:58px;--d:0.05s"></div>
    <div class="bar" style="--pk:82px;--d:0.20s"></div>
    <div class="bar" style="--pk:64px;--d:0.15s"></div>
    <div class="bar" style="--pk:38px;--d:0.30s"></div>
    <div class="bar" style="--pk:72px;--d:0.08s"></div>
    <div class="bar" style="--pk:92px;--d:0.25s"></div>
    <div class="bar" style="--pk:76px;--d:0.12s"></div>
    <div class="bar" style="--pk:50px;--d:0.18s"></div>
    <div class="bar" style="--pk:28px;--d:0.22s"></div>
    <div class="bar" style="--pk:62px;--d:0.35s"></div>
    <div class="bar" style="--pk:86px;--d:0.05s"></div>
    <div class="bar" style="--pk:54px;--d:0.28s"></div>
    <div class="bar" style="--pk:44px;--d:0.14s"></div>
    <div class="bar" style="--pk:68px;--d:0.32s"></div>
    <div class="bar" style="--pk:40px;--d:0.07s"></div>
    <div class="bar" style="--pk:24px;--d:0.19s"></div>
    <div class="bar" style="--pk:66px;--d:0.11s"></div>
    <div class="bar" style="--pk:48px;--d:0.26s"></div>
    <div class="bar" style="--pk:80px;--d:0.03s"></div>
    <div class="bar" style="--pk:36px;--d:0.17s"></div>
  </div>

  <footer class="ftr">
    <span>Mata Kuliah Getaran Mekanik</span>
    <span class="dot">•</span>
    <span>S1 Teknik Mesin</span>
    <span class="dot">•</span>
    <span>Universitas Mercu Buana</span>
    <span class="yr">{{ nowStr }}</span>
  </footer>
</div>

<style scoped>
.cover {
  background: #080e1a;
  position: absolute;
  inset: 0;
  display: flex; flex-direction: column;
  overflow: hidden;
  color: #f1f5f9;
}
.wave-track {
  position: absolute; top: 73%; left: 0;
  width: 200%; height: 80px;
  animation: wscroll 16s linear infinite;
}
.wave-track.w2 {
  top: 78%;
  animation-duration: 24s;
  animation-direction: reverse;
}
.wave-track.w3 {
  top: 68%;
  animation-duration: 32s;
}
.wave-track svg { width: 100%; height: 100%; }
@keyframes wscroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 32px;
  border-bottom: none;
  background:
    radial-gradient(120% 180% at 50% -60%, rgba(124,77,255,0.14), transparent 60%),
    linear-gradient(90deg, #060c18 0%, #0d1526 50%, #060c18 100%);
  position: relative; z-index: 10;
}
.hdr::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1.5px;
  background: linear-gradient(90deg, #7c4dff, #a78bfa, #00e5ff, #fbbf24, #a78bfa, #7c4dff);
  background-size: 300% 100%;
  animation: rule-slide 4s linear infinite;
}
.hdr-l   { display: flex; align-items: center; gap: 12px; }
.hdr-logo {
  height: 38px; width: auto; object-fit: contain; display: block;
  transform-origin: center;
  animation: logofloat 4.5s ease-in-out infinite;
  filter: drop-shadow(0 0 0 rgba(200,146,42,0));
}
@keyframes logofloat {
  0%   { transform: translateY(0) rotate(0deg) scale(1); filter: drop-shadow(0 0 2px rgba(167,139,250,0.2)); }
  25%  { transform: translateY(-3px) rotate(-1.5deg) scale(1.03); filter: drop-shadow(0 0 7px rgba(167,139,250,0.5)); }
  50%  { transform: translateY(0) rotate(0deg) scale(1); filter: drop-shadow(0 0 3px rgba(167,139,250,0.3)); }
  75%  { transform: translateY(-3px) rotate(1.5deg) scale(1.03); filter: drop-shadow(0 0 7px rgba(167,139,250,0.5)); }
  100% { transform: translateY(0) rotate(0deg) scale(1); filter: drop-shadow(0 0 2px rgba(167,139,250,0.2)); }
}
.hdr-uni  { font-size: 13px; font-weight: 600; color: #f1f5f9; }
.hdr-dept { font-size: 11px; color: #64748b; margin-top: 2px; }
.hdr-tag  {
  font-size: 12px; font-weight: 600; color: #a78bfa;
  border: 1px solid rgba(167,139,250,.4);
  padding: 4px 16px; border-radius: 4px;
  background: transparent; letter-spacing: 1px;
  text-transform: uppercase;
}
.ctr {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 0 80px;
  position: relative; z-index: 10;
}
.badge {
  font-size: 11px; letter-spacing: 3px;
  text-transform: uppercase; color: #a78bfa;
  margin-bottom: 18px;
  animation: fadeup 0.6s ease both;
}
.ttl1 {
  font-size: 52px; font-weight: 800;
  color: #f1f5f9; line-height: 1.1; margin: 0;
  animation: fadeup 0.7s 0.1s ease both;
}
.ttl2 {
  font-size: 52px; font-weight: 800;
  color: #a78bfa;
  line-height: 1.1; margin: 0 0 20px;
  animation: fadeup 0.7s 0.2s ease both;
}
.fml {
  font-size: 15px; color: #94a3b8;
  font-family: 'Fira Code', 'Courier New', monospace;
  padding: 10px 24px;
  border-left: 3px solid #a78bfa;
  border-top: 1px solid rgba(255,255,255,.08);
  border-right: 1px solid rgba(255,255,255,.08);
  border-bottom: 1px solid rgba(255,255,255,.08);
  border-radius: 0 6px 6px 0;
  background: #060c18;
  margin-bottom: 20px;
  animation: fadeup 0.7s 0.3s ease both;
}
.sep {
  width: 0; height: 1px;
  background: #a78bfa;
  margin: 0 auto 16px;
  animation: expand 0.9s 0.4s ease both;
}
@keyframes expand { to { width: 60px; } }
.au { display: flex; flex-direction: column; gap: 4px; animation: fadeup 0.7s 0.5s ease both; }
.au-name { font-size: 17px; font-weight: 600; color: #f1f5f9; }
.au-sem  { font-size: 12px; color: #64748b; }
.spectrum {
  display: flex; justify-content: center;
  align-items: flex-end; gap: 4px;
  height: 72px; padding: 0 32px;
  position: relative; z-index: 10;
}
.bar {
  width: 10px; height: 3px; min-height: 3px;
  background: #00e5ff;
  border-radius: 2px 2px 0 0;
  animation: bpulse 1.4s ease-in-out infinite alternate;
  animation-delay: var(--d, 0s);
}
@keyframes bpulse {
  from { height: 3px; }
  to   { height: var(--pk, 20px); }
}
.ftr {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 32px;
  border-top: none;
  background: #060c18;
  font-size: 11px; color: #64748b;
  position: relative; z-index: 10;
}
.ftr::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1.5px;
  background: linear-gradient(90deg, #7c4dff, #a78bfa, #00e5ff, #fbbf24, #a78bfa, #7c4dff);
  background-size: 300% 100%;
  animation: rule-slide 4s linear infinite;
}
@keyframes rule-slide {
  from { background-position: 0% 0%; }
  to   { background-position: 100% 0%; }
}
.dot { color: #334155; }
.yr  { margin-left: auto; color: #a78bfa; font-weight: 600; font-family: 'Fira Code', monospace; font-size: 10px; }
@keyframes fadeup {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const nowStr = ref('')
function tick() {
  const d = new Date()
  const opts = { timeZone: 'Asia/Jakarta' }
  const day = d.toLocaleDateString('id-ID', { ...opts, day: '2-digit', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString('id-ID', { ...opts, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  nowStr.value = `${day} · ${time}`
}
tick()
let _t
onMounted(() => { _t = setInterval(tick, 1000) })
onBeforeUnmount(() => clearInterval(_t))
</script>


---
layout: default
title: "Peta Materi"
---

<div style="display:flex;flex-direction:column;height:100%;justify-content:flex-start;gap:14px">

<div style="color:#94a3b8;font-size:13px;letter-spacing:.02em;padding-bottom:2px;border-bottom:1px solid rgba(255,255,255,.05)">
  Tiga blok topik yang membentuk kompetensi analisis getaran berbasis Fourier — ditempuh secara berurutan:
</div>

<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:12px 0;align-items:start">

<v-click>
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-left:3px solid #00e5ff;border-radius:8px;padding:10px 12px 10px;box-sizing:border-box;display:flex;flex-direction:column">
<div style="color:#67e8f9;font-weight:700;margin-bottom:8px;font-size:13.5px">① &nbsp;🔢 Dasar DFT/FFT</div>
<ul style="font-size:12.5px;color:#94a3b8;line-height:1.75;list-style:none;padding:0;margin:0">
<li>→ Dari sinyal analog ke diskrit</li>
<li>→ Definisi DFT &amp; parameter kunci</li>
<li>→ Algoritma FFT Cooley-Tukey</li>
<li>→ Kompleksitas O(N log N)</li>
</ul>
<div style="font-size:11px;color:#67e8f9;background:rgba(0,229,255,.07);border-radius:5px;padding:4px 8px;display:inline-block;margin-top:auto;align-self:flex-start">Slide 3 – 9</div>
</div>
</v-click>

<v-click>
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-left:3px solid #34d399;border-radius:8px;padding:10px 12px 10px;box-sizing:border-box;display:flex;flex-direction:column">
<div style="color:#6ee7b7;font-weight:700;margin-bottom:8px;font-size:13.5px">② &nbsp;⚙️ Parameter Akuisisi</div>
<ul style="font-size:12.5px;color:#94a3b8;line-height:1.75;list-style:none;padding:0;margin:0">
<li>→ Resolusi frekuensi &amp; sampling</li>
<li>→ Teorema Nyquist &amp; aliasing</li>
<li>→ Windowing &amp; spectral leakage</li>
<li>→ Zero-padding &amp; averaging</li>
</ul>
<div style="font-size:11px;color:#6ee7b7;background:rgba(52,211,153,.07);border-radius:5px;padding:4px 8px;display:inline-block;margin-top:auto;align-self:flex-start">Slide 10 – 18</div>
</div>
</v-click>

<v-click>
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-left:3px solid #a78bfa;border-radius:8px;padding:10px 12px 10px;box-sizing:border-box;display:flex;flex-direction:column">
<div style="color:#fbbf24;font-weight:700;margin-bottom:8px;font-size:13.5px">③ &nbsp;🏭 Aplikasi Teknik</div>
<ul style="font-size:12.5px;color:#94a3b8;line-height:1.75;list-style:none;padding:0;margin:0">
<li>→ Diagnosis kerusakan mesin</li>
<li>→ Fungsi Respons Frekuensi (FRF)</li>
<li>→ Predictive maintenance</li>
<li>→ Implementasi Python/MATLAB</li>
</ul>
<div style="font-size:11px;color:#fbbf24;background:rgba(251,191,36,.07);border-radius:5px;padding:4px 8px;display:inline-block;margin-top:auto;align-self:flex-start">Slide 19 – 28</div>
</div>
</v-click>

</div>

<v-click>
<Callout type="analogy">
Bayangkan FFT sebagai <strong>detektor nada</strong> pada tuner gitar digital: Anda petik senar (sinyal waktu) → tuner seketika tampilkan frekuensinya (spektrum). Perbedaannya, FFT memisahkan <em>semua</em> frekuensi dalam sinyal getaran mesin — sekaligus, dalam milidetik.
</Callout>
</v-click>

<v-click>
<div style="display:flex;gap:10px">
<div style="flex:1;background:#0d1526;border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:10px">
  <span style="font-size:20px">📊</span>
  <div>
    <div style="font-size:18px;font-weight:800;color:#a78bfa;line-height:1">28</div>
    <div style="font-size:10.5px;color:#475569;margin-top:2px">Total Slide</div>
  </div>
</div>
<div style="flex:1;background:#0d1526;border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:10px">
  <span style="font-size:20px">🧮</span>
  <div>
    <div style="font-size:18px;font-weight:800;color:#00e5ff;line-height:1">3</div>
    <div style="font-size:10.5px;color:#475569;margin-top:2px">Demo Interaktif</div>
  </div>
</div>
<div style="flex:1;background:#0d1526;border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:10px">
  <span style="font-size:20px">💡</span>
  <div>
    <div style="font-size:18px;font-weight:800;color:#34d399;line-height:1">8</div>
    <div style="font-size:10.5px;color:#475569;margin-top:2px">Soal Kuis</div>
  </div>
</div>
<div style="flex:1;background:#0d1526;border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:10px">
  <span style="font-size:20px">🏭</span>
  <div>
    <div style="font-size:18px;font-weight:800;color:#fbbf24;line-height:1">5</div>
    <div style="font-size:10.5px;color:#475569;margin-top:2px">Kasus Industri</div>
  </div>
</div>
</div>
</v-click>

</div>

---
layout: default
title: "Capaian Pembelajaran (CPMK)"
---

<div style="display:flex;flex-direction:column;gap:22px">

<div style="color:#94a3b8;font-size:12.5px;letter-spacing:.02em;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.05)">
  Setelah mempelajari materi ini, mahasiswa mampu:
</div>

<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;align-items:stretch">

<v-click>
<div style="background:#0d1526;border:1px solid rgba(0,229,255,.15);border-left:3px solid #00e5ff;border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:6px">
  <div style="display:flex;align-items:center;gap:7px">
    <span style="background:rgba(0,229,255,.12);color:#00e5ff;font-weight:700;font-size:10.5px;padding:2px 7px;border-radius:4px;white-space:nowrap">CPMK 1</span>
    <span style="color:#67e8f9;font-weight:700;font-size:13px">Menjelaskan</span>
  </div>
  <div style="font-size:12px;color:#94a3b8;line-height:1.5">Prinsip DFT & FFT serta perbedaan parameter kunci: resolusi frekuensi, Nyquist, windowing</div>
  <div style="font-size:11px;color:#475569;margin-top:2px">🔢 Dasar Teori</div>
</div>
</v-click>

<v-click>
<div style="background:#0d1526;border:1px solid rgba(52,211,153,.15);border-left:3px solid #34d399;border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:6px">
  <div style="display:flex;align-items:center;gap:7px">
    <span style="background:rgba(52,211,153,.12);color:#34d399;font-weight:700;font-size:10.5px;padding:2px 7px;border-radius:4px;white-space:nowrap">CPMK 2</span>
    <span style="color:#6ee7b7;font-weight:700;font-size:13px">Menerapkan</span>
  </div>
  <div style="font-size:12px;color:#94a3b8;line-height:1.5">Algoritma FFT untuk analisis sinyal getaran diskrit & interpretasi spektrum amplitudo</div>
  <div style="font-size:11px;color:#475569;margin-top:2px">⚙️ Implementasi</div>
</div>
</v-click>

<v-click>
<div style="background:#0d1526;border:1px solid rgba(251,191,36,.15);border-left:3px solid #fbbf24;border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:6px">
  <div style="display:flex;align-items:center;gap:7px">
    <span style="background:rgba(251,191,36,.12);color:#fbbf24;font-weight:700;font-size:10.5px;padding:2px 7px;border-radius:4px;white-space:nowrap">CPMK 3</span>
    <span style="color:#fcd34d;font-weight:700;font-size:13px">Merancang</span>
  </div>
  <div style="font-size:12px;color:#94a3b8;line-height:1.5">Parameter akuisisi sinyal (frekuensi sampling, jumlah sampel) sesuai kebutuhan analisis</div>
  <div style="font-size:11px;color:#475569;margin-top:2px">🎛️ Desain Sistem</div>
</div>
</v-click>

</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start">

<v-click>
<div style="background:#0d1526;border:1px solid rgba(251,113,133,.15);border-left:3px solid #fb7185;border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:6px">
  <div style="display:flex;align-items:center;gap:7px">
    <span style="background:rgba(251,113,133,.12);color:#fb7185;font-weight:700;font-size:10.5px;padding:2px 7px;border-radius:4px;white-space:nowrap">CPMK 4</span>
    <span style="color:#fda4af;font-weight:700;font-size:13px">Mengidentifikasi</span>
  </div>
  <div style="font-size:12px;color:#94a3b8;line-height:1.5">Frekuensi natural, harmonik, dan pola kerusakan dari spektrum getaran mesin industri</div>
  <div style="font-size:11px;color:#475569;margin-top:2px">🔍 Diagnosis Mesin</div>
</div>
</v-click>

<v-click>
<div style="background:#0d1526;border:1px solid rgba(167,139,250,.15);border-left:3px solid #a78bfa;border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:6px">
  <div style="display:flex;align-items:center;gap:7px">
    <span style="background:rgba(167,139,250,.12);color:#a78bfa;font-weight:700;font-size:10.5px;padding:2px 7px;border-radius:4px;white-space:nowrap">CPMK 5</span>
    <span style="color:#c4b5fd;font-weight:700;font-size:13px">Menggunakan</span>
  </div>
  <div style="font-size:12px;color:#94a3b8;line-height:1.5">Python / MATLAB untuk analisis FFT sinyal getaran nyata dan visualisasi hasilnya</div>
  <div style="font-size:11px;color:#475569;margin-top:2px">💻 Pemrograman</div>
</div>
</v-click>

</div>

<v-click>
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-left:3px solid #a78bfa;border-radius:8px;padding:8px 14px;font-size:12px;color:#94a3b8">
  📚 Referensi: Brandt (2011) <em>Noise and Vibration Analysis</em>. Wiley &nbsp;|&nbsp; Rao (2018) <em>Mechanical Vibrations</em>, 6th Ed. Pearson
</div>
</v-click>

</div>

---
layout: default
title: "Mengapa Domain Frekuensi?"
---


<TimeFreqDemo />

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
<Callout type="warning" title="Domain Waktu — Sulit Dibaca">
Komponen harmonik bertumpuk jadi satu. Sulit menentukan frekuensi mana yang bermasalah. Noise mengaburkan informasi penting. Mustahil diagnosis visual.
</Callout>
<Callout type="tip" title="Domain Frekuensi — Langsung Terlihat">
Tiap komponen muncul sebagai <strong>puncak terpisah</strong> di frekuensinya masing-masing. Anomali langsung terdeteksi. Noise tersebar rata, sinyal menonjol.
</Callout>
</div>

---
layout: default
title: "Sinyal Getaran — Karakteristik & Representasi"
class: tight
---

<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start">
<div>

**Sinyal harmonik sederhana:**

$$\Large x(t) = A\cos(\omega t + \phi)$$

**Sinyal multi-komponen (mesin nyata):**

$$\Large x(t) = \sum_{k} A_k\cos(\omega_k t + \phi_k) + n(t)$$

di mana $n(t)$ = noise acak terukur

<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:10px 12px;margin-top:20px">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
  <div style="display:flex;gap:12px;font-size:11px">
    <span id="s5lbl1" style="color:#a78bfa;cursor:pointer;user-select:none">▬ f₀ (30 Hz)</span>
    <span id="s5lbl2" style="color:#00e5ff;cursor:pointer;user-select:none">▬ 2f₀ (60 Hz)</span>
    <span id="s5lbl3" style="color:#fbbf24;cursor:pointer;user-select:none">▬ Gabungan</span>
  </div>
  <span style="font-size:10px;color:#475569">klik ↑ toggle</span>
</div>
<canvas id="s5wave" style="width:100%;height:120px;display:block;border-radius:4px"></canvas>
</div>

</div>
<div>

**Jenis sinyal getaran:**

| Jenis | Ciri | Contoh |
|-------|------|--------|
| **Periodik** | Berulang tiap $T$ | Unbalance |
| **Harmonik** | Satu frekuensi | Resonansi |
| **Stasioner acak** | Spektrum kontinu | Turbulensi |
| **Transien** | Singkat, non-periodik | Impak bearing |

<div style="margin-top:14px">
<Callout type="industry" title="Sinyal Mesin Nyata">
Poros 1800 RPM: 30 Hz (1×), 60 Hz (2×), 90 Hz (3×) + meshing gear + cacat bearing. FFT memisahkan semuanya dalam satu operasi.
</Callout>
</div>

<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-left:3px solid #34d399;border-radius:8px;padding:10px 12px;margin-top:12px">
<div style="font-size:11px;color:#6ee7b7;font-weight:700;margin-bottom:4px">📊 Spektrum FFT — Domain Frekuensi</div>
<canvas id="s5fft" style="width:100%;height:86px;display:block"></canvas>
</div>

</div>
</div>

<script setup>
import { onMounted, onUnmounted } from 'vue'
let _s5anim = null
onMounted(() => {
  const wc = document.getElementById('s5wave')
  const fc = document.getElementById('s5fft')
  if (!wc || !fc) return
  const wCtx = wc.getContext('2d')
  const fCtx = fc.getContext('2d')
  const show = { f1: true, f2: true, com: true }
  let tick = 0
  const dpr = window.devicePixelRatio || 1
  function initCanvas(c) {
    const r = c.getBoundingClientRect()
    c.width = r.width * dpr; c.height = r.height * dpr
    c.getContext('2d').scale(dpr, dpr)
  }
  initCanvas(wc); initCanvas(fc)
  function W(c) { return c.width / dpr }
  function H(c) { return c.height / dpr }
  function drawWave() {
    const cw = W(wc), ch = H(wc)
    wCtx.clearRect(0, 0, cw, ch)
    wCtx.strokeStyle = 'rgba(255,255,255,0.05)'; wCtx.lineWidth = 1; wCtx.setLineDash([3,4])
    wCtx.beginPath(); wCtx.moveTo(0, ch/2); wCtx.lineTo(cw, ch/2); wCtx.stroke()
    wCtx.setLineDash([])
    const A1 = ch*0.32, A2 = ch*0.18, spd = 0.9
    if (show.f1) {
      wCtx.strokeStyle='#a78bfa'; wCtx.lineWidth=2; wCtx.globalAlpha=1; wCtx.beginPath()
      for (let x=0;x<=cw;x++) { const y=ch/2-A1*Math.sin(2*Math.PI*(x/cw*4)-tick*spd*0.04); x===0?wCtx.moveTo(x,y):wCtx.lineTo(x,y) }
      wCtx.stroke()
    }
    if (show.f2) {
      wCtx.strokeStyle='#00e5ff'; wCtx.lineWidth=1.5; wCtx.globalAlpha=0.85; wCtx.beginPath()
      for (let x=0;x<=cw;x++) { const y=ch/2-A2*Math.sin(2*Math.PI*(x/cw*8)-tick*spd*0.08); x===0?wCtx.moveTo(x,y):wCtx.lineTo(x,y) }
      wCtx.stroke()
    }
    if (show.com) {
      wCtx.strokeStyle='#fbbf24'; wCtx.lineWidth=1.8; wCtx.globalAlpha=0.75; wCtx.beginPath()
      for (let x=0;x<=cw;x++) { const y=ch/2-A1*Math.sin(2*Math.PI*(x/cw*4)-tick*spd*0.04)-A2*Math.sin(2*Math.PI*(x/cw*8)-tick*spd*0.08); x===0?wCtx.moveTo(x,y):wCtx.lineTo(x,y) }
      wCtx.stroke()
    }
    wCtx.globalAlpha=1
  }
  function drawFFT() {
    const fw = W(fc), fh = H(fc)
    fCtx.clearRect(0, 0, fw, fh)
    const axY = fh - 18, maxBar = fh - 30, bw = 10
    // axis
    fCtx.strokeStyle='rgba(255,255,255,0.08)'; fCtx.lineWidth=1
    fCtx.beginPath(); fCtx.moveTo(20, axY); fCtx.lineTo(fw-8, axY); fCtx.stroke()
    // freq tick labels
    fCtx.fillStyle='#475569'; fCtx.font='9px monospace'; fCtx.textAlign='center'
    const freqs = [{hz:'0 Hz',x:20},{hz:'30 Hz',x:fw*0.32},{hz:'60 Hz',x:fw*0.60},{hz:'90 Hz',x:fw*0.88}]
    freqs.forEach(f => { fCtx.fillText(f.hz, f.x, fh-4) })
    // y label
    fCtx.fillStyle='#475569'; fCtx.font='9px monospace'; fCtx.textAlign='right'
    fCtx.fillText('|X|', 18, 10)
    // 30 Hz bar (f₀) — visible if f1 OR com is on
    const show30 = show.f1 || show.com
    const show60 = show.f2 || show.com
    if (show30) {
      const bh = maxBar * 0.78
      const x = fw * 0.32
      fCtx.globalAlpha = show.f1 ? 1 : 0.5
      fCtx.shadowColor='#a78bfa'; fCtx.shadowBlur=10
      fCtx.fillStyle='#a78bfa'
      fCtx.fillRect(x - bw/2, axY - bh, bw, bh)
      fCtx.shadowBlur=0
      fCtx.globalAlpha=1
      fCtx.fillStyle='#c4b5fd'; fCtx.font='bold 9px sans-serif'; fCtx.textAlign='center'
      fCtx.fillText('A₁', x, axY - bh - 3)
    }
    if (show60) {
      const bh = maxBar * 0.44
      const x = fw * 0.60
      fCtx.globalAlpha = show.f2 ? 1 : 0.5
      fCtx.shadowColor='#00e5ff'; fCtx.shadowBlur=10
      fCtx.fillStyle='#00e5ff'
      fCtx.fillRect(x - bw/2, axY - bh, bw, bh)
      fCtx.shadowBlur=0
      fCtx.globalAlpha=1
      fCtx.fillStyle='#67e8f9'; fCtx.font='bold 9px sans-serif'; fCtx.textAlign='center'
      fCtx.fillText('A₂', x, axY - bh - 3)
    }
    fCtx.globalAlpha=1; fCtx.shadowBlur=0
  }
  function loop() { drawWave(); drawFFT(); tick++; _s5anim = requestAnimationFrame(loop) }
  loop()
  const tog = (id, key) => {
    const el = document.getElementById(id)
    if (el) el.onclick = () => { show[key]=!show[key]; el.style.opacity=show[key]?'1':'0.3' }
  }
  tog('s5lbl1','f1'); tog('s5lbl2','f2'); tog('s5lbl3','com')
})
onUnmounted(() => { if (_s5anim) cancelAnimationFrame(_s5anim) })
</script>

---
layout: default
title: "DFT — Transformasi Fourier Diskrit"
class: tight
---

Sinyal kontinyu $x(t)$ di-sampling menjadi $N$ sampel diskrit $x[n]$, lalu dihitung:

<div style="margin-top:10px">

$$\boxed{X[k] = \sum_{n=0}^{N-1} x[n]\,e^{-j\frac{2\pi}{N}kn}, \quad k = 0,1,\ldots,N{-}1}$$

$$\boxed{x[n] = \frac{1}{N}\sum_{k=0}^{N-1} X[k]\,e^{\,j\frac{2\pi}{N}kn}} \qquad \text{(IDFT — kebalikan DFT)}$$

</div>

<div style="background:#06091a;border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:8px 10px;margin:8px 0">
<div style="font-size:9px;color:#475569;letter-spacing:.06em;font-weight:600;margin-bottom:6px">ILUSTRASI — Proses DFT: Sampel Diskrit x[n] → Spektrum Frekuensi X[k]</div>
<div style="display:flex;align-items:stretch;gap:0;border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,.06)">
  <div style="flex:1;padding:8px 12px;background:#0a1020">
    <div style="font-size:9.5px;color:#67e8f9;font-weight:700;margin-bottom:6px">x[n] — Domain Waktu</div>
    <svg viewBox="0 0 240 48" width="240" height="48" style="width:100%;height:38px;display:block;overflow:visible">
      <line x1="6" y1="24" x2="234" y2="24" stroke="rgba(255,255,255,.1)" stroke-width="1"/>
      <path d="M6,24 C24,24 30,8 48,8 C66,8 72,24 90,24 C108,24 114,40 132,40 C150,40 156,24 174,24 C192,24 198,14 216,17 C228,19 232,23 234,24" fill="none" stroke="#00e5ff" stroke-width="1.6" opacity="0.45"/>
      <line x1="6" y1="24" x2="6" y2="24" stroke="#00e5ff" stroke-width="1.5"/>
      <line x1="34" y1="24" x2="34" y2="12" stroke="#00e5ff" stroke-width="1.5"/>
      <line x1="62" y1="24" x2="62" y2="14" stroke="#00e5ff" stroke-width="1.5"/>
      <line x1="90" y1="24" x2="90" y2="24" stroke="#00e5ff" stroke-width="1.5"/>
      <line x1="118" y1="24" x2="118" y2="37" stroke="#00e5ff" stroke-width="1.5"/>
      <line x1="146" y1="24" x2="146" y2="33" stroke="#00e5ff" stroke-width="1.5"/>
      <line x1="174" y1="24" x2="174" y2="24" stroke="#00e5ff" stroke-width="1.5"/>
      <line x1="202" y1="24" x2="202" y2="18" stroke="#00e5ff" stroke-width="1.5"/>
      <circle cx="6" cy="24" r="2.6" fill="#00e5ff"/>
      <circle cx="34" cy="12" r="2.6" fill="#00e5ff"/>
      <circle cx="62" cy="14" r="2.6" fill="#00e5ff"/>
      <circle cx="90" cy="24" r="2.6" fill="#00e5ff"/>
      <circle cx="118" cy="37" r="2.6" fill="#00e5ff"/>
      <circle cx="146" cy="33" r="2.6" fill="#00e5ff"/>
      <circle cx="174" cy="24" r="2.6" fill="#00e5ff"/>
      <circle cx="202" cy="18" r="2.6" fill="#00e5ff"/>
    </svg>
    <div style="display:flex;justify-content:space-around;font-size:7.5px;color:#475569;margin-top:3px;font-family:monospace"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span></div>
  </div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 16px;background:#06091a;border-left:1px solid rgba(255,255,255,.06);border-right:1px solid rgba(255,255,255,.06)">
    <div style="font-size:15px;font-weight:800;color:#fbbf24;letter-spacing:.06em">DFT</div>
    <div style="font-size:22px;color:#fbbf24;line-height:1;margin:1px 0 3px">→</div>
    <div style="font-size:16px;color:#e2e8f0;text-align:center;line-height:1.5;font-family:'Cambria Math',Georgia,serif">Σ x[n]·e<sup style="font-size:11px">−j2πkn/N</sup></div>
  </div>
  <div style="flex:1;padding:8px 12px;background:#0a1020">
    <div style="font-size:9.5px;color:#c4b5fd;font-weight:700;margin-bottom:6px">|X[k]| — Domain Frekuensi</div>
    <div style="display:flex;align-items:flex-end;gap:3px;height:38px">
      <div style="flex:1;border-radius:2px 2px 0 0;background:rgba(100,116,139,.4);height:8%"></div>
      <div style="flex:1;border-radius:2px 2px 0 0;background:#a78bfa;height:100%;box-shadow:0 0 8px rgba(167,139,250,.5)"></div>
      <div style="flex:1;border-radius:2px 2px 0 0;background:#00e5ff;height:58%"></div>
      <div style="flex:1;border-radius:2px 2px 0 0;background:#34d399;height:26%"></div>
      <div style="flex:1;border-radius:2px 2px 0 0;background:rgba(100,116,139,.3);height:8%"></div>
      <div style="flex:1;border-radius:2px 2px 0 0;background:rgba(100,116,139,.2);height:5%"></div>
      <div style="flex:1;border-radius:2px 2px 0 0;background:rgba(100,116,139,.15);height:3%"></div>
      <div style="flex:1;border-radius:2px 2px 0 0;background:rgba(100,116,139,.1);height:2%"></div>
    </div>
    <div style="display:flex;justify-content:space-around;font-size:7.5px;margin-top:3px;font-family:monospace"><span style="color:#475569">0</span><span style="color:#a78bfa;font-weight:700">1</span><span style="color:#67e8f9">2</span><span style="color:#6ee7b7">3</span><span style="color:#475569">4</span><span style="color:#475569">5</span><span style="color:#475569">6</span><span style="color:#475569">7</span></div>
  </div>
</div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:0;align-items:stretch">
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-left:3px solid #00e5ff;border-radius:8px;padding:10px;display:flex;flex-direction:column">
<div style="color:#67e8f9;font-weight:700;margin-bottom:5px;font-size:11.5px">Parameter DFT</div>

- $N$ = jumlah sampel
- $f_s$ = frekuensi sampling [Hz]
- $\Delta t = 1/f_s$ = interval antar sampel
- **Bin frekuensi:** $f_k = k \cdot f_s / N$

</div>
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-left:3px solid #34d399;border-radius:8px;padding:10px;display:flex;flex-direction:column">
<div style="color:#6ee7b7;font-weight:700;margin-bottom:5px;font-size:11.5px">Output DFT</div>

- $X[k]$ = bilangan kompleks
- $|X[k]|$ = **amplitudo** komponen $k$
- $\angle X[k]$ = **fasa** komponen $k$
- Analisis: $k = 0$ hingga $N/2$ saja

</div>
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-left:3px solid #a78bfa;border-radius:8px;padding:10px;display:flex;flex-direction:column">
<div style="color:#fbbf24;font-weight:700;margin-bottom:5px;font-size:11.5px">Kompleksitas</div>

- DFT langsung: $\mathcal{O}(N^2)$
- **FFT:** $\mathcal{O}(N\log_2 N)$ ✨
- $N=1024$: DFT ≈ $10^6$ op
- FFT ≈ $10^4$ op **(~100× lebih cepat)**

</div>
</div>

---
layout: two-cols
title: "FFT — Algoritma & Implementasi"
class: tight shift-down
---

### Algoritma Cooley-Tukey (1965)

Prinsip *divide & conquer*: DFT $N$ titik dipecah menjadi dua DFT $N/2$ titik rekursif.

**Notasi:** $W_N = e^{-j2\pi/N}$ (twiddle factor)

$$X[k] = E[k] + W_N^k \cdot O[k]$$

$$X[k+N/2] = E[k] - W_N^k \cdot O[k]$$

$E[k]$ = DFT sampel genap, $O[k]$ = DFT sampel ganjil.

**Butterfly** — inti FFT, diulang rekursif $\log_2 N$ tahap → $\mathcal{O}(N\log_2 N)$.

<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-radius:6px;padding:8px 10px;margin-top:8px;font-size:11.5px;color:#94a3b8">
💡 FFT efisien untuk <span style="font-style:italic;color:#c4b5fd">N = 2<sup>m</sup></span>. Jika bukan pangkat 2 → zero-padding ke <span style="font-style:italic;color:#c4b5fd">2<sup>m</sup></span> terdekat.
</div>

::right::

<div class="pl-4 col-center">

<div style="font-size:10px;color:#475569;letter-spacing:.06em;font-weight:600;margin-bottom:6px;text-align:center">ILUSTRASI — Diagram Butterfly 4-Point FFT</div>
<div style="background:#06091a;border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:14px 16px;max-width:270px;margin:0 auto">
<svg viewBox="0 0 395 244" style="width:100%;height:auto;display:block">
  <!-- Stage column headers -->
  <text x="52" y="22" text-anchor="middle" fill="#475569" font-size="8" font-family="sans-serif">Input</text>
  <text x="152" y="22" text-anchor="middle" fill="#a78bfa" font-size="8" font-family="sans-serif">Tahap 1</text>
  <text x="257" y="22" text-anchor="middle" fill="#34d399" font-size="8" font-family="sans-serif">Tahap 2</text>
  <text x="342" y="22" text-anchor="middle" fill="#fb7185" font-size="8" font-family="sans-serif">Output</text>
  <!-- Input node labels -->
  <text x="4" y="61" fill="#64748b" font-size="8" font-family="monospace">x[0]</text>
  <text x="4" y="106" fill="#64748b" font-size="8" font-family="monospace">x[2]</text>
  <text x="4" y="151" fill="#64748b" font-size="8" font-family="monospace">x[1]</text>
  <text x="4" y="196" fill="#64748b" font-size="8" font-family="monospace">x[3]</text>
  <!-- Stage 1 butterfly 1: rows y=58 & y=103 (purple) -->
  <line x1="52" y1="58" x2="152" y2="58" stroke="#a78bfa" stroke-width="1.3" opacity="0.75"/>
  <line x1="52" y1="103" x2="152" y2="103" stroke="#a78bfa" stroke-width="1.3" opacity="0.75"/>
  <line x1="52" y1="58" x2="152" y2="103" stroke="#a78bfa" stroke-width="1" opacity="0.45" stroke-dasharray="3 2"/>
  <line x1="52" y1="103" x2="152" y2="58" stroke="#a78bfa" stroke-width="1" opacity="0.45" stroke-dasharray="3 2"/>
  <!-- Stage 1 butterfly 2: rows y=148 & y=193 (purple) -->
  <line x1="52" y1="148" x2="152" y2="148" stroke="#a78bfa" stroke-width="1.3" opacity="0.75"/>
  <line x1="52" y1="193" x2="152" y2="193" stroke="#a78bfa" stroke-width="1.3" opacity="0.75"/>
  <line x1="52" y1="148" x2="152" y2="193" stroke="#a78bfa" stroke-width="1" opacity="0.45" stroke-dasharray="3 2"/>
  <line x1="52" y1="193" x2="152" y2="148" stroke="#a78bfa" stroke-width="1" opacity="0.45" stroke-dasharray="3 2"/>
  <!-- Stage 2 butterfly 1: rows y=58 & y=148 (green) -->
  <line x1="152" y1="58" x2="257" y2="58" stroke="#34d399" stroke-width="1.3" opacity="0.75"/>
  <line x1="152" y1="148" x2="257" y2="148" stroke="#34d399" stroke-width="1.3" opacity="0.75"/>
  <line x1="152" y1="58" x2="257" y2="148" stroke="#34d399" stroke-width="1" opacity="0.45" stroke-dasharray="3 2"/>
  <line x1="152" y1="148" x2="257" y2="58" stroke="#34d399" stroke-width="1" opacity="0.45" stroke-dasharray="3 2"/>
  <!-- Stage 2 butterfly 2: rows y=103 & y=193 (green) -->
  <line x1="152" y1="103" x2="257" y2="103" stroke="#34d399" stroke-width="1.3" opacity="0.75"/>
  <line x1="152" y1="193" x2="257" y2="193" stroke="#34d399" stroke-width="1.3" opacity="0.75"/>
  <line x1="152" y1="103" x2="257" y2="193" stroke="#34d399" stroke-width="1" opacity="0.45" stroke-dasharray="3 2"/>
  <line x1="152" y1="193" x2="257" y2="103" stroke="#34d399" stroke-width="1" opacity="0.45" stroke-dasharray="3 2"/>
  <!-- Output connector lines -->
  <line x1="257" y1="58" x2="342" y2="58" stroke="rgba(251,113,133,.5)" stroke-width="1"/>
  <line x1="257" y1="103" x2="342" y2="103" stroke="rgba(251,113,133,.5)" stroke-width="1"/>
  <line x1="257" y1="148" x2="342" y2="148" stroke="rgba(251,113,133,.5)" stroke-width="1"/>
  <line x1="257" y1="193" x2="342" y2="193" stroke="rgba(251,113,133,.5)" stroke-width="1"/>
  <!-- Input nodes (cyan) -->
  <circle cx="52" cy="58" r="4" fill="#00e5ff" opacity="0.9"/>
  <circle cx="52" cy="103" r="4" fill="#00e5ff" opacity="0.9"/>
  <circle cx="52" cy="148" r="4" fill="#00e5ff" opacity="0.9"/>
  <circle cx="52" cy="193" r="4" fill="#00e5ff" opacity="0.9"/>
  <!-- Stage 1 nodes (purple) -->
  <circle cx="152" cy="58" r="3.5" fill="#a78bfa"/>
  <circle cx="152" cy="103" r="3.5" fill="#a78bfa"/>
  <circle cx="152" cy="148" r="3.5" fill="#a78bfa"/>
  <circle cx="152" cy="193" r="3.5" fill="#a78bfa"/>
  <!-- Stage 2 nodes (green) -->
  <circle cx="257" cy="58" r="3.5" fill="#34d399"/>
  <circle cx="257" cy="103" r="3.5" fill="#34d399"/>
  <circle cx="257" cy="148" r="3.5" fill="#34d399"/>
  <circle cx="257" cy="193" r="3.5" fill="#34d399"/>
  <!-- Output labels -->
  <text x="350" y="61" fill="#fb7185" font-size="8" font-family="monospace">X[0]</text>
  <text x="350" y="106" fill="#fb7185" font-size="8" font-family="monospace">X[1]</text>
  <text x="350" y="151" fill="#fb7185" font-size="8" font-family="monospace">X[2]</text>
  <text x="350" y="196" fill="#fb7185" font-size="8" font-family="monospace">X[3]</text>
  <!-- Twiddle factor labels near crossing midpoints -->
  <text x="102" y="77" text-anchor="middle" fill="#a78bfa" font-size="7" font-family="monospace" opacity="0.85">W⁰</text>
  <text x="102" y="167" text-anchor="middle" fill="#a78bfa" font-size="7" font-family="monospace" opacity="0.85">W⁰</text>
  <text x="204" y="97" text-anchor="middle" fill="#34d399" font-size="7" font-family="monospace" opacity="0.85">W⁰</text>
  <text x="204" y="147" text-anchor="middle" fill="#34d399" font-size="7" font-family="monospace" opacity="0.85">W¹</text>
  <!-- Footer note -->
  <text x="197" y="232" text-anchor="middle" fill="#475569" font-size="7" font-family="sans-serif">4-point: 2 tahap · 8-point: 3 tahap · N-point: log₂N tahap</text>
</svg>
</div>

<div style="display:flex;align-items:center;gap:10px;margin-top:10px">
  <span style="font-size:11.5px;color:#94a3b8">Kode Python (scipy.fft):</span>
  <button @click="copyCode()" style="font-size:11px;background:#fbbf24;color:#1a1917;border:none;border-radius:5px;padding:3px 14px;cursor:pointer;font-weight:700">{{ copied ? '✓ Tersalin!' : '⎘ Salin Kode' }}</button>
</div>
<div style="font-size:10.5px;color:#64748b;margin-top:5px;line-height:1.6">
  <code style="color:#c4b5fd;font-size:10px;background:rgba(124,77,255,.15);padding:1px 4px;border-radius:3px">fft(x)</code>
  &nbsp;·&nbsp;
  <code style="color:#c4b5fd;font-size:10px;background:rgba(124,77,255,.15);padding:1px 4px;border-radius:3px">fftfreq(N, 1/fs)</code>
  &nbsp;·&nbsp; koreksi amplitudo:
  <code style="color:#c4b5fd;font-size:10px;background:rgba(124,77,255,.15);padding:1px 4px;border-radius:3px">2|X[k]|/N</code>
</div>

</div>

<script setup>
import { ref } from 'vue'
const copied = ref(false)
const PYTHON = [
  'import numpy as np',
  'from scipy.fft import fft, fftfreq',
  '',
  'fs = 1000          # frekuensi sampling [Hz]',
  'T  = 1.0           # durasi [s]',
  'N  = int(T * fs)   # 1000 sampel',
  '',
  't = np.linspace(0, T, N, endpoint=False)',
  '# Sinyal uji: 50 Hz (amp=3) + 120 Hz (amp=1)',
  'x = 3*np.sin(2*np.pi*50*t) + np.sin(2*np.pi*120*t)',
  '',
  '# Hitung FFT',
  'X     = fft(x)',
  'freqs = fftfreq(N, 1/fs)',
  '',
  '# Spektrum sisi positif + koreksi amplitudo',
  'mask = freqs >= 0',
  'amp  = 2 * np.abs(X[mask]) / N',
  'f    = freqs[mask]',
  '',
  '# Puncak di 50 Hz (amp≈3) dan 120 Hz (amp≈1) ✓'
].join('\n')
function copyCode() {
  navigator.clipboard.writeText(PYTHON).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  })
}
</script>

---
layout: default
title: "Resolusi Frekuensi & Desain Akuisisi"
class: tight
---


<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:10px">
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-left:3px solid #00e5ff;border-radius:8px;padding:14px">
<div style="color:#67e8f9;font-weight:700;margin-bottom:8px">Resolusi Frekuensi</div>

$\displaystyle \Delta f = \frac{f_s}{N} = \frac{1}{T_{total}}$

Makin panjang rekaman → $\Delta f$ lebih kecil → dapat membedakan frekuensi yang berdekatan

</div>
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-left:3px solid #34d399;border-radius:8px;padding:14px">
<div style="color:#6ee7b7;font-weight:700;margin-bottom:8px">Frekuensi Nyquist</div>

$\displaystyle f_{Nyq} = \frac{f_s}{2}$

Batas frekuensi tertinggi yang bisa dianalisis. Standar industri: $f_s \geq 2.56\,f_{\max}$

</div>
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-left:3px solid #a78bfa;border-radius:8px;padding:14px">
<div style="color:#fbbf24;font-weight:700;margin-bottom:8px">Spectral Lines</div>

$\displaystyle N_{lines} = N / 2.56$

$N=1024$ → 400 lines
$N=2048$ → 800 lines
$N=4096$ → 1600 lines

</div>
</div>

<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:14px;margin-top:14px">
<div style="color:#a78bfa;font-weight:700;margin-bottom:8px">Prosedur Desain Akuisisi — Contoh Langkah demi Langkah</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;font-size:12px;color:#94a3b8">
<div style="background:#060c18;border-radius:6px;padding:10px;text-align:center">
<div style="color:#67e8f9;font-weight:700;margin-bottom:4px">① Tentukan f<sub>max</sub></div>
<div>Frekuensi tertinggi yang dianalisis<br/><strong style="color:#a78bfa">misal: 500 Hz</strong></div>
</div>
<div style="background:#060c18;border-radius:6px;padding:10px;text-align:center">
<div style="color:#6ee7b7;font-weight:700;margin-bottom:4px">② Tentukan f<sub>s</sub></div>
<div>$f_s = 2.56 \times 500$<br/><strong style="color:#a78bfa">= 1280 Hz</strong></div>
</div>
<div style="background:#060c18;border-radius:6px;padding:10px;text-align:center">
<div style="color:#fbbf24;font-weight:700;margin-bottom:4px">③ Tentukan &Delta;f</div>
<div>Resolusi yang diinginkan<br/><strong style="color:#a78bfa">misal: 0.5 Hz</strong></div>
</div>
<div style="background:#060c18;border-radius:6px;padding:10px;text-align:center">
<div style="color:#c4b5fd;font-weight:700;margin-bottom:4px">④ Hitung N & T</div>
<div>$N = 1280/0.5 = 2560$<br/><strong style="color:#a78bfa">T = 2 detik</strong></div>
</div>
</div>
</div>

---
layout: default
title: "Teorema Nyquist & Aliasing"
class: tight
---


<AliasingDemo />

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px">
<Callout type="concept" title="Teorema Nyquist-Shannon">
Untuk merekonstruksi sinyal tanpa distorsi, sampling rate minimal dua kali frekuensi tertinggi:

$$f_s \geq 2\,f_{\max}$$

Jika dilanggar → aliasing: $f_{alias} = |f_{sinyal} - n \cdot f_s|$
</Callout>
<Callout type="warning" title="Pencegahan Aliasing">

<strong>Anti-aliasing filter (wajib):</strong> Low-pass filter analog dipasang sebelum ADC, memotong di $f_s/2$. Tanpa filter ini, energi di atas Nyquist terlipat ke spektrum — menyebabkan <strong>salah diagnosis kerusakan mesin</strong>.

</Callout>
</div>

---
layout: default
title: "Windowing — Mengatasi Spectral Leakage"
class: tight
---


**Masalah:** DFT mengasumsikan sinyal periodik sempurna dalam window. Sinyal nyata tidak berakhir di nol → diskontinuitas di tepi → energi bocor ke bin frekuensi tetangga (*spectral leakage*).

**Solusi:** kalikan dengan window $w[n]$ yang memudar ke nol: $x_w[n] = x[n] \cdot w[n]$

<div style="display:grid;grid-template-columns:1.1fr 1fr;gap:14px;margin-top:10px">
<div>

| Window | Resolusi | Leakage | Cocok untuk |
|--------|----------|---------|-------------|
| **Rectangular** | Terbaik | Tinggi | Sinyal transien |
| **Hanning** | Baik | Rendah | Getaran stasioner |
| **Hamming** | Baik | Sangat rendah | Sinyal campuran |
| **Flattop** | Rendah | Sangat rendah | Kalibrasi amplitudo |
| **Exponential** | — | — | Impact hammer test |

<Callout type="tip" title="Default Industri">

<strong>Hanning</strong> adalah pilihan default di hampir semua analyzer getaran industri. Setelah windowing, koreksi amplitudo wajib: $A = 2|X[k]|/(N\cdot\bar{w})$

</Callout>

</div>
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:14px">
<div style="color:#a78bfa;font-weight:700;margin-bottom:8px">Hanning Window</div>

$\displaystyle w[n] = 0.5\!\left[1 - \cos\!\left(\frac{2\pi n}{N-1}\right)\right]$

<div style="display:flex;gap:14px;font-size:10.5px;margin:4px 0 2px"><span style="color:#a78bfa">▬ Hanning (memudar)</span><span style="color:#5b9bd5">▬ Rectangular</span></div>
<svg viewBox="0 0 220 86" preserveAspectRatio="none" style="width:100%;height:72px">
  <line x1="10" y1="78" x2="210" y2="78" stroke="rgba(255,255,255,.1)" stroke-width="1"/>
  <path d="M10,78 C60,78 70,8 110,8 C150,8 160,78 210,78" fill="rgba(167,139,250,0.12)" stroke="#a78bfa" stroke-width="2"/>
  <path d="M10,78 L210,78" fill="none" stroke="#00e5ff" stroke-width="1.5" stroke-dasharray="5 4" opacity="0.7"/>
  <text x="10" y="85" fill="#475569" font-size="8">0</text>
  <text x="202" y="85" fill="#475569" font-size="8">N</text>
</svg>

<div style="font-size:12px;color:#94a3b8">Trade-off: leakage turun drastis, resolusi sedikit berkurang (main lobe lebih lebar). Menguntungkan untuk diagnosis mesin.</div>
</div>
</div>

---
layout: default
title: "Spektrum FFT — Interpretasi Output"
class: tight
---


Output DFT adalah $X[k]$ (bilangan kompleks) untuk $k = 0,\ldots,N-1$. Dua kuantitas utama:

<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10px">
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-left:3px solid #00e5ff;border-radius:8px;padding:14px">
<div style="color:#67e8f9;font-weight:700;margin-bottom:8px">Spektrum Amplitudo</div>

$\displaystyle |X[k]| = \sqrt{\text{Re}^2(X[k]) + \text{Im}^2(X[k])}$

Koreksi untuk sinyal real (single-sided):
$\displaystyle A_k = \frac{2\,|X[k]|}{N} \;(k>0); \quad A_0 = \frac{|X[0]|}{N}$

**Power Spectral Density:**
$\displaystyle S_{xx}[k] = \frac{|X[k]|^2}{\Delta f} \quad [\text{m}^2/\text{Hz}]$

</div>
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-left:3px solid #a78bfa;border-radius:8px;padding:14px">
<div style="color:#fbbf24;font-weight:700;margin-bottom:8px">Spektrum Fasa</div>

$\displaystyle \angle X[k] = \arctan\!\left(\frac{\text{Im}(X[k])}{\text{Re}(X[k])}\right)$

**Penggunaan:**
- Balancing rotor (koreksi massa & sudut)
- Analisis modal — ODS
- Pengukuran transfer function

**RMS dari spektrum:**
$\displaystyle x_{rms} = \sqrt{\sum_k |X[k]|^2 / N^2}$

<div style="font-size:12px;color:#94a3b8;margin-top:8px">Untuk diagnosis rutin, cukup amplitudo. Fasa dibutuhkan untuk analisis kuantitatif lanjut.</div>
</div>
</div>

---
layout: default
title: "Prosedur Analisis FFT Getaran Mesin"
class: tight
---


<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0">
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;text-align:center">
<div style="font-size:28px;margin-bottom:6px">📡</div>
<div style="color:#67e8f9;font-weight:700;font-size:13px;margin-bottom:4px">① Akuisisi</div>
<div style="font-size:11px;color:#94a3b8">Akselerometer → kondisioner → ADC → rekam $x[n]$</div>
</div>
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;text-align:center">
<div style="font-size:28px;margin-bottom:6px">🔲</div>
<div style="color:#6ee7b7;font-weight:700;font-size:13px;margin-bottom:4px">② Preprocessing</div>
<div style="font-size:11px;color:#94a3b8">Anti-alias filter, detrending DC, windowing (Hanning)</div>
</div>
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;text-align:center">
<div style="font-size:28px;margin-bottom:6px">⚡</div>
<div style="color:#fbbf24;font-weight:700;font-size:13px;margin-bottom:4px">③ FFT</div>
<div style="font-size:11px;color:#94a3b8">Hitung $X[k]$, koreksi amplitudo, plot spektrum</div>
</div>
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;text-align:center">
<div style="font-size:28px;margin-bottom:6px">🔍</div>
<div style="color:#c4b5fd;font-weight:700;font-size:13px;margin-bottom:4px">④ Interpretasi</div>
<div style="font-size:11px;color:#94a3b8">Identifikasi puncak, bandingkan baseline</div>
</div>
</div>

<Callout type="industry" title="Praktik di Lapangan">
Analyzer industri (Brüel & Kjær, SKF, Fluke) menjalankan loop ini otomatis setiap beberapa detik — merekam, menghitung FFT, membandingkan dengan alarm threshold. Alert dikirim via email/SMS jika spektrum menyimpang dari baseline.
</Callout>

<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;margin-top:10px;font-size:13px">
<strong style="color:#a78bfa">Tip kualitas data:</strong> <span style="color:#94a3b8">Ambil 5–10 average FFT (synchronous averaging) untuk menekan noise acak. Pastikan mesin beroperasi pada RPM konstan selama akuisisi.</span>
</div>

---
layout: default
title: "Pola Spektrum & Diagnosis Kerusakan Mesin"
class: tight
---


Setelah FFT dihitung, identifikasi puncak berdasarkan $f_{rot}$ = RPM/60:

<div style="margin:10px 0;font-size:13px">

| Frekuensi Puncak | Rasio thd $f_{rot}$ | Sumber / Diagnosis |
|------------------|---------------------|--------------------|
| $f_{rot}$ | $1\times$ | **Unbalance** — ketidakseimbangan massa rotor |
| $2f_{rot}$ | $2\times$ | **Misalignment** aksial atau angular |
| $3f_{rot}$ dan seterusnya | $n\times$ | **Looseness** — kelonggaran mekanis |
| $f_{mesh} = f_{rot} \times Z$ | — | **Kerusakan gear** ($Z$ = jumlah gigi) |
| $f_{BPFO},\, f_{BPFI},\, f_{BSF}$ | — | **Kerusakan bearing** |
| Sub-harmonik $0.5\times$ | $<1\times$ | **Oil whirl** pada bantalan luncur |

</div>

<Callout type="analogy">

Membaca spektrum FFT mesin seperti membaca EKG jantung: tiap "ketidaknormalan" puncak pada frekuensi tertentu menunjuk ke sumber masalah spesifik. Mekanik berpengalaman langsung tahu arti pola $1\times$, $2\times$, dan sideband.

</Callout>

<Callout type="industry" title="Contoh Kasus — Turbin 3000 RPM">

$f_{rot}$ = 50 Hz. Tiba-tiba muncul puncak besar di <strong>100 Hz (2×)</strong> dan sidebands di 50 Hz → diagnosis: <strong>misalignment kopling</strong>. Penggantian kopling saat shutdown terjadwal mencegah kerusakan bearing senilai Rp 500 juta.

</Callout>

---
layout: default
title: "FRF & Identifikasi Frekuensi Natural"
class: tight
---


$$H(\omega) = \frac{X(\omega)}{F(\omega)} = \frac{1}{k - m\omega^2 + jc\omega} \qquad |H(\omega)| = \frac{1}{\sqrt{(k-m\omega^2)^2 + (c\omega)^2}}$$

<ResonanceCurve />

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px">
<Callout type="concept" title="Puncak FRF = Frekuensi Natural">

Pada $\omega = \omega_n$: $|H|_{max} = 1/(2k\zeta)$. Metode Half-Power (−3 dB): $\zeta \approx (f_2 - f_1)/(2f_n)$ — cara eksperimental menentukan damping ratio dari kurva FRF.

</Callout>
<Callout type="warning" title="Resonansi — Bahaya Struktural">

Saat frekuensi operasi mesin mendekati $\omega_n$, amplitudo meledak. Jembatan Tacoma Narrows (1940) runtuh karena resonansi angin. Desain mesin wajib memastikan frekuensi operasi <strong>jauh dari</strong> $\omega_n$ struktur.

</Callout>
</div>

---
layout: two-cols
title: "Aplikasi — Predictive Maintenance & Bearing"
class: tight
---


## Frekuensi Cacat Bearing

$N_r$ = jumlah rolling element, $d$ = diameter rolling, $D$ = pitch diameter, $\alpha$ = sudut kontak, $n$ = RPM:

$$f_{BPFO} = \frac{N_r \cdot n}{120}\!\left(1 - \frac{d}{D}\cos\alpha\right)$$

$$f_{BPFI} = \frac{N_r \cdot n}{120}\!\left(1 + \frac{d}{D}\cos\alpha\right)$$

$$f_{BSF} = \frac{D \cdot n}{120d}\!\left[1 - \!\left(\frac{d}{D}\cos\alpha\right)^{\!2}\right]$$

**Ciri khas di spektrum:** Puncak pada $f_{BPFO}$ disertai sidebands berjarak $f_{FTF}$ (cage frequency). Makin banyak harmonik, makin parah kerusakannya.

::right::

<div class="pl-4">

<Callout type="industry" title="Implementasi Skala Besar">
Pabrik baja dan petrokimia memasang sensor akselerometer permanen pada ratusan bearing kritis. Software CBM menghitung FFT otomatis setiap 15 menit, mencocokkan puncak dengan frekuensi cacat bearing, dan mengirim alert dini. <strong>ROI: hemat 60–70% biaya maintenance tak terencana.</strong>
</Callout>

## Tahapan Kerusakan Bearing

<div style="font-size:12px;color:#94a3b8;margin-top:8px">

| Tahap | Indikator Spektrum |
|-------|-------------------|
| **Dini** | $f_{BPFO}$ halus, kurtosis naik |
| **Sedang** | Harmonik $f_{BPFO}$ mulai muncul |
| **Parah** | Sidebands jelas, amplitudo tinggi |
| **Kritis** | Noise broadband, semua harmonik |

</div>

</div>

---
layout: default
title: "Indikator Kondisi Getaran"
class: tight
---


Selain spektrum FFT, indikator statistik domain waktu digunakan untuk monitoring tren:

<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:10px">
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-left:3px solid #00e5ff;border-radius:8px;padding:14px">
<div style="color:#67e8f9;font-weight:700;margin-bottom:8px">RMS</div>

$\displaystyle x_{rms} = \sqrt{\frac{1}{N}\sum_{n=1}^{N}x[n]^2}$

Terkait energi total getaran. Baik untuk tren jangka panjang. Satuan: mm/s (kecepatan).

</div>
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-left:3px solid #34d399;border-radius:8px;padding:14px">
<div style="color:#6ee7b7;font-weight:700;margin-bottom:8px">Crest Factor</div>

$\displaystyle CF = \frac{x_{\text{peak}}}{x_{rms}}$

Normal: $CF \approx 1.4$–$2.0$. Meningkat saat ada impak periodik. Berguna untuk deteksi dini kerusakan bearing.

</div>
<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-left:3px solid #a78bfa;border-radius:8px;padding:14px">
<div style="color:#fbbf24;font-weight:700;margin-bottom:8px">Kurtosis</div>

$\displaystyle K = \frac{\frac{1}{N}\sum(x-\bar{x})^4}{\sigma^4}$

Normal: $K = 3$. Cacat bearing: $K > 6$. Sangat sensitif di tahap awal — lebih baik dari RMS untuk deteksi dini.

</div>
</div>

<div style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;margin-top:12px;font-size:13px;color:#94a3b8">
<strong style="color:#a78bfa">Standar ISO 10816-3</strong> — Batas RMS kecepatan getaran untuk mesin industri: &nbsp;
<strong style="color:#6ee7b7">Baik</strong> &lt;2.3 mm/s &nbsp;|&nbsp;
<strong style="color:#67e8f9">Memuaskan</strong> 2.3–4.5 &nbsp;|&nbsp;
<strong style="color:#fbbf24">Tidak Memuaskan</strong> 4.5–7.1 &nbsp;|&nbsp;
<strong style="color:#fca5a5">Kritis</strong> &gt;7.1 mm/s
</div>

---
layout: default
title: "Implementasi Python — Analisis FFT Lengkap"
class: code-dense
---


```python
import numpy as np
from scipy.fft import fft, fftfreq
from scipy.signal import windows, find_peaks

# Parameter
fs, T = 5000, 2.0                        # sampling [Hz], durasi [s]
N = int(T * fs)                          # 10 000 sampel
t = np.linspace(0, T, N, endpoint=False)
f_rot = 30                               # 1x = 30 Hz (1800 RPM)

# Sinyal simulasi: 1x, 2x, 3x + noise
x = (2.5 * np.sin(2*np.pi * f_rot * t)       # 1x — unbalance
   + 0.8 * np.sin(2*np.pi * 2*f_rot * t)     # 2x — misalignment
   + 0.3 * np.sin(2*np.pi * 3*f_rot * t)     # 3x — looseness
   + 0.1 * np.random.randn(N))               # noise

# Windowing Hanning + FFT
win  = windows.hann(N)
X    = fft(x * win)
freq = fftfreq(N, 1/fs)

# Spektrum amplitudo single-sided (koreksi Hanning)
amp  = 2 * np.abs(X[:N//2]) / (N * np.mean(win))
f    = freq[:N//2]

# Identifikasi puncak otomatis
peaks, _ = find_peaks(amp, height=0.05, distance=int(20/f[1]))
for p in peaks:
    print(f"{f[p]:6.1f} Hz | {amp[p]:.3f} m/s2 | {f[p]/f_rot:.1f}x")
```

---
layout: default
title: "Implementasi MATLAB — Analisis Spektral"
class: code-dense
---


```matlab
%% Analisis FFT Getaran Mesin — Teknik Mesin Universitas Mercu Buana
clear; clc; close all;

% Parameter
fs = 5000;  T = 2.0;  N = fs*T;
t = (0:N-1)/fs;  f_rot = 30;          % 1x = 30 Hz (1800 RPM)

% Sinyal simulasi
x = 2.5*sin(2*pi*f_rot*t) ...         % 1x — unbalance
  + 0.8*sin(2*pi*2*f_rot*t) ...       % 2x — misalignment
  + 0.3*sin(2*pi*3*f_rot*t) ...       % 3x — looseness
  + 0.1*randn(1,N);

% Hanning + FFT + koreksi amplitudo
win = hann(N)';
X   = fft(x .* win);
f   = (0:N/2-1)*fs/N;
amp = 2*abs(X(1:N/2)) / (N*mean(win));

% Visualisasi
subplot(2,1,1);
plot(t(1:fs*0.2), x(1:fs*0.2));
xlabel('Waktu [s]'); ylabel('[m/s2]');
title('Domain Waktu'); grid on;

subplot(2,1,2);
plot(f, amp, 'LineWidth', 1.2);
xlabel('Frekuensi [Hz]'); ylabel('[m/s2]');
title('Spektrum FFT (Hanning window)');
xlim([0 200]);
xline([30 60 90],'--r',{'1x','2x','3x'});
grid on;
```

---
layout: default
title: "Contoh Soal 1 — Identifikasi Sumber Getaran"
class: tight
---


**Soal:** Akselerometer pada poros mengukur getaran mesin yang berputar **1800 RPM**. Spektrum FFT menunjukkan puncak pada: **30 Hz, 60 Hz, 90 Hz, dan 340 Hz**. Tentukan sumber masing-masing!

<v-clicks>

**Langkah 1 — hitung frekuensi rotasi:**
$$f_{rot} = 1800 / 60 = 30\,\text{Hz}$$

**Langkah 2 — identifikasi tiap puncak:**

| Frekuensi | Rasio | Sumber |
|-----------|-------|--------|
| 30 Hz | $1\times$ | **Unbalance** — ketidakseimbangan massa rotor |
| 60 Hz | $2\times$ | **Misalignment** aksial atau keausan bearing |
| 90 Hz | $3\times$ | Harmonik ketiga → kelonggaran mekanis |
| 340 Hz | $11.3\times$ | Bukan harmonik bulat → kemungkinan **gear mesh** |

**Langkah 3 — verifikasi gear mesh:**
Jika roda gigi memiliki $Z$ gigi: $f_{mesh} = f_{rot} \times Z = 30 \times Z$. Untuk 340 Hz → $Z \approx 11.3$ (perlu cek jumlah gigi aktual mesin).

**Kesimpulan:** Mesin mengalami unbalance + misalignment. Perlu balancing rotor dan pengecekan kopling!

</v-clicks>

---
layout: default
title: "Contoh Soal 2 — Identifikasi Parameter Modal via FRF"
class: tight
---


**Soal:** Uji impak (hammer test) pada pelat baja memberikan FRF dengan puncak $f_n = 125$ Hz, titik half-power $f_1 = 121.5$ Hz dan $f_2 = 128.5$ Hz, massa efektif $m = 2.5$ kg. Tentukan $\omega_n$, $\zeta$, $k$, dan $c$!

<v-clicks>

**① Frekuensi natural sudut:**
$$\omega_n = 2\pi \times 125 = \mathbf{785.4\,\text{rad/s}}$$

**② Rasio redaman — metode half-power:**
$$\zeta = \frac{f_2 - f_1}{2f_n} = \frac{128.5 - 121.5}{250} = \mathbf{0.028\;(2.8\%)}$$

**③ Kekakuan:**
$$k = m\,\omega_n^2 = 2.5 \times (785.4)^2 = \mathbf{1.54 \times 10^6\,\text{N/m}}$$

**④ Koefisien redaman:**
$$c = 2m\omega_n\zeta = 2 \times 2.5 \times 785.4 \times 0.028 = \mathbf{110.0\,\text{N·s/m}}$$

**Kesimpulan:** Sistem *lightly damped* ($\zeta = 2.8\%$) — resonansi akan menghasilkan amplifikasi sangat tinggi jika mesin beroperasi di dekat 125 Hz!

</v-clicks>

---
layout: default
title: "Latihan Interaktif"
class: tight
---


<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
<div>
<Quiz :n="1" q="Mesin berputar 1500 RPM. Pada frekuensi berapa (Hz) komponen 2× muncul di spektrum?" :options="['25 Hz','50 Hz','75 Hz','100 Hz']" :answer="1" explain="1× = 1500/60 = 25 Hz. Komponen 2× = 2 × 25 = 50 Hz. Komponen 2× yang dominan mengindikasikan misalignment." />

<Quiz :n="2" q="Sinyal 200 Hz di-sampling pada fs = 350 Hz. Berapakah frekuensi alias yang muncul?" :options="['150 Hz','50 Hz','200 Hz','175 Hz']" :answer="0" explain="|f_sinyal - n·f_s| = |200 - 1×350| = 150 Hz. Karena fs=350 < 2×200=400 (melanggar Nyquist), terjadi aliasing ke 150 Hz." />

<Quiz :n="3" q="Mengapa window Hanning digunakan sebelum FFT pada sinyal stasioner?" :options="['Mempercepat komputasi FFT','Meningkatkan resolusi frekuensi','Mengurangi spectral leakage di tepi window','Menambah jumlah sampel efektif']" :answer="2" explain="Window Hanning memudar sinyal ke nol di kedua ujung, menghilangkan diskontinuitas yang menyebabkan energi bocor ke bin frekuensi tetangga." />
</div>
<div>
<Quiz :n="4" q="Resolusi frekuensi FFT jika merekam sinyal selama 5 detik dengan fs = 4000 Hz?" :options="['0.5 Hz','0.2 Hz','4 Hz','0.8 Hz']" :answer="1" explain="df = 1/T_total = 1/5 = 0.2 Hz. Atau: N = 4000x5 = 20000, df = fs/N = 4000/20000 = 0.2 Hz." />

<Quiz :n="5" q="Puncak FFT pada frekuensi 3× RPM yang kuat mengindikasikan apa?" :options="['Unbalance massa rotor','Misalignment kopling','Looseness — kelonggaran mekanis','Kerusakan bearing']" :answer="2" explain="Harmonik ke-3 (3x) dan seterusnya yang menonjol adalah tanda klasik mechanical looseness. Unbalance dominan di 1x, misalignment di 1x dan 2x." />

<Quiz :n="6" q="Nilai Kurtosis sinyal getaran NORMAL (Gaussian) mendekati berapa?" :options="['0','1','3','10']" :answer="2" explain="Distribusi Gaussian murni memiliki kurtosis = 3. Nilai K > 6 mengindikasikan impak periodik seperti cacat bearing." />
</div>
</div>

---
layout: default
title: "Rangkuman"
class: tight
---


<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:10px">
<div>

### Konsep DFT/FFT

<v-clicks>

- **DFT:** $N$ sampel $x[n]$ → $N$ komponen spektral $X[k]$; bin ke-$k$ mewakili frekuensi $f_k = k\cdot f_s/N$
- **FFT:** algoritma Cooley-Tukey $\mathcal{O}(N\log_2 N)$ — ~100× lebih cepat dari DFT langsung
- **Resolusi:** $\Delta f = 1/T_{total}$ — makin panjang rekaman, makin detail spektrum
- **Aliasing:** wajib $f_s \geq 2f_{max}$ + anti-alias filter analog sebelum ADC
- **Windowing:** Hanning untuk sinyal stasioner; koreksi amplitudo setelahnya

</v-clicks>

</div>
<div>

### Aplikasi & Diagnosis

<v-clicks>

- **Pola spektrum:** $1\times$ = unbalance; $2\times$ = misalignment; $n\times$ = looseness
- **Gear & bearing:** $f_{mesh} = f_{rot} \times Z$; $f_{BPFO/BPFI}$ dari formula geometri bearing
- **FRF:** identifikasi $\omega_n$ dan $\zeta$ dari uji impak; metode half-power bandwidth
- **Indikator kondisi:** RMS (energi total), Crest Factor (impak), Kurtosis (deteksi dini bearing)
- **ISO 10816-3:** batas RMS kecepatan — panduan keputusan shutdown mesin

</v-clicks>

</div>
</div>

<div v-click style="background:#0d1526;border:1px solid rgba(255,255,255,.08);border-left:3px solid #a78bfa;border-radius:8px;padding:14px;margin-top:14px">
<strong style="color:#a78bfa">Pesan Kunci:</strong> <span style="color:#94a3b8">FFT adalah alat utama diagnosis getaran mesin. Dari sinyal waktu yang sulit dibaca, FFT menghasilkan spektrum yang langsung menunjuk ke sumber masalah — unbalance, misalignment, bearing, atau gear. Inilah fondasi predictive maintenance modern.</span>
</div>

---
layout: default
title: "Referensi"
---


<div style="margin-top:8px;font-size:13px;color:#94a3b8;line-height:1.9">

1. **Brandt, A.** (2011). *Noise and Vibration Analysis: Signal Analysis and Experimental Procedures*. Wiley. *(Referensi utama — DFT/FFT praktis)*

2. **Rao, S.S.** (2018). *Mechanical Vibrations*, 6th Ed. Pearson Education. *(FRF & modal analysis)*

3. **Randall, R.B.** (2021). *Vibration-based Condition Monitoring*, 2nd Ed. Wiley. *(Predictive maintenance & bearing diagnosis)*

4. **Cooley, J.W. & Tukey, J.W.** (1965). An Algorithm for the Machine Calculation of Complex Fourier Series. *Mathematics of Computation*, 19(90), 297–301.

5. **Proakis, J.G. & Manolakis, D.G.** (2006). *Digital Signal Processing*, 4th Ed. Pearson. *(DFT, FFT, windowing mendalam)*

6. **ISO 10816-3:2009** — Mechanical vibration — Evaluation of machine vibration by measurements on non-rotating parts.

7. **Dokumentasi:** scipy.fft — scipy.org/doc/scipy/reference/fft.html

</div>

---
layout: center
class: text-center
title: "Terima Kasih"
---


**Ada pertanyaan?**

<div style="margin-top:24px;color:#94a3b8;line-height:2.2">

Dedik Romahadi, S.T., M.T.<br/>
<span style="color:#a78bfa">📧</span> dedik.romahadi@mercubuana.ac.id<br/>
Program Studi Teknik Mesin — Universitas Mercu Buana

</div>

<div style="margin-top:20px">
<svg viewBox="0 0 400 60" style="width:360px;height:50px;display:block;margin:0 auto">
  <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,.08)" stroke-width="1"/>
  <rect x="30"  y="10" width="8" height="40" rx="2" fill="#a78bfa" opacity="0.9"/>
  <rect x="50"  y="20" width="8" height="30" rx="2" fill="#a78bfa" opacity="0.7"/>
  <rect x="70"  y="5"  width="8" height="50" rx="2" fill="#a78bfa" opacity="0.95"/>
  <rect x="90"  y="15" width="8" height="30" rx="2" fill="#00e5ff" opacity="0.8"/>
  <rect x="110" y="8"  width="8" height="44" rx="2" fill="#a78bfa" opacity="0.9"/>
  <rect x="130" y="22" width="8" height="16" rx="2" fill="#34d399" opacity="0.7"/>
  <rect x="150" y="18" width="8" height="24" rx="2" fill="#a78bfa" opacity="0.6"/>
  <rect x="170" y="12" width="8" height="36" rx="2" fill="#00e5ff" opacity="0.5"/>
  <rect x="190" y="25" width="8" height="10" rx="2" fill="#a78bfa" opacity="0.4"/>
  <rect x="210" y="20" width="8" height="20" rx="2" fill="#34d399" opacity="0.5"/>
  <rect x="230" y="28" width="8" height="4"  rx="2" fill="#a78bfa" opacity="0.3"/>
  <rect x="250" y="15" width="8" height="30" rx="2" fill="#a78bfa" opacity="0.4"/>
  <rect x="270" y="22" width="8" height="16" rx="2" fill="#00e5ff" opacity="0.3"/>
  <rect x="290" y="26" width="8" height="8"  rx="2" fill="#a78bfa" opacity="0.25"/>
  <rect x="310" y="28" width="8" height="4"  rx="2" fill="#34d399" opacity="0.2"/>
  <rect x="330" y="29" width="8" height="2"  rx="2" fill="#a78bfa" opacity="0.15"/>
  <rect x="350" y="29" width="8" height="2"  rx="2" fill="#a78bfa" opacity="0.1"/>
</svg>
<div style="font-size:11px;color:#334155;margin-top:4px">Spektrum FFT sinyal getaran mesin</div>
</div>

<div style="margin-top:10px;font-size:11px;color:#334155">
Getaran Mekanik — S1 Teknik Mesin — Universitas Mercu Buana — Semester Genap 2025/2026
</div>
