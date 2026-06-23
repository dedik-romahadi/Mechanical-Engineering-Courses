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

<div class="cover" style="background:#191813;position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden;color:#f5f3ee;">

  <div class="wave-track">
    <svg viewBox="0 0 2880 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,40.0 C2.5,38.9 10.0,35.1 15,33.6 C20.0,32.1 25.0,30.9 30,30.8 C35.0,30.7 40.0,31.8 45,32.8 C50.0,33.8 55.0,35.5 60,36.7 C65.0,37.9 70.0,38.8 75,40.0 C80.0,41.2 85.0,42.2 90,43.7 C95.0,45.2 100.0,47.4 105,48.9 C110.0,50.4 115.0,52.5 120,52.7 C125.0,52.9 130.0,52.1 135,50.0 C140.0,47.9 145.0,43.5 150,40.0 C155.0,36.5 160.0,31.8 165,29.3 C170.0,26.9 175.0,25.4 180,25.3 C185.0,25.2 190.0,27.3 195,28.9 C200.0,30.5 205.0,33.1 210,35.0 C215.0,36.9 220.0,38.3 225,40.0 C230.0,41.7 235.0,43.2 240,45.2 C245.0,47.2 250.0,50.2 255,52.1 C260.0,54.0 265.0,56.7 270,56.8 C275.0,56.9 280.0,55.6 285,52.8 C290.0,50.0 295.0,44.3 300,40.0 C305.0,35.7 310.0,29.8 315,26.9 C320.0,24.0 325.0,22.5 330,22.5 C335.0,22.5 340.0,25.1 345,27.1 C350.0,29.1 355.0,32.2 360,34.4 C365.0,36.5 370.0,38.1 375,40.0 C380.0,41.9 385.0,43.5 390,45.6 C395.0,47.7 400.0,50.8 405,52.7 C410.0,54.6 415.0,57.2 420,57.2 C425.0,57.2 430.0,55.7 435,52.8 C440.0,49.9 445.0,44.2 450,40.0 C455.0,35.8 460.0,30.2 465,27.5 C470.0,24.8 475.0,23.6 480,23.7 C485.0,23.8 490.0,26.4 495,28.3 C500.0,30.2 505.0,33.0 510,35.0 C515.0,37.0 520.0,38.4 525,40.0 C530.0,41.6 535.0,43.0 540,44.7 C545.0,46.5 550.0,49.0 555,50.5 C560.0,52.0 565.0,53.9 570,53.8 C575.0,53.7 580.0,52.3 585,50.0 C590.0,47.7 595.0,43.2 600,40.0 C605.0,36.8 610.0,32.7 615,30.8 C620.0,28.9 625.0,28.2 630,28.4 C635.0,28.6 640.0,30.5 645,31.9 C650.0,33.3 655.0,35.4 660,36.7 C665.0,38.1 670.0,39.0 675,40.0 C680.0,41.0 685.0,41.9 690,42.9 C695.0,43.9 700.0,45.5 705,46.3 C710.0,47.1 715.0,47.9 720,47.9 C725.0,47.9 730.0,47.7 735,46.4 C740.0,45.1 745.0,42.3 750,40.0 C755.0,37.7 760.0,34.3 765,32.6 C770.0,30.9 775.0,29.7 780,29.6 C785.0,29.5 790.0,30.8 795,31.9 C800.0,33.0 805.0,34.9 810,36.3 C815.0,37.6 820.0,38.7 825,40.0 C830.0,41.3 835.0,42.5 840,44.1 C845.0,45.7 850.0,48.1 855,49.7 C860.0,51.3 865.0,53.6 870,53.8 C875.0,54.0 880.0,53.0 885,50.7 C890.0,48.4 895.0,43.7 900,40.0 C905.0,36.3 910.0,31.2 915,28.6 C920.0,26.0 925.0,24.4 930,24.4 C935.0,24.3 940.0,26.6 945,28.3 C950.0,30.0 955.0,32.8 960,34.8 C965.0,36.8 970.0,38.2 975,40.0 C980.0,41.8 985.0,43.3 990,45.4 C995.0,47.5 1000.0,50.5 1005,52.5 C1010.0,54.5 1015.0,57.1 1020,57.2 C1025.0,57.3 1030.0,56.0 1035,53.1 C1040.0,50.2 1045.0,44.4 1050,40.0 C1055.0,35.6 1060.0,29.7 1065,26.8 C1070.0,23.9 1075.0,22.3 1080,22.4 C1085.0,22.4 1090.0,25.1 1095,27.1 C1100.0,29.1 1105.0,32.2 1110,34.4 C1115.0,36.5 1120.0,38.1 1125,40.0 C1130.0,41.9 1135.0,43.4 1140,45.5 C1145.0,47.6 1150.0,50.6 1155,52.5 C1160.0,54.4 1165.0,56.8 1170,56.8 C1175.0,56.8 1180.0,55.3 1185,52.5 C1190.0,49.7 1195.0,44.1 1200,40.0 C1205.0,35.9 1210.0,30.6 1215,28.0 C1220.0,25.4 1225.0,24.2 1230,24.4 C1235.0,24.5 1240.0,27.1 1245,28.9 C1250.0,30.7 1255.0,33.4 1260,35.3 C1265.0,37.1 1270.0,38.5 1275,40.0 C1280.0,41.5 1285.0,42.8 1290,44.4 C1295.0,46.0 1300.0,48.3 1305,49.7 C1310.0,51.1 1315.0,52.8 1320,52.7 C1325.0,52.6 1330.0,51.3 1335,49.2 C1340.0,47.1 1345.0,42.9 1350,40.0 C1355.0,37.1 1360.0,33.4 1365,31.7 C1370.0,30.0 1375.0,29.4 1380,29.6 C1385.0,29.8 1390.0,31.5 1395,32.8 C1400.0,34.0 1405.0,35.9 1410,37.1 C1415.0,38.3 1420.0,39.1 1425,40.0 C1430.0,40.9 1435.0,41.5 1440,42.5 C1445.0,43.5 1450.0,45.2 1455,46.3 C1460.0,47.4 1465.0,49.0 1470,49.2 C1475.0,49.4 1480.0,48.9 1485,47.4 C1490.0,45.9 1495.0,42.6 1500,40.0 C1505.0,37.4 1510.0,33.6 1515,31.7 C1520.0,29.8 1525.0,28.5 1530,28.4 C1535.0,28.3 1540.0,29.9 1545,31.1 C1550.0,32.4 1555.0,34.4 1560,35.9 C1565.0,37.4 1570.0,38.6 1575,40.0 C1580.0,41.4 1585.0,42.6 1590,44.4 C1595.0,46.1 1600.0,48.8 1605,50.5 C1610.0,52.2 1615.0,54.6 1620,54.7 C1625.0,54.9 1630.0,53.9 1635,51.4 C1640.0,48.9 1645.0,43.9 1650,40.0 C1655.0,36.1 1660.0,30.7 1665,28.0 C1670.0,25.3 1675.0,23.7 1680,23.7 C1685.0,23.7 1690.0,26.1 1695,27.9 C1700.0,29.7 1705.0,32.6 1710,34.6 C1715.0,36.6 1720.0,38.2 1725,40.0 C1730.0,41.8 1735.0,43.4 1740,45.5 C1745.0,47.6 1750.0,50.7 1755,52.7 C1760.0,54.7 1765.0,57.4 1770,57.5 C1775.0,57.6 1780.0,56.1 1785,53.2 C1790.0,50.3 1795.0,44.4 1800,40.0 C1805.0,35.6 1810.0,29.7 1815,26.8 C1820.0,23.9 1825.0,22.4 1830,22.5 C1835.0,22.6 1840.0,25.3 1845,27.3 C1850.0,29.3 1855.0,32.4 1860,34.5 C1865.0,36.6 1870.0,38.2 1875,40.0 C1880.0,41.8 1885.0,43.4 1890,45.4 C1895.0,47.4 1900.0,50.3 1905,52.1 C1910.0,53.9 1915.0,56.3 1920,56.3 C1925.0,56.3 1930.0,54.7 1935,52.0 C1940.0,49.3 1945.0,43.9 1950,40.0 C1955.0,36.1 1960.0,31.1 1965,28.6 C1970.0,26.2 1975.0,25.2 1980,25.3 C1985.0,25.4 1990.0,27.8 1995,29.5 C2000.0,31.2 2005.0,33.9 2010,35.6 C2015.0,37.4 2020.0,38.6 2025,40.0 C2030.0,41.4 2035.0,42.6 2040,44.1 C2045.0,45.6 2050.0,47.6 2055,48.9 C2060.0,50.1 2065.0,51.7 2070,51.6 C2075.0,51.5 2080.0,50.2 2085,48.3 C2090.0,46.4 2095.0,42.6 2100,40.0 C2105.0,37.4 2110.0,34.1 2115,32.6 C2120.0,31.1 2125.0,30.6 2130,30.8 C2135.0,31.0 2140.0,32.6 2145,33.7 C2150.0,34.8 2155.0,36.5 2160,37.5 C2165.0,38.5 2170.0,39.1 2175,40.0 C2180.0,40.9 2185.0,41.7 2190,42.9 C2195.0,44.1 2200.0,46.0 2205,47.2 C2210.0,48.5 2215.0,50.2 2220,50.4 C2225.0,50.6 2230.0,50.0 2235,48.3 C2240.0,46.6 2245.0,42.9 2250,40.0 C2255.0,37.1 2260.0,32.9 2265,30.8 C2270.0,28.7 2275.0,27.4 2280,27.3 C2285.0,27.2 2290.0,28.9 2295,30.3 C2300.0,31.7 2305.0,34.0 2310,35.6 C2315.0,37.2 2320.0,38.5 2325,40.0 C2330.0,41.5 2335.0,42.9 2340,44.7 C2345.0,46.6 2350.0,49.3 2355,51.1 C2360.0,52.9 2365.0,55.5 2370,55.6 C2375.0,55.8 2380.0,54.6 2385,52.0 C2390.0,49.4 2395.0,44.1 2400,40.0 C2405.0,35.9 2410.0,30.3 2415,27.5 C2420.0,24.7 2425.0,23.2 2430,23.2 C2435.0,23.2 2440.0,25.6 2445,27.5 C2450.0,29.4 2455.0,32.4 2460,34.5 C2465.0,36.6 2470.0,38.1 2475,40.0 C2480.0,41.9 2485.0,43.5 2490,45.6 C2495.0,47.8 2500.0,50.9 2505,52.9 C2510.0,54.9 2515.0,57.5 2520,57.6 C2525.0,57.7 2530.0,56.1 2535,53.2 C2540.0,50.3 2545.0,44.4 2550,40.0 C2555.0,35.6 2560.0,29.8 2565,26.9 C2570.0,24.0 2575.0,22.7 2580,22.8 C2585.0,22.9 2590.0,25.5 2595,27.5 C2600.0,29.5 2605.0,32.5 2610,34.6 C2615.0,36.7 2620.0,38.2 2625,40.0 C2630.0,41.8 2635.0,43.2 2640,45.2 C2645.0,47.2 2650.0,50.0 2655,51.7 C2660.0,53.4 2665.0,55.7 2670,55.6 C2675.0,55.5 2680.0,54.0 2685,51.4 C2690.0,48.8 2695.0,43.7 2700,40.0 C2705.0,36.3 2710.0,31.6 2715,29.3 C2720.0,27.0 2725.0,26.0 2730,26.2 C2735.0,26.4 2740.0,28.7 2745,30.3 C2750.0,31.9 2755.0,34.3 2760,35.9 C2765.0,37.5 2770.0,38.7 2775,40.0 C2780.0,41.3 2785.0,42.4 2790,43.7 C2795.0,45.1 2800.0,47.0 2805,48.1 C2810.0,49.2 2815.0,50.5 2820,50.4 C2825.0,50.3 2830.0,49.1 2835,47.4 C2840.0,45.7 2845.0,42.3 2850,40.0 C2855.0,37.7 2860.0,34.9 2865,33.6 C2870.0,32.3 2877.5,32.4 2880,32.1" fill="none" stroke="rgba(200,146,42,0.55)" stroke-width="1.6"/>
    </svg>
  </div>
  <div class="wave-track w2">
    <svg viewBox="0 0 2880 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,34.4 C3.0,34.4 12.0,34.1 18,34.5 C24.0,34.9 30.0,35.9 36,36.7 C42.0,37.5 48.0,38.5 54,39.2 C60.0,40.0 66.0,40.5 72,41.2 C78.0,41.9 84.0,42.4 90,43.2 C96.0,44.0 102.0,45.0 108,45.8 C114.0,46.5 120.0,47.5 126,47.7 C132.0,47.9 138.0,47.8 144,46.8 C150.0,45.8 156.0,43.8 162,41.8 C168.0,39.8 174.0,36.8 180,34.9 C186.0,33.0 192.0,31.0 198,30.2 C204.0,29.4 210.0,29.7 216,30.3 C222.0,30.9 228.0,32.6 234,34.0 C240.0,35.4 246.0,37.1 252,38.4 C258.0,39.7 264.0,40.6 270,41.6 C276.0,42.6 282.0,43.4 288,44.4 C294.0,45.4 300.0,46.8 306,47.8 C312.0,48.8 318.0,50.3 324,50.6 C330.0,50.9 336.0,50.8 342,49.6 C348.0,48.4 354.0,45.8 360,43.3 C366.0,40.8 372.0,36.9 378,34.4 C384.0,31.9 390.0,29.4 396,28.3 C402.0,27.2 408.0,27.3 414,28.0 C420.0,28.7 426.0,30.8 432,32.4 C438.0,34.0 444.0,36.1 450,37.6 C456.0,39.1 462.0,40.3 468,41.4 C474.0,42.5 480.0,43.3 486,44.4 C492.0,45.5 498.0,46.8 504,47.9 C510.0,49.0 516.0,50.4 522,50.8 C528.0,51.2 534.0,51.2 540,50.1 C546.0,49.0 552.0,46.5 558,44.1 C564.0,41.7 570.0,38.0 576,35.5 C582.0,33.0 588.0,30.4 594,29.3 C600.0,28.2 606.0,28.1 612,28.7 C618.0,29.2 624.0,31.1 630,32.6 C636.0,34.1 642.0,36.1 648,37.5 C654.0,38.9 660.0,39.9 666,40.9 C672.0,41.9 678.0,42.5 684,43.4 C690.0,44.3 696.0,45.3 702,46.1 C708.0,46.9 714.0,48.1 720,48.4 C726.0,48.7 732.0,48.8 738,48.0 C744.0,47.2 750.0,45.5 756,43.7 C762.0,42.0 768.0,39.3 774,37.5 C780.0,35.7 786.0,33.8 792,32.9 C798.0,32.0 804.0,31.9 810,32.2 C816.0,32.5 822.0,33.8 828,34.8 C834.0,35.8 840.0,37.2 846,38.1 C852.0,39.0 858.0,39.8 864,40.4 C870.0,41.0 876.0,41.3 882,41.8 C888.0,42.3 894.0,42.7 900,43.2 C906.0,43.8 912.0,44.7 918,45.1 C924.0,45.5 930.0,46.0 936,45.7 C942.0,45.4 948.0,44.6 954,43.4 C960.0,42.2 966.0,40.0 972,38.4 C978.0,36.8 984.0,34.7 990,33.6 C996.0,32.5 1002.0,31.7 1008,31.7 C1014.0,31.7 1020.0,32.7 1026,33.6 C1032.0,34.5 1038.0,36.0 1044,37.1 C1050.0,38.2 1056.0,39.3 1062,40.2 C1068.0,41.1 1074.0,41.7 1080,42.6 C1086.0,43.5 1092.0,44.4 1098,45.4 C1104.0,46.4 1110.0,47.8 1116,48.5 C1122.0,49.2 1128.0,49.9 1134,49.5 C1140.0,49.1 1146.0,47.8 1152,46.0 C1158.0,44.2 1164.0,41.0 1170,38.5 C1176.0,36.0 1182.0,32.8 1188,31.1 C1194.0,29.4 1200.0,28.3 1206,28.2 C1212.0,28.1 1218.0,29.4 1224,30.6 C1230.0,31.8 1236.0,34.1 1242,35.6 C1248.0,37.1 1254.0,38.7 1260,39.9 C1266.0,41.1 1272.0,41.9 1278,43.0 C1284.0,44.1 1290.0,45.1 1296,46.3 C1302.0,47.4 1308.0,49.1 1314,49.9 C1320.0,50.7 1326.0,51.7 1332,51.3 C1338.0,50.9 1344.0,49.6 1350,47.6 C1356.0,45.6 1362.0,42.1 1368,39.3 C1374.0,36.5 1380.0,33.0 1386,31.0 C1392.0,29.0 1398.0,27.6 1404,27.4 C1410.0,27.2 1416.0,28.5 1422,29.8 C1428.0,31.1 1434.0,33.4 1440,35.0 C1446.0,36.6 1452.0,38.2 1458,39.5 C1464.0,40.8 1470.0,41.6 1476,42.6 C1482.0,43.6 1488.0,44.5 1494,45.5 C1500.0,46.5 1506.0,48.0 1512,48.8 C1518.0,49.6 1524.0,50.5 1530,50.2 C1536.0,50.0 1542.0,48.9 1548,47.3 C1554.0,45.6 1560.0,42.6 1566,40.3 C1572.0,37.9 1578.0,34.9 1584,33.2 C1590.0,31.5 1596.0,30.2 1602,29.9 C1608.0,29.6 1614.0,30.6 1620,31.6 C1626.0,32.6 1632.0,34.4 1638,35.7 C1644.0,37.0 1650.0,38.3 1656,39.3 C1662.0,40.3 1668.0,41.0 1674,41.7 C1680.0,42.4 1686.0,42.9 1692,43.6 C1698.0,44.3 1704.0,45.2 1710,45.7 C1716.0,46.2 1722.0,46.8 1728,46.7 C1734.0,46.6 1740.0,45.9 1746,44.9 C1752.0,43.9 1758.0,42.1 1764,40.7 C1770.0,39.3 1776.0,37.5 1782,36.4 C1788.0,35.3 1794.0,34.7 1800,34.4 C1806.0,34.1 1812.0,34.1 1818,34.5 C1824.0,34.9 1830.0,35.9 1836,36.7 C1842.0,37.5 1848.0,38.5 1854,39.2 C1860.0,40.0 1866.0,40.5 1872,41.2 C1878.0,41.9 1884.0,42.4 1890,43.2 C1896.0,44.0 1902.0,45.0 1908,45.8 C1914.0,46.5 1920.0,47.5 1926,47.7 C1932.0,47.9 1938.0,47.8 1944,46.8 C1950.0,45.8 1956.0,43.8 1962,41.8 C1968.0,39.8 1974.0,36.8 1980,34.9 C1986.0,33.0 1992.0,31.0 1998,30.2 C2004.0,29.4 2010.0,29.7 2016,30.3 C2022.0,30.9 2028.0,32.6 2034,34.0 C2040.0,35.4 2046.0,37.1 2052,38.4 C2058.0,39.7 2064.0,40.6 2070,41.6 C2076.0,42.6 2082.0,43.4 2088,44.4 C2094.0,45.4 2100.0,46.8 2106,47.8 C2112.0,48.8 2118.0,50.3 2124,50.6 C2130.0,50.9 2136.0,50.8 2142,49.6 C2148.0,48.4 2154.0,45.8 2160,43.3 C2166.0,40.8 2172.0,36.9 2178,34.4 C2184.0,31.9 2190.0,29.4 2196,28.3 C2202.0,27.2 2208.0,27.3 2214,28.0 C2220.0,28.7 2226.0,30.8 2232,32.4 C2238.0,34.0 2244.0,36.1 2250,37.6 C2256.0,39.1 2262.0,40.3 2268,41.4 C2274.0,42.5 2280.0,43.3 2286,44.4 C2292.0,45.5 2298.0,46.8 2304,47.9 C2310.0,49.0 2316.0,50.4 2322,50.8 C2328.0,51.2 2334.0,51.2 2340,50.1 C2346.0,49.0 2352.0,46.5 2358,44.1 C2364.0,41.7 2370.0,38.0 2376,35.5 C2382.0,33.0 2388.0,30.4 2394,29.3 C2400.0,28.2 2406.0,28.1 2412,28.7 C2418.0,29.2 2424.0,31.1 2430,32.6 C2436.0,34.1 2442.0,36.1 2448,37.5 C2454.0,38.9 2460.0,39.9 2466,40.9 C2472.0,41.9 2478.0,42.5 2484,43.4 C2490.0,44.3 2496.0,45.3 2502,46.1 C2508.0,46.9 2514.0,48.1 2520,48.4 C2526.0,48.7 2532.0,48.8 2538,48.0 C2544.0,47.2 2550.0,45.5 2556,43.7 C2562.0,42.0 2568.0,39.3 2574,37.5 C2580.0,35.7 2586.0,33.8 2592,32.9 C2598.0,32.0 2604.0,31.9 2610,32.2 C2616.0,32.5 2622.0,33.8 2628,34.8 C2634.0,35.8 2640.0,37.2 2646,38.1 C2652.0,39.0 2658.0,39.8 2664,40.4 C2670.0,41.0 2676.0,41.3 2682,41.8 C2688.0,42.3 2694.0,42.7 2700,43.2 C2706.0,43.8 2712.0,44.7 2718,45.1 C2724.0,45.5 2730.0,46.0 2736,45.7 C2742.0,45.4 2748.0,44.6 2754,43.4 C2760.0,42.2 2766.0,40.0 2772,38.4 C2778.0,36.8 2784.0,34.7 2790,33.6 C2796.0,32.5 2802.0,31.7 2808,31.7 C2814.0,31.7 2820.0,32.7 2826,33.6 C2832.0,34.5 2838.0,36.0 2844,37.1 C2850.0,38.2 2856.0,39.3 2862,40.2 C2868.0,41.1 2877.0,42.2 2880,42.6" fill="none" stroke="rgba(200,146,42,0.28)" stroke-width="1.2"/>
    </svg>
  </div>
  <div class="wave-track w3">
    <svg viewBox="0 0 2880 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,34.3 C2.0,35.3 8.0,38.9 12,40.6 C16.0,42.4 20.0,43.5 24,44.8 C28.0,46.1 32.0,47.3 36,48.6 C40.0,49.9 44.0,52.0 48,52.4 C52.0,52.8 56.0,52.9 60,50.8 C64.0,48.7 68.0,43.8 72,39.6 C76.0,35.4 80.0,28.6 84,25.5 C88.0,22.4 92.0,20.2 96,20.7 C100.0,21.2 104.0,25.2 108,28.3 C112.0,31.4 116.0,36.3 120,39.4 C124.0,42.5 128.0,44.6 132,46.7 C136.0,48.8 140.0,50.3 144,52.1 C148.0,53.9 152.0,56.9 156,57.7 C160.0,58.5 164.0,59.3 168,56.8 C172.0,54.3 176.0,48.4 180,42.8 C184.0,37.2 188.0,27.9 192,23.2 C196.0,18.5 200.0,14.7 204,14.6 C208.0,14.5 212.0,19.1 216,22.9 C220.0,26.7 224.0,33.3 228,37.3 C232.0,41.3 236.0,44.3 240,46.9 C244.0,49.5 248.0,50.9 252,53.0 C256.0,55.1 260.0,58.2 264,59.3 C268.0,60.4 272.0,61.9 276,59.8 C280.0,57.6 284.0,52.1 288,46.4 C292.0,40.7 296.0,30.8 300,25.4 C304.0,20.0 308.0,14.9 312,14.1 C316.0,13.3 320.0,17.1 324,20.6 C328.0,24.1 332.0,31.0 336,35.1 C340.0,39.2 344.0,42.8 348,45.5 C352.0,48.2 356.0,49.3 360,51.2 C364.0,53.1 368.0,55.5 372,56.7 C376.0,57.9 380.0,59.6 384,58.2 C388.0,56.8 392.0,52.8 396,48.2 C400.0,43.6 404.0,35.3 408,30.5 C412.0,25.7 416.0,20.6 420,19.4 C424.0,18.1 428.0,20.5 432,23.0 C436.0,25.5 440.0,31.1 444,34.5 C448.0,37.9 452.0,40.9 456,43.1 C460.0,45.3 464.0,46.2 468,47.5 C472.0,48.8 476.0,50.2 480,51.1 C484.0,52.0 488.0,53.3 492,52.6 C496.0,51.9 500.0,49.8 504,47.0 C508.0,44.2 512.0,39.0 516,35.9 C520.0,32.8 524.0,29.2 528,28.1 C532.0,27.0 536.0,28.1 540,29.3 C544.0,30.5 548.0,33.1 552,35.1 C556.0,37.1 560.0,39.7 564,41.5 C568.0,43.3 572.0,44.3 576,45.7 C580.0,47.1 584.0,48.5 588,49.8 C592.0,51.1 596.0,53.4 600,53.4 C604.0,53.4 608.0,52.7 612,50.0 C616.0,47.3 620.0,41.5 624,37.0 C628.0,32.5 632.0,25.9 636,23.2 C640.0,20.5 644.0,19.5 648,20.6 C652.0,21.7 656.0,26.5 660,29.9 C664.0,33.3 668.0,38.0 672,41.0 C676.0,44.0 680.0,45.7 684,47.8 C688.0,49.9 692.0,51.6 696,53.4 C700.0,55.2 704.0,58.3 708,58.7 C712.0,59.1 716.0,58.9 720,55.7 C724.0,52.5 728.0,45.4 732,39.5 C736.0,33.6 740.0,24.5 744,20.4 C748.0,16.3 752.0,13.9 756,14.7 C760.0,15.5 764.0,21.0 768,25.1 C772.0,29.2 776.0,35.5 780,39.3 C784.0,43.1 788.0,45.6 792,48.1 C796.0,50.6 800.0,52.1 804,54.1 C808.0,56.1 812.0,59.4 816,60.1 C820.0,60.8 824.0,61.4 828,58.5 C832.0,55.6 836.0,49.0 840,43.0 C844.0,37.0 848.0,27.3 852,22.5 C856.0,17.7 860.0,14.2 864,14.3 C868.0,14.4 872.0,19.2 876,23.1 C880.0,27.0 884.0,33.5 888,37.4 C892.0,41.3 896.0,44.1 900,46.5 C904.0,48.9 908.0,50.0 912,51.8 C916.0,53.6 920.0,56.2 924,57.1 C928.0,58.0 932.0,59.0 936,57.0 C940.0,55.0 944.0,50.2 948,45.4 C952.0,40.6 956.0,32.5 960,28.2 C964.0,23.9 968.0,20.2 972,19.7 C976.0,19.2 980.0,22.4 984,25.2 C988.0,28.0 992.0,33.3 996,36.4 C1000.0,39.5 1004.0,42.0 1008,43.9 C1012.0,45.8 1016.0,46.5 1020,47.7 C1024.0,48.9 1028.0,50.5 1032,51.1 C1036.0,51.8 1040.0,52.6 1044,51.6 C1048.0,50.6 1052.0,48.0 1056,45.1 C1060.0,42.2 1064.0,37.2 1068,34.4 C1072.0,31.6 1076.0,29.4 1080,28.5 C1084.0,27.6 1088.0,28.0 1092,29.3 C1096.0,30.6 1100.0,33.9 1104,36.1 C1108.0,38.3 1112.0,40.7 1116,42.5 C1120.0,44.3 1124.0,45.3 1128,46.7 C1132.0,48.1 1136.0,49.9 1140,51.1 C1144.0,52.3 1148.0,54.5 1152,54.1 C1156.0,53.7 1160.0,52.1 1164,48.8 C1168.0,45.5 1172.0,38.8 1176,34.2 C1180.0,29.6 1184.0,23.3 1188,21.1 C1192.0,18.9 1196.0,19.1 1200,20.9 C1204.0,22.7 1208.0,28.1 1212,31.7 C1216.0,35.3 1220.0,39.6 1224,42.5 C1228.0,45.4 1232.0,46.9 1236,48.9 C1240.0,50.9 1244.0,53.0 1248,54.8 C1252.0,56.5 1256.0,59.5 1260,59.4 C1264.0,59.3 1268.0,58.0 1272,54.1 C1276.0,50.2 1280.0,42.0 1284,36.0 C1288.0,30.0 1292.0,21.3 1296,17.9 C1300.0,14.4 1304.0,13.7 1308,15.3 C1312.0,16.9 1316.0,23.2 1320,27.5 C1324.0,31.8 1328.0,37.6 1332,41.2 C1336.0,44.8 1340.0,46.8 1344,49.1 C1348.0,51.4 1352.0,53.3 1356,55.2 C1360.0,57.1 1364.0,60.3 1368,60.6 C1372.0,60.9 1376.0,60.3 1380,56.8 C1384.0,53.3 1388.0,45.6 1392,39.5 C1396.0,33.4 1400.0,24.2 1404,20.1 C1408.0,16.0 1412.0,14.1 1416,15.0 C1420.0,15.9 1424.0,21.6 1428,25.7 C1432.0,29.8 1436.0,35.8 1440,39.4 C1444.0,43.0 1448.0,45.1 1452,47.3 C1456.0,49.5 1460.0,50.9 1464,52.5 C1468.0,54.1 1472.0,56.7 1476,57.2 C1480.0,57.7 1484.0,58.0 1488,55.5 C1492.0,53.0 1496.0,47.3 1500,42.4 C1504.0,37.5 1508.0,30.0 1512,26.3 C1516.0,22.6 1520.0,20.2 1524,20.4 C1528.0,20.6 1532.0,24.6 1536,27.5 C1540.0,30.4 1544.0,35.3 1548,38.1 C1552.0,40.9 1556.0,42.9 1560,44.5 C1564.0,46.1 1568.0,46.8 1572,47.9 C1576.0,49.0 1580.0,50.5 1584,50.9 C1588.0,51.3 1592.0,51.7 1596,50.4 C1600.0,49.1 1604.0,45.9 1608,43.1 C1612.0,40.3 1616.0,36.0 1620,33.4 C1624.0,30.8 1628.0,27.8 1632,27.2 C1636.0,26.6 1640.0,27.9 1644,29.5 C1648.0,31.1 1652.0,34.8 1656,37.1 C1660.0,39.4 1664.0,41.7 1668,43.5 C1672.0,45.3 1676.0,46.2 1680,47.7 C1684.0,49.2 1688.0,51.2 1692,52.4 C1696.0,53.5 1700.0,55.5 1704,54.6 C1708.0,53.7 1712.0,51.0 1716,47.1 C1720.0,43.2 1724.0,35.8 1728,31.2 C1732.0,26.6 1736.0,21.0 1740,19.4 C1744.0,17.8 1748.0,19.3 1752,21.7 C1756.0,24.1 1760.0,29.9 1764,33.6 C1768.0,37.3 1772.0,41.2 1776,43.9 C1780.0,46.6 1784.0,48.0 1788,50.0 C1792.0,52.0 1796.0,54.5 1800,56.1 C1804.0,57.7 1808.0,60.5 1812,59.8 C1816.0,59.1 1820.0,56.5 1824,51.9 C1828.0,47.3 1832.0,38.4 1836,32.4 C1840.0,26.4 1844.0,18.6 1848,16.0 C1852.0,13.3 1856.0,14.2 1860,16.5 C1864.0,18.8 1868.0,25.6 1872,30.0 C1876.0,34.4 1880.0,39.5 1884,42.9 C1888.0,46.2 1892.0,47.9 1896,50.1 C1900.0,52.3 1904.0,54.4 1908,56.2 C1912.0,58.0 1916.0,61.0 1920,60.8 C1924.0,60.5 1928.0,58.9 1932,54.7 C1936.0,50.6 1940.0,42.0 1944,35.9 C1948.0,29.8 1952.0,21.5 1956,18.2 C1960.0,14.9 1964.0,14.6 1968,16.3 C1972.0,18.0 1976.0,24.2 1980,28.3 C1984.0,32.4 1988.0,37.8 1992,41.1 C1996.0,44.4 2000.0,46.1 2004,48.1 C2008.0,50.1 2012.0,51.6 2016,53.1 C2020.0,54.6 2024.0,57.1 2028,57.2 C2032.0,57.3 2036.0,56.5 2040,53.6 C2044.0,50.7 2048.0,44.4 2052,39.6 C2056.0,34.8 2060.0,27.8 2064,24.8 C2068.0,21.8 2072.0,20.8 2076,21.6 C2080.0,22.4 2084.0,26.8 2088,29.8 C2092.0,32.8 2096.0,37.1 2100,39.6 C2104.0,42.1 2108.0,43.5 2112,44.9 C2116.0,46.3 2120.0,47.0 2124,48.0 C2128.0,49.0 2132.0,50.4 2136,50.6 C2140.0,50.8 2144.0,50.6 2148,49.1 C2152.0,47.6 2156.0,44.4 2160,41.4 C2164.0,38.4 2168.0,33.9 2172,31.3 C2176.0,28.8 2180.0,26.3 2184,26.1 C2188.0,25.9 2192.0,28.1 2196,30.1 C2200.0,32.1 2204.0,35.9 2208,38.3 C2212.0,40.7 2216.0,42.8 2220,44.5 C2224.0,46.2 2228.0,47.3 2232,48.8 C2236.0,50.3 2240.0,52.7 2244,53.7 C2248.0,54.7 2252.0,56.2 2256,54.7 C2260.0,53.2 2264.0,49.4 2268,45.0 C2272.0,40.6 2276.0,32.7 2280,28.2 C2284.0,23.7 2288.0,19.0 2292,18.1 C2296.0,17.2 2300.0,20.0 2304,22.9 C2308.0,25.8 2312.0,31.8 2316,35.5 C2320.0,39.2 2324.0,42.6 2328,45.2 C2332.0,47.8 2336.0,49.2 2340,51.2 C2344.0,53.2 2348.0,56.0 2352,57.4 C2356.0,58.8 2360.0,61.1 2364,59.7 C2368.0,58.4 2372.0,54.4 2376,49.3 C2380.0,44.1 2384.0,34.6 2388,28.8 C2392.0,23.0 2396.0,16.4 2400,14.6 C2404.0,12.8 2408.0,15.1 2412,18.1 C2416.0,21.1 2420.0,28.1 2424,32.5 C2428.0,36.9 2432.0,41.3 2436,44.4 C2440.0,47.5 2444.0,48.9 2448,51.0 C2452.0,53.1 2456.0,55.6 2460,57.2 C2464.0,58.8 2468.0,61.5 2472,60.6 C2476.0,59.8 2480.0,56.8 2484,52.1 C2488.0,47.4 2492.0,38.4 2496,32.5 C2500.0,26.6 2504.0,19.3 2508,16.9 C2512.0,14.5 2516.0,15.7 2520,18.0 C2524.0,20.3 2528.0,26.8 2532,30.9 C2536.0,35.0 2540.0,39.6 2544,42.6 C2548.0,45.6 2552.0,46.9 2556,48.7 C2560.0,50.5 2564.0,52.2 2568,53.6 C2572.0,55.0 2576.0,57.1 2580,56.8 C2584.0,56.4 2588.0,54.8 2592,51.5 C2596.0,48.2 2600.0,41.5 2604,36.9 C2608.0,32.3 2612.0,26.2 2616,23.9 C2620.0,21.6 2624.0,21.8 2628,23.1 C2632.0,24.5 2636.0,29.1 2640,32.0 C2644.0,34.9 2648.0,38.5 2652,40.7 C2656.0,42.9 2660.0,44.0 2664,45.2 C2668.0,46.4 2672.0,47.2 2676,48.0 C2680.0,48.8 2684.0,50.2 2688,50.1 C2692.0,50.0 2696.0,49.3 2700,47.6 C2704.0,45.9 2708.0,42.8 2712,39.7 C2716.0,36.6 2720.0,31.6 2724,29.2 C2728.0,26.8 2732.0,25.0 2736,25.3 C2740.0,25.6 2744.0,28.5 2748,30.9 C2752.0,33.3 2756.0,37.2 2760,39.6 C2764.0,42.0 2768.0,43.8 2772,45.5 C2776.0,47.2 2780.0,48.4 2784,50.0 C2788.0,51.6 2792.0,54.2 2796,54.9 C2800.0,55.6 2804.0,56.5 2808,54.4 C2812.0,52.3 2816.0,47.3 2820,42.4 C2824.0,37.5 2828.0,29.4 2832,25.2 C2836.0,21.0 2840.0,17.4 2844,17.3 C2848.0,17.2 2852.0,21.0 2856,24.4 C2860.0,27.8 2864.0,33.8 2868,37.5 C2872.0,41.2 2878.0,45.0 2880,46.5" fill="none" stroke="rgba(245,243,238,0.12)" stroke-width="1"/>
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
  background: #191813;
  position: absolute;
  inset: 0;
  display: flex; flex-direction: column;
  overflow: hidden;
  color: #f0ece3;
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
  border-bottom: 1px solid #ffffff;
  background: #111009;
  position: relative; z-index: 10;
}
.hdr-l   { display: flex; align-items: center; gap: 12px; }
.hdr-logo {
  height: 38px; width: auto; object-fit: contain; display: block;
  transform-origin: center;
  animation: logofloat 4.5s ease-in-out infinite;
  filter: drop-shadow(0 0 0 rgba(200,146,42,0));
}
@keyframes logofloat {
  0%   { transform: translateY(0) rotate(0deg) scale(1); filter: drop-shadow(0 0 2px rgba(200,146,42,0.2)); }
  25%  { transform: translateY(-3px) rotate(-1.5deg) scale(1.03); filter: drop-shadow(0 0 7px rgba(200,146,42,0.5)); }
  50%  { transform: translateY(0) rotate(0deg) scale(1); filter: drop-shadow(0 0 3px rgba(200,146,42,0.3)); }
  75%  { transform: translateY(-3px) rotate(1.5deg) scale(1.03); filter: drop-shadow(0 0 7px rgba(200,146,42,0.5)); }
  100% { transform: translateY(0) rotate(0deg) scale(1); filter: drop-shadow(0 0 2px rgba(200,146,42,0.2)); }
}
.hdr-uni  { font-size: 13px; font-weight: 600; color: #ede8df; }
.hdr-dept { font-size: 11px; color: #9a9590; margin-top: 2px; }
.hdr-tag  {
  font-size: 12px; font-weight: 600; color: #c8922a;
  border: 1px solid #c8922a;
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
  text-transform: uppercase; color: #c8922a;
  margin-bottom: 18px;
  animation: fadeup 0.6s ease both;
}
.ttl1 {
  font-size: 52px; font-weight: 800;
  color: #f0ece3; line-height: 1.1; margin: 0;
  animation: fadeup 0.7s 0.1s ease both;
}
.ttl2 {
  font-size: 52px; font-weight: 800;
  color: #c8922a;
  line-height: 1.1; margin: 0 0 20px;
  animation: fadeup 0.7s 0.2s ease both;
}
.fml {
  font-size: 15px; color: #ddd8cf;
  font-family: 'Fira Code', 'Courier New', monospace;
  padding: 10px 24px;
  border-left: 3px solid #c8922a;
  border-top: 1px solid #2e2a21;
  border-right: 1px solid #2e2a21;
  border-bottom: 1px solid #2e2a21;
  border-radius: 0 6px 6px 0;
  background: #1f1c15;
  margin-bottom: 20px;
  animation: fadeup 0.7s 0.3s ease both;
}
.sep {
  width: 0; height: 1px;
  background: #c8922a;
  margin: 0 auto 16px;
  animation: expand 0.9s 0.4s ease both;
}
@keyframes expand { to { width: 60px; } }
.au { display: flex; flex-direction: column; gap: 4px; animation: fadeup 0.7s 0.5s ease both; }
.au-name { font-size: 17px; font-weight: 600; color: #f0ece3; }
.au-sem  { font-size: 12px; color: #9a9590; }
.spectrum {
  display: flex; justify-content: center;
  align-items: flex-end; gap: 4px;
  height: 72px; padding: 0 32px;
  position: relative; z-index: 10;
}
.bar {
  width: 10px; height: 3px; min-height: 3px;
  background: #c8922a;
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
  border-top: 1px solid #ffffff;
  background: #111009;
  font-size: 11px; color: #9a9590;
  position: relative; z-index: 10;
}
.dot { color: #4a4740; }
.yr  { margin-left: auto; color: #c8922a; font-weight: 600; font-family: 'Fira Code', monospace; font-size: 10px; }
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
---

# Peta Materi

<div class="grid grid-cols-3 gap-4 mt-4">

<div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
<h3 class="text-blue-700 font-bold mb-2">📐 Fondasi Matematis</h3>
<ul class="text-sm space-y-1">
<li>Sinyal & domain waktu</li>
<li>Deret Fourier</li>
<li>Transformasi Fourier kontinu</li>
</ul>
</div>

<div class="bg-green-50 p-4 rounded-lg border border-green-200">
<h3 class="text-green-700 font-bold mb-2">🔢 Komputasi Digital</h3>
<ul class="text-sm space-y-1">
<li>DFT & FFT</li>
<li>Sampling & Aliasing</li>
<li>Windowing</li>
</ul>
</div>

<div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
<h3 class="text-orange-700 font-bold mb-2">⚙️ Aplikasi Teknik</h3>
<ul class="text-sm space-y-1">
<li>Identifikasi frekuensi natural</li>
<li>Fungsi Respons Frekuensi</li>
<li>Condition monitoring</li>
</ul>
</div>

</div>

<div class="mt-6 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
💡 <strong>Tujuan:</strong> Memahami bagaimana sinyal getaran dalam domain waktu dapat dianalisis lebih efektif dalam domain frekuensi menggunakan Transformasi Fourier.
</div>

---
layout: default
---

# Capaian Pembelajaran (CPMK)

Setelah mempelajari materi ini, mahasiswa mampu:

<v-clicks>

1. **Menjelaskan** konsep Deret Fourier dan Transformasi Fourier serta relevansinya dalam analisis getaran mekanik

2. **Menghitung** koefisien Deret Fourier dari sinyal getaran periodik sederhana

3. **Menerapkan** DFT/FFT untuk menganalisis sinyal getaran diskrit dan menginterpretasi spektrum frekuensi

4. **Mengidentifikasi** frekuensi natural, harmonik, dan anomali dari spektrum getaran mesin

5. **Menggunakan** Python/MATLAB untuk analisis spektral sinyal getaran nyata

</v-clicks>

<div class="mt-4 text-sm text-gray-500" v-click>
📚 Referensi utama: Rao, S.S. (2018). <em>Mechanical Vibrations</em>, 6th Ed. Pearson.
</div>

---
layout: two-cols
---

# Mengapa Domain Frekuensi?

## Domain Waktu
Melihat **bagaimana** amplitudo berubah terhadap waktu

- Komponen harmonik bertumpuk satu sama lain
- Sulit menentukan frekuensi natural secara visual
- Diagnosis kerusakan mesin sangat sulit
- Noise mengaburkan informasi penting

<div class="mt-4 p-3 bg-red-50 rounded border border-red-200 text-sm">
❌ Sinyal: $x(t) = 2\sin(30t) + 0.8\sin(60t) + \text{noise}$\
Sulit dibaca langsung dari grafik waktu.
</div>

::right::

<div class="pl-4">

## Domain Frekuensi
Melihat **frekuensi apa** yang terkandung dalam sinyal

- Setiap komponen frekuensi terpisah jelas
- Frekuensi natural langsung terlihat sebagai puncak
- Diagnosis kerusakan jauh lebih mudah
- Noise tersebar merata, sinyal tetap menonjol

<div class="mt-4 p-3 bg-green-50 rounded border border-green-200 text-sm">
✅ Spektrum: Puncak tajam di 30 Hz (1X) dan 60 Hz (2X) langsung teridentifikasi.
</div>

<div class="mt-3 p-3 bg-blue-50 rounded text-sm">
💡 <strong>Analogi:</strong> Seperti prisma yang memisahkan cahaya putih menjadi warna pelangi — Fourier Transform memisahkan sinyal getaran menjadi komponen frekuensinya.
</div>

</div>

---
layout: default
---

# Sinyal Getaran & Representasinya

## Getaran Harmonik Sederhana (1-DOF, tanpa redaman)

$$x(t) = A\cos(\omega_n t + \phi)$$

di mana: $A$ = amplitudo [m], $\omega_n$ = frekuensi natural [rad/s], $\phi$ = sudut fasa [rad]

<div class="grid grid-cols-2 gap-4 mt-4">

<div class="bg-gray-50 p-4 rounded">

**Sinyal periodik umum (superposisi harmonik):**

$$x(t) = \sum_{k=1}^{N} A_k \cos(k\omega_0 t + \phi_k)$$

Terdiri dari komponen **fundamental** $\omega_0$ dan **harmonik-harmoniknya** $2\omega_0, 3\omega_0, \ldots$

</div>

<div class="bg-gray-50 p-4 rounded">

**Hubungan besaran frekuensi:**

| Besaran | Simbol | Satuan |
|---------|--------|--------|
| Periode | $T$ | s |
| Frekuensi | $f_0 = 1/T$ | Hz |
| Frekuensi sudut | $\omega_0 = 2\pi f_0$ | rad/s |

</div>

</div>

---
layout: default
---

# Deret Fourier — Representasi Sinyal Periodik

Setiap sinyal periodik $x(t)$ dengan periode $T$ dapat dinyatakan sebagai:

$$\boxed{x(t) = \frac{a_0}{2} + \sum_{n=1}^{\infty}\left[a_n \cos\!\left(\frac{2\pi n t}{T}\right) + b_n \sin\!\left(\frac{2\pi n t}{T}\right)\right]}$$

**Koefisien Fourier:**

$$a_0 = \frac{2}{T}\int_0^T x(t)\,dt$$

$$a_n = \frac{2}{T}\int_0^T x(t)\cos\!\left(\frac{2\pi n t}{T}\right)dt, \qquad b_n = \frac{2}{T}\int_0^T x(t)\sin\!\left(\frac{2\pi n t}{T}\right)dt$$

**Amplitudo dan fasa komponen ke-$n$:**

$$C_n = \sqrt{a_n^2 + b_n^2}, \qquad \phi_n = \arctan\!\left(\frac{-b_n}{a_n}\right)$$

<div class="mt-2 bg-blue-50 p-3 rounded text-sm">
$C_n$ adalah <strong>amplitudo spektral</strong> — inilah yang ditampilkan dalam grafik spektrum frekuensi!
</div>

---
layout: default
---

# Deret Fourier — Bentuk Kompleks

Menggunakan identitas Euler $e^{j\theta} = \cos\theta + j\sin\theta$, deret Fourier menjadi:

$$\boxed{x(t) = \sum_{n=-\infty}^{\infty} X_n \, e^{\,j n \omega_0 t}}$$

dengan koefisien kompleks:

$$X_n = \frac{1}{T}\int_0^T x(t)\,e^{-jn\omega_0 t}\,dt$$

<div class="grid grid-cols-2 gap-4 mt-4">

<div class="bg-blue-50 p-4 rounded">

**Hubungan dengan bentuk trigonometri:**
$$X_0 = \frac{a_0}{2}, \quad X_n = \frac{a_n - jb_n}{2}, \quad X_{-n} = X_n^*$$
$$|X_n| = \frac{C_n}{2}, \quad \angle X_n = \phi_n$$

</div>

<div class="bg-green-50 p-4 rounded">

**Keunggulan bentuk kompleks:**
- Notasi jauh lebih ringkas
- Manipulasi aljabar lebih mudah
- Dasar langsung dari DFT/FFT
- Untuk sinyal real: $X_{-n} = X_n^*$ (simetri)

</div>

</div>

---
layout: default
---

# Contoh: Deret Fourier Gelombang Kotak

Gelombang kotak dengan amplitudo $A$ dan periode $T$:

$$x(t) = \begin{cases} +A & 0 < t < T/2 \\ -A & T/2 < t < T \end{cases}$$

**Karena fungsi ganjil:** $a_n = 0$ untuk semua $n$, dan $a_0 = 0$

$$b_n = \frac{4A}{n\pi} \quad (n = 1,3,5,\ldots), \qquad b_n = 0 \quad (n = 2,4,6,\ldots)$$

**Hasil Deret Fourier:**

$$\boxed{x(t) = \frac{4A}{\pi}\left[\sin(\omega_0 t) + \frac{1}{3}\sin(3\omega_0 t) + \frac{1}{5}\sin(5\omega_0 t) + \cdots\right]}$$

<div class="grid grid-cols-2 gap-3 mt-3 text-sm">
<div class="bg-yellow-50 p-3 rounded">
💡 Makin banyak harmonik → approximasi makin mendekati bentuk kotak asli.
</div>
<div class="bg-orange-50 p-3 rounded">
⚠️ <strong>Gibbs phenomenon:</strong> Lonjakan ~9% terjadi di tepi diskontinuitas, tidak hilang meski harmonik → ∞.
</div>
</div>

---
layout: default
---

# Transformasi Fourier Kontinu (CFT)

Untuk sinyal **non-periodik** (periode $T \to \infty$), deret Fourier menjadi integral Fourier:

$$\boxed{X(f) = \int_{-\infty}^{\infty} x(t)\,e^{-j2\pi ft}\,dt} \qquad \text{(Transformasi Fourier)}$$

$$\boxed{x(t) = \int_{-\infty}^{\infty} X(f)\,e^{\,j2\pi ft}\,df} \qquad \text{(Transformasi Fourier Invers)}$$

<div class="grid grid-cols-2 gap-4 mt-4">

<div class="bg-blue-50 p-4 rounded">

**Interpretasi $X(f)$:**
- $|X(f)|$ = **spektrum amplitudo** → kontribusi tiap frekuensi
- $\angle X(f)$ = **spektrum fasa**
- $|X(f)|^2$ = densitas spektral daya (PSD)
- Satuan: [satuan sinyal / Hz]

</div>

<div class="bg-green-50 p-4 rounded">

**Pasangan Fourier penting:**

| $x(t)$ | $X(f)$ |
|--------|--------|
| $\delta(t)$ | $1$ |
| $e^{-at}u(t)$ | $\frac{1}{a+j2\pi f}$ |
| $\cos(2\pi f_0 t)$ | $\frac{\delta(f-f_0)+\delta(f+f_0)}{2}$ |
| Rect$(t/\tau)$ | $\tau\,\text{sinc}(f\tau)$ |

</div>

</div>

---
layout: default
---

# Sifat-Sifat Transformasi Fourier

<div class="text-sm mt-2">

| Sifat | Domain Waktu | Domain Frekuensi |
|-------|-------------|------------------|
| **Linearitas** | $\alpha x(t) + \beta y(t)$ | $\alpha X(f) + \beta Y(f)$ |
| **Pergeseran waktu** | $x(t - t_0)$ | $X(f)\,e^{-j2\pi f t_0}$ |
| **Pergeseran frekuensi** | $x(t)\,e^{\,j2\pi f_0 t}$ | $X(f - f_0)$ |
| **Penskalaan** | $x(at)$ | $\frac{1}{|a|}X\!\left(\frac{f}{a}\right)$ |
| **Diferensiasi** | $\dot{x}(t)$ | $j2\pi f\,X(f)$ |
| **Konvolusi** | $x(t) * h(t)$ | $X(f)\cdot H(f)$ |
| **Perkalian** | $x(t)\cdot y(t)$ | $X(f) * Y(f)$ |
| **Parseval** | $\int|x|^2dt$ | $\int|X|^2df$ |

</div>

<div class="bg-orange-50 p-3 rounded mt-3">

**Sifat diferensiasi — kunci untuk analisis getaran:**
$$\dot{x}(t) \xrightarrow{\mathcal{F}} j\omega\,X(\omega) \qquad \ddot{x}(t) \xrightarrow{\mathcal{F}} -\omega^2 X(\omega)$$

Artinya: spektrum **kecepatan** = $j\omega$ × spektrum perpindahan; spektrum **akselerasi** = $-\omega^2$ × spektrum perpindahan.

</div>

---
layout: default
---

# Transformasi Fourier Diskrit (DFT)

Dalam praktik, sinyal diukur sebagai **sekuens diskrit** $x[n]$ dari $N$ sampel:

$$\boxed{X[k] = \sum_{n=0}^{N-1} x[n]\,e^{-j\frac{2\pi}{N}kn}, \quad k = 0, 1, \ldots, N-1}$$

$$\boxed{x[n] = \frac{1}{N}\sum_{k=0}^{N-1} X[k]\,e^{\,j\frac{2\pi}{N}kn}, \quad n = 0, 1, \ldots, N-1}$$

**Pemetaan bin frekuensi ke frekuensi fisik:**

$$f_k = \frac{k}{N\,\Delta t} = \frac{k \cdot f_s}{N}, \quad k = 0, 1, \ldots, \frac{N}{2}$$

<div class="grid grid-cols-2 gap-3 mt-3 text-sm">

<div class="bg-blue-50 p-3 rounded">

**Parameter DFT:**
- $N$ = jumlah sampel
- $\Delta t = 1/f_s$ = interval sampling [s]
- $f_s$ = frekuensi sampling [Hz]
- Resolusi frekuensi: $\Delta f = f_s / N = 1/(N\Delta t)$

</div>

<div class="bg-green-50 p-3 rounded">

**Kompleksitas komputasi:**
- DFT langsung: $\mathcal{O}(N^2)$ operasi
- FFT (Cooley-Tukey): $\mathcal{O}(N\log_2 N)$
- Untuk $N=1024$: DFT ≈ $10^6$, FFT ≈ $10^4$ ✨

</div>

</div>

---
layout: two-cols
---

# FFT — Fast Fourier Transform

## Algoritma Cooley-Tukey (1965)

Membagi DFT $N$ titik menjadi dua DFT $N/2$ titik (divide & conquer). Misalkan $W_N = e^{-j2\pi/N}$:

$$X[k] = \underbrace{\sum_{n\,\text{genap}} x[n]\,W_N^{kn}}_{E[k]} + W_N^k \underbrace{\sum_{n\,\text{ganjil}} x[n]\,W_N^{kn}}_{O[k]}$$

**Butterfly computation:**
$$X[k] = E[k] + W_N^k \cdot O[k]$$
$$X[k+N/2] = E[k] - W_N^k \cdot O[k]$$

Proses ini berulang secara rekursif sampai $N=1$, menghasilkan $\log_2 N$ tahap.

::right::

<div class="pl-4">

## Implementasi Python

```python
import numpy as np
from scipy.fft import fft, fftfreq

# Sinyal: 3sin(2π·50t) + sin(2π·120t)
fs = 1000        # sampling rate [Hz]
T  = 1.0         # durasi [s]
N  = int(T * fs)

t = np.linspace(0, T, N, endpoint=False)
x = (3*np.sin(2*np.pi*50*t)
   +   np.sin(2*np.pi*120*t))

# Hitung FFT
X     = fft(x)
freqs = fftfreq(N, 1/fs)

# Ambil sisi positif
idx = freqs >= 0
amp = 2*np.abs(X[idx])/N
f   = freqs[idx]
```

</div>

---
layout: default
---

# Resolusi Frekuensi & Parameter Akuisisi

<div class="grid grid-cols-3 gap-4 mt-3">

<div class="bg-blue-50 p-4 rounded">

### Resolusi Frekuensi
$$\Delta f = \frac{f_s}{N} = \frac{1}{T_{total}}$$

- Makin panjang sinyal → resolusi makin halus
- **Trade-off:** akurasi frekuensi vs. durasi akuisisi

</div>

<div class="bg-green-50 p-4 rounded">

### Frekuensi Nyquist
$$f_{Nyq} = \frac{f_s}{2}$$

- Batas frekuensi tertinggi yang bisa dianalisis
- Wajib: $f_{Nyq} > f_{\max,\text{sinyal}}$
- Praktik: $f_s \geq 2.56\,f_{\max}$

</div>

<div class="bg-orange-50 p-4 rounded">

### Spectral Lines
$$N_{lines} = \frac{N}{2.56}$$

- Konvensi analyzer industri
- $N=1024$ → 400 lines
- $N=2048$ → 800 lines
- $N=4096$ → 1600 lines

</div>

</div>

<div class="mt-4 bg-gray-50 p-4 rounded text-sm">

**Contoh perancangan akuisisi:**
- Frekuensi tertinggi: $f_{\max} = 500$ Hz → $f_s = 2.56 \times 500 = 1280$ Hz
- Resolusi yang diinginkan: $\Delta f = 0.5$ Hz
- Jumlah sampel: $N = f_s / \Delta f = 1280 / 0.5 = 2560$ sampel
- Waktu akuisisi: $T = N/f_s = 2560/1280 = \mathbf{2}$ **detik**

</div>

---
layout: two-cols
---

# Teorema Nyquist & Aliasing

## Teorema Nyquist-Shannon

Sinyal harus di-sampling minimal **dua kali** frekuensi tertingginya:
$$f_s \geq 2\,f_{\max}$$

**Aliasing** terjadi bila $f_s < 2f_{\max}$:

$$f_{alias} = \left|f_{sinyal} - n\cdot f_s\right|, \quad n \in \mathbb{Z}$$

Frekuensi tinggi "terlipat" menjadi frekuensi rendah yang tidak nyata!

**Contoh:**
Sinyal $f_0 = 800$ Hz, $f_s = 1000$ Hz:
$$f_{alias} = |800 - 1 \times 1000| = 200 \text{ Hz}$$

Terlihat seolah ada komponen 200 Hz yang tidak pernah ada!

::right::

<div class="pl-4">

## Pencegahan Aliasing

<div class="bg-green-50 p-4 rounded mb-3">

**Anti-aliasing filter (hardware):**
- Low-pass filter analog sebelum ADC
- Potong di $f_s/2$ (Nyquist)
- Wajib ada pada setiap sistem akuisisi getaran

</div>

<div class="bg-blue-50 p-4 rounded">

**Oversampling + decimation (software):**
- Sample jauh lebih cepat dari Nyquist
- Terapkan digital low-pass filter
- Downsample ke $f_s$ target
- Digunakan pada sistem modern (sigma-delta ADC)

</div>

<div class="bg-red-50 p-3 rounded mt-3 text-sm">
⚠️ Aliasing dalam getaran mesin dapat menyebabkan <strong>salah diagnosis kerusakan</strong>!
</div>

</div>

---
layout: default
---

# Windowing — Mengatasi Spectral Leakage

**Masalah:** DFT mengasumsikan sinyal periodik dalam window. Jika sinyal tidak berakhir sempurna → *spectral leakage* (energi bocor ke bin frekuensi tetangga).

**Solusi:** Kalikan sinyal dengan fungsi window $w[n]$ yang memudar ke nol di kedua tepi:

$$x_w[n] = x[n] \cdot w[n]$$

<div class="grid grid-cols-2 gap-4 mt-3">

<div>

| Window | Keunggulan | Cocok untuk |
|--------|-----------|-------------|
| **Rectangular** | Resolusi terbaik | Sinyal transien |
| **Hanning** | Leakage rendah | Getaran acak |
| **Hamming** | Side lobe rendah | Sinyal campuran |
| **Flattop** | Akurasi amplitudo | Kalibrasi |
| **Exponential** | Transien meredam | Impact test |

</div>

<div class="bg-blue-50 p-4 rounded">

**Window Hanning (paling umum dipakai):**
$$w[n] = 0.5\left[1 - \cos\!\left(\frac{2\pi n}{N-1}\right)\right]$$

**Koreksi amplitudo setelah windowing:**
$$A_{koreksi} = \frac{2\,|X[k]|}{N \cdot \bar{w}}$$

di mana $\bar{w} = \frac{1}{N}\sum w[n]$ adalah nilai rata-rata window.

</div>

</div>

---
layout: default
---

# Spektrum Amplitudo & Fasa

Dari DFT $X[k]$ diperoleh dua jenis spektrum:

<div class="grid grid-cols-2 gap-4 mt-3">

<div class="bg-blue-50 p-4 rounded">

### Spektrum Amplitudo

$$|X[k]| = \sqrt{\text{Re}(X[k])^2 + \text{Im}(X[k])^2}$$

- Single-sided (untuk sinyal real): $A_k = \dfrac{2|X[k]|}{N}$ untuk $k > 0$
- Komponen DC: $A_0 = \dfrac{|X[0]|}{N}$
- Satuan sama dengan satuan input [m, m/s, m/s²]
- **Power Spectral Density:** $S_{xx}(f) = \dfrac{|X(f)|^2}{\Delta f}$

</div>

<div class="bg-green-50 p-4 rounded">

### Spektrum Fasa

$$\angle X[k] = \arctan\!\left(\frac{\text{Im}(X[k])}{\text{Re}(X[k])}\right)$$

- Satuan: radian atau derajat
- Digunakan untuk: analisis modal, ODS (Operational Deflection Shape), balancing rotor
- Pada monitoring kondisi sederhana sering diabaikan

**RMS dari spektrum:**
$$x_{rms} = \sqrt{\sum_{k} |X[k]|^2 / N^2}$$

</div>

</div>

---
layout: default
---

# Analisis Getaran Mesin dengan FFT

**Prosedur analisis:**

<div class="grid grid-cols-4 gap-3 mt-4">

<div class="bg-blue-50 p-3 rounded text-center">
<div class="text-3xl mb-1">📡</div>
<div class="font-bold text-sm">1. Akuisisi</div>
<div class="text-xs mt-1">Akselerometer → kondisioner sinyal → ADC → data digital $x[n]$</div>
</div>

<div class="bg-green-50 p-3 rounded text-center">
<div class="text-3xl mb-1">🔲</div>
<div class="font-bold text-sm">2. Preprocessing</div>
<div class="text-xs mt-1">Anti-alias filter, detrending DC, windowing</div>
</div>

<div class="bg-orange-50 p-3 rounded text-center">
<div class="text-3xl mb-1">⚡</div>
<div class="font-bold text-sm">3. FFT</div>
<div class="text-xs mt-1">Hitung DFT → spektrum amplitudo $|X[k]|$</div>
</div>

<div class="bg-purple-50 p-3 rounded text-center">
<div class="text-3xl mb-1">🔍</div>
<div class="font-bold text-sm">4. Interpretasi</div>
<div class="text-xs mt-1">Identifikasi puncak, bandingkan baseline</div>
</div>

</div>

<div class="mt-4 bg-gray-50 p-4 rounded text-sm">

**Pola frekuensi khas pada spektrum getaran mesin:**

| Frekuensi | Sumber |
|-----------|--------|
| $1\times$ RPM | Unbalance (ketidakseimbangan massa) |
| $2\times$ RPM | Misalignment, bearing wear |
| $n\times$ RPM ($n\geq3$) | Cacat mekanis, kelonggaran (looseness) |
| $f_{mesh}$ = (RPM/60) × jumlah gigi | Kerusakan gear |
| $f_{BPFO}, f_{BPFI}, f_{BSF}$ | Kerusakan bearing |

</div>

---
layout: default
---

# Identifikasi Frekuensi Natural via FRF

## Fungsi Respons Frekuensi (FRF)

FRF adalah rasio respons output terhadap input gaya dalam domain frekuensi:

$$H(\omega) = \frac{X(\omega)}{F(\omega)} = \frac{1}{k - m\omega^2 + jc\omega}$$

$$|H(\omega)| = \frac{1}{\sqrt{(k-m\omega^2)^2 + (c\omega)^2}}$$

<div class="grid grid-cols-2 gap-4 mt-3">

<div class="bg-blue-50 p-4 rounded">

**Puncak FRF → Frekuensi Natural**

Pada resonans $\omega = \omega_n = \sqrt{k/m}$:
$$|H(\omega_n)|_{\max} = \frac{1}{c\,\omega_n} = \frac{1}{2k\zeta}$$

Makin kecil $\zeta$ → puncak makin tajam dan tinggi.

</div>

<div class="bg-green-50 p-4 rounded">

**Metode Half-Power (−3 dB Band):**

$$\zeta \approx \frac{f_2 - f_1}{2f_n}$$

di mana $f_1, f_2$ adalah frekuensi saat amplitudo FRF turun ke $|H|_{\max}/\sqrt{2}$.

Disebut **bandwidth method** untuk identifikasi damping ratio experimentally.

</div>

</div>

---
layout: default
---

# Contoh Soal 1 — Identifikasi Sumber Getaran

**Soal:** Sensor akselerometer pada poros mengukur getaran mesin yang berputar pada 1800 RPM. Hasil FFT menunjukkan puncak signifikan pada: **30 Hz, 60 Hz, 90 Hz, dan 340 Hz**.

Tentukan sumber masing-masing komponen frekuensi!

<v-clicks>

**Penyelesaian:**

Frekuensi putaran: $f_{rot} = 1800\,\text{RPM} / 60 = 30\,\text{Hz}$

| Frekuensi | Rasio | Diagnosis |
|-----------|-------|-----------|
| 30 Hz | $1\times$ | **Unbalance** (ketidakseimbangan massa rotor) |
| 60 Hz | $2\times$ | **Misalignment** aksial atau keausan bearing |
| 90 Hz | $3\times$ | Harmonik ke-3 → kelonggaran mekanis |
| 340 Hz | $11.3\times$ | Bukan harmonik bulat → kemungkinan **frekuensi meshing** gear (perlu cek jumlah gigi) |

**Parameter akuisisi yang digunakan:**
$$\Delta f = \frac{f_s}{N} = \frac{5000}{4096} \approx 1.22\,\text{Hz} \quad (\text{cukup untuk memisahkan 30-60-90 Hz})$$

</v-clicks>

---
layout: default
---

# Contoh Soal 2 — Identifikasi Frekuensi Natural

**Soal:** Uji impak (hammer test) pada pelat baja menghasilkan FRF dengan:
- Puncak pada $f_n = 125$ Hz, $|H|_{\max} = 4.2 \times 10^{-4}$ m/N
- Titik half-power: $f_1 = 121.5$ Hz, $f_2 = 128.5$ Hz
- Massa efektif pelat: $m = 2.5$ kg

Tentukan $\omega_n$, $\zeta$, $k$, dan $c$!

<v-clicks>

**Penyelesaian:**

$$\omega_n = 2\pi \times 125 = 785.4\,\text{rad/s}$$

$$\zeta = \frac{f_2 - f_1}{2f_n} = \frac{128.5 - 121.5}{2 \times 125} = \frac{7}{250} = 0.028 = \mathbf{2.8\%}$$

$$k = m\,\omega_n^2 = 2.5 \times (785.4)^2 = 1.54 \times 10^6\,\text{N/m}$$

$$c = 2\,m\,\omega_n\,\zeta = 2 \times 2.5 \times 785.4 \times 0.028 = 110.0\,\text{N·s/m}$$

</v-clicks>

---
layout: two-cols
---

# Aplikasi Industri — Predictive Maintenance

## Frekuensi Cacat Bearing

Untuk bearing dengan $N_r$ rolling element, diameter rolling $d$, pitch diameter $D$, sudut kontak $\alpha$:

$$f_{BPFO} = \frac{N_r \cdot n}{120}\left(1 - \frac{d}{D}\cos\alpha\right)$$

$$f_{BPFI} = \frac{N_r \cdot n}{120}\left(1 + \frac{d}{D}\cos\alpha\right)$$

$$f_{BSF} = \frac{D \cdot n}{120\,d}\left[1 - \left(\frac{d}{D}\cos\alpha\right)^2\right]$$

di mana $n$ = RPM poros.

::right::

<div class="pl-4">

## Pola Diagnosis

| Kondisi | Pola Spektrum |
|---------|---------------|
| **Unbalance** | Puncak $1\times$ dominan |
| **Misalignment** | $1\times$ + $2\times$ kuat |
| **Looseness** | Banyak sub/super harmonik |
| **Bearing BPFO** | Puncak $f_{BPFO}$ + sidebands |
| **Gear mesh** | $f_{mesh}$ + harmonik |

<div class="mt-4 bg-blue-50 p-3 rounded text-sm">

**Frekuensi fundamental putaran (FTF):**
$$f_{FTF} = \frac{n}{120}\left(1 - \frac{d}{D}\cos\alpha\right)$$

FTF adalah frekuensi putar sangkar (cage). Kerusakan dini bearing sering muncul sebagai sidebands di sekitar BPFO/BPFI dengan jarak $f_{FTF}$.

</div>

</div>

---
layout: default
---

# Indikator Kondisi Getaran

Selain spektrum FFT, indikator statistik digunakan untuk monitoring:

<div class="grid grid-cols-3 gap-4 mt-3">

<div class="bg-blue-50 p-4 rounded">

### RMS
$$x_{rms} = \sqrt{\frac{1}{N}\sum_{n=1}^{N}x[n]^2}$$
- Terkait energi total getaran
- ISO 10816: batas per kelas mesin
- Satuan: mm/s (kecepatan)

</div>

<div class="bg-green-50 p-4 rounded">

### Crest Factor
$$CF = \frac{x_{\text{peak}}}{x_{rms}}$$
- Normal: $CF \approx 1.4$ – $2.0$
- Impak/cacat: CF meningkat
- Deteksi dini kerusakan bearing

</div>

<div class="bg-orange-50 p-4 rounded">

### Kurtosis
$$K = \frac{\frac{1}{N}\sum(x-\bar{x})^4}{\left(\frac{1}{N}\sum(x-\bar{x})^2\right)^2}$$
- Normal: $K = 3$
- Cacat bearing: $K > 3$
- Sangat sensitif di tahap awal

</div>

</div>

<div class="mt-3 bg-gray-50 p-3 rounded text-sm">

**Standar ISO 10816-3:** Batas kecepatan getaran RMS [mm/s] untuk mesin industri: Baik <2.3 / Memuaskan 2.3–4.5 / Tidak Memuaskan 4.5–7.1 / Tidak Dapat Diterima >7.1

</div>

---
layout: default
---

# Implementasi Python — Analisis FFT Lengkap

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.fft import fft, fftfreq
from scipy.signal import windows

# Simulasi sinyal getaran mesin (1800 RPM)
fs    = 5000
T     = 2.0
N     = int(T * fs)
t     = np.linspace(0, T, N, endpoint=False)
f_rot = 30   # 1X = 30 Hz

x = (2.5 * np.sin(2*np.pi * f_rot * t)       # 1X unbalance
   + 0.8 * np.sin(2*np.pi * 2*f_rot * t)     # 2X misalignment
   + 0.3 * np.sin(2*np.pi * 3*f_rot * t)     # 3X harmonik
   + 0.1 * np.random.randn(N))               # noise

# Windowing (Hanning) + FFT
win   = windows.hann(N)
X     = fft(x * win)
freqs = fftfreq(N, 1/fs)

# Amplitudo single-sided (koreksi window Hanning)
amp   = 2 * np.abs(X[:N//2]) / (N * np.mean(win))
f_pos = freqs[:N//2]

# Plot
plt.figure(figsize=(10, 4))
plt.plot(f_pos, amp)
plt.xlabel('Frekuensi [Hz]'); plt.ylabel('Amplitudo [m/s²]')
plt.title('Spektrum FFT Getaran Poros (1800 RPM)')
plt.xlim([0, 200]); plt.grid(True); plt.tight_layout(); plt.show()
```

---
layout: default
---

# Implementasi MATLAB — Analisis Spektral

```matlab
%% Analisis FFT Getaran Mesin
clear; clc; close all;

% Parameter sinyal
fs    = 5000;       % frekuensi sampling [Hz]
T     = 2.0;        % durasi [s]
N     = fs * T;
t     = (0:N-1) / fs;
f_rot = 30;         % 1X rotasi = 30 Hz (1800 RPM)

% Simulasi sinyal getaran
x = 2.5*sin(2*pi*f_rot*t) + 0.8*sin(2*pi*2*f_rot*t) ...
  + 0.3*sin(2*pi*3*f_rot*t) + 0.1*randn(1,N);

% Window Hanning + FFT
win    = hann(N)';
X      = fft(x .* win);
f      = (0:N/2-1) * fs/N;

% Koreksi amplitudo untuk window Hanning
amp    = 2 * abs(X(1:N/2)) / (N * mean(win));

% Visualisasi
subplot(2,1,1);
plot(t(1:2000), x(1:2000));
xlabel('Waktu [s]'); ylabel('Akselerasi [m/s²]');
title('Sinyal Getaran — Domain Waktu');

subplot(2,1,2);
plot(f, amp);
xlabel('Frekuensi [Hz]'); ylabel('Amplitudo [m/s²]');
title('Spektrum FFT (Hanning window)'); xlim([0 200]); grid on;
```

---
layout: default
---

# Latihan & Tugas

## Latihan Mandiri

<v-clicks>

1. **Deret Fourier:** Hitung 5 koefisien pertama Deret Fourier untuk sinyal getaran *segitiga* (triangular wave) dengan amplitudo $A = 1$ m dan periode $T = 0.02$ s.

2. **Parameter DFT:** Sistem getaran perlu dianalisis hingga $f_{\max} = 2000$ Hz dengan resolusi $\Delta f = 0.5$ Hz. Tentukan: (a) $f_s$ minimum, (b) jumlah sampel $N$, (c) waktu akuisisi.

3. **Aliasing:** Sinyal mengandung komponen pada 80 Hz, 150 Hz, dan 600 Hz. Jika $f_s = 500$ Hz, tentukan frekuensi alias yang muncul di spektrum.

4. **Interpretasi spektrum:** Dari spektrum FFT poros yang berputar 24 Hz, teridentifikasi puncak pada 24, 48, 72, dan 288 Hz. Berapa jumlah gigi gear jika 288 Hz adalah frekuensi meshing?

</v-clicks>

## Tugas Kelompok (2 orang)

<v-click>

Ukur sinyal getaran menggunakan aplikasi akselerometer smartphone. Ekspor data CSV, lakukan analisis FFT dengan Python, dan identifikasi komponen frekuensi dominan. Kumpulkan laporan 3–5 halaman + kode Python.

</v-click>

---
layout: default
---

# Rangkuman

<div class="grid grid-cols-2 gap-6">

<div>

### Konsep Kunci

<v-clicks>

- **Deret Fourier:** sinyal periodik = jumlah sinusoidal harmonik dengan koefisien $a_n$, $b_n$
- **Transformasi Fourier:** perpindahan domain waktu ↔ frekuensi untuk sinyal umum
- **DFT/FFT:** implementasi diskrit & efisien ($\mathcal{O}(N\log N)$) untuk komputer
- **Spektrum:** memperlihatkan amplitudo dan fasa tiap komponen frekuensi
- **FRF:** alat identifikasi parameter modal (frekuensi natural, damping)

</v-clicks>

</div>

<div>

### Aturan Praktis

<v-clicks>

- $f_s \geq 2.56\,f_{\max}$ — standar industri analyzer
- $\Delta f = 1/T_{total}$ — resolusi frekuensi
- Selalu gunakan **window** untuk sinyal stasioner
- **Anti-alias filter** wajib sebelum ADC
- Puncak $1\times, 2\times, 3\times$ RPM = panduan diagnosis dasar
- Validasi spektrum dengan domain waktu!

</v-clicks>

</div>

</div>

<div class="mt-5 bg-blue-50 p-4 rounded" v-click>

**Pesan kunci:** Fourier Transform adalah "kacamata" yang memungkinkan kita melihat sinyal getaran dari sudut pandang frekuensi. Apa yang sulit dibaca dalam domain waktu menjadi jelas dalam domain frekuensi — inilah dasar dari seluruh teknologi predictive maintenance modern.

</div>

---
layout: default
---

# Referensi

<div class="space-y-2 mt-4 text-sm">

1. **Rao, S.S.** (2018). *Mechanical Vibrations*, 6th Ed. Pearson Education. *(Bab 11 — Signal Processing)*

2. **Brandt, A.** (2011). *Noise and Vibration Analysis: Signal Analysis and Experimental Procedures*. Wiley.

3. **Proakis, J.G. & Manolakis, D.G.** (2006). *Digital Signal Processing*, 4th Ed. Pearson.

4. **Randall, R.B.** (2021). *Vibration-based Condition Monitoring*, 2nd Ed. Wiley.

5. **Cooley, J.W. & Tukey, J.W.** (1965). An Algorithm for the Machine Calculation of Complex Fourier Series. *Mathematics of Computation*, 19(90), 297–301.

6. **ISO 10816-3:2009** — Mechanical vibration — Evaluation of machine vibration by measurements on non-rotating parts.

7. **Dokumentasi Python:**
   - `scipy.fft`: scipy.org/doc/scipy/reference/fft.html
   - `scipy.signal.windows`: untuk berbagai jenis window functions

</div>

---
layout: center
class: text-center
---

# Terima Kasih

**Ada pertanyaan?**

<div class="mt-6 text-gray-600">

Dedik Romahadi, S.T., M.T.\
📧 dedik.romahadi@mercubuana.ac.id\
Program Studi Teknik Mesin — Universitas Mercu Buana

</div>

<div class="mt-6 text-sm text-gray-400">

*Slide ini dibuat dengan [Slidev](https://sli.dev) — presentasi berbasis Markdown*

</div>

<div class="abs-br m-6 text-sm text-gray-400">
Getaran Mekanik — Universitas Mercu Buana | 2026
</div>
