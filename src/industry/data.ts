import { Industry } from './entities/industry.entity';

export const industries: Industry[] = [
  {
    code: 'A',
    name: '农、林、牧、渔业',
    children: [
      {
        code: '01',
        name: '农业',
        children: [
          {
            code: '011',
            name: '谷物种植',
            children: [
              {
                code: '0111',
                name: '稻谷种植',
                children: [],
              },
              {
                code: '0112',
                name: '小麦种植',
                children: [],
              },
              {
                code: '0113',
                name: '玉米种植',
                children: [],
              },
              {
                code: '0119',
                name: '其他谷物种植',
                children: [],
              },
            ],
          },
          {
            code: '012',
            name: '豆类、油料和薯类种植',
            children: [
              {
                code: '0121',
                name: '豆类种植',
                children: [],
              },
              {
                code: '0122',
                name: '油料种植',
                children: [],
              },
              {
                code: '0123',
                name: '薯类种植',
                children: [],
              },
            ],
          },
          {
            code: '013',
            name: '棉、麻、糖、烟草种植',
            children: [
              {
                code: '0131',
                name: '棉花种植',
                children: [],
              },
              {
                code: '0132',
                name: '麻类种植',
                children: [],
              },
              {
                code: '0133',
                name: '糖料种植',
                children: [],
              },
              {
                code: '0134',
                name: '烟草种植',
                children: [],
              },
            ],
          },
          {
            code: '014',
            name: '蔬菜、食用菌及园艺作物种植',
            children: [
              {
                code: '0141',
                name: '蔬菜种植',
                children: [],
              },
              {
                code: '0142',
                name: '食用菌种植',
                children: [],
              },
              {
                code: '0143',
                name: '花卉种植',
                children: [],
              },
              {
                code: '0149',
                name: '其他园艺作物种植',
                children: [],
              },
            ],
          },
          {
            code: '015',
            name: '水果种植',
            children: [
              {
                code: '0151',
                name: '仁果类和核果类水果种植',
                children: [],
              },
              {
                code: '0152',
                name: '葡萄种植',
                children: [],
              },
              {
                code: '0153',
                name: '柑橘类种植',
                children: [],
              },
              {
                code: '0154',
                name: '香蕉等亚热带水果种植',
                children: [],
              },
              {
                code: '0159',
                name: '其他水果种植',
                children: [],
              },
            ],
          },
          {
            code: '016',
            name: '坚果、含油果、香料和饮料作物种植',
            children: [
              {
                code: '0161',
                name: '坚果种植',
                children: [],
              },
              {
                code: '0162',
                name: '含油果种植',
                children: [],
              },
              {
                code: '0163',
                name: '香料作物种植',
                children: [],
              },
              {
                code: '0164',
                name: '茶叶种植',
                children: [],
              },
              {
                code: '0169',
                name: '其他饮料作物种植',
                children: [],
              },
            ],
          },
          {
            code: '017',
            name: '中药材种植',
            children: [
              {
                code: '0171',
                name: '中草药种植',
                children: [],
              },
              {
                code: '0179',
                name: '其他中药材种植',
                children: [],
              },
            ],
          },
          {
            code: '018',
            name: '草种植及割草',
            children: [
              {
                code: '0181',
                name: '草种植',
                children: [],
              },
              {
                code: '0182',
                name: '天然草原割草',
                children: [],
              },
            ],
          },
          {
            code: '019',
            name: '其他农业',
            children: [
              {
                code: '0190',
                name: '其他农业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '02',
        name: '林业',
        children: [
          {
            code: '021',
            name: '林木育种和育苗',
            children: [
              {
                code: '0211',
                name: '林木育种',
                children: [],
              },
              {
                code: '0212',
                name: '林木育苗',
                children: [],
              },
            ],
          },
          {
            code: '022',
            name: '造林和更新',
            children: [
              {
                code: '0220',
                name: '造林和更新',
                children: [],
              },
            ],
          },
          {
            code: '023',
            name: '森林经营、管护和改培',
            children: [
              {
                code: '0231',
                name: '森林经营和管护',
                children: [],
              },
              {
                code: '0232',
                name: '森林改培',
                children: [],
              },
            ],
          },
          {
            code: '024',
            name: '木材和竹材采运',
            children: [
              {
                code: '0241',
                name: '木材采运',
                children: [],
              },
              {
                code: '0242',
                name: '竹材采运',
                children: [],
              },
            ],
          },
          {
            code: '025',
            name: '林产品采集',
            children: [
              {
                code: '0251',
                name: '木竹材林产品采集',
                children: [],
              },
              {
                code: '0252',
                name: '非木竹材林产品采集',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '03',
        name: '畜牧业',
        children: [
          {
            code: '031',
            name: '牲畜饲养',
            children: [
              {
                code: '0311',
                name: '牛的饲养',
                children: [],
              },
              {
                code: '0312',
                name: '马的饲养',
                children: [],
              },
              {
                code: '0313',
                name: '猪的饲养',
                children: [],
              },
              {
                code: '0314',
                name: '羊的饲养',
                children: [],
              },
              {
                code: '0315',
                name: '骆驼饲养',
                children: [],
              },
              {
                code: '0319',
                name: '其他牲畜饲养',
                children: [],
              },
            ],
          },
          {
            code: '032',
            name: '家禽饲养',
            children: [
              {
                code: '0321',
                name: '鸡的饲养',
                children: [],
              },
              {
                code: '0322',
                name: '鸭的饲养',
                children: [],
              },
              {
                code: '0323',
                name: '鹅的饲养',
                children: [],
              },
              {
                code: '0329',
                name: '其他家禽饲养',
                children: [],
              },
            ],
          },
          {
            code: '033',
            name: '狩猎和捕捉动物',
            children: [
              {
                code: '0330',
                name: '狩猎和捕捉动物',
                children: [],
              },
            ],
          },
          {
            code: '039',
            name: '其他畜牧业',
            children: [
              {
                code: '0391',
                name: '兔的饲养',
                children: [],
              },
              {
                code: '0392',
                name: '蜜蜂饲养',
                children: [],
              },
              {
                code: '0399',
                name: '其他未列明畜牧业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '04',
        name: '渔业',
        children: [
          {
            code: '041',
            name: '水产养殖',
            children: [
              {
                code: '0411',
                name: '海水养殖',
                children: [],
              },
              {
                code: '0412',
                name: '内陆养殖',
                children: [],
              },
            ],
          },
          {
            code: '042',
            name: '水产捕捞',
            children: [
              {
                code: '0421',
                name: '海水捕捞',
                children: [],
              },
              {
                code: '0422',
                name: '内陆捕捞',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '05',
        name: '农、林、牧、渔专业及辅助性活动',
        children: [
          {
            code: '051',
            name: '农业专业及辅助性活动',
            children: [
              {
                code: '0511',
                name: '种子种苗培育活动',
                children: [],
              },
              {
                code: '0512',
                name: '农业机械活动',
                children: [],
              },
              {
                code: '0513',
                name: '灌溉活动',
                children: [],
              },
              {
                code: '0514',
                name: '农产品初加工活动',
                children: [],
              },
              {
                code: '0515',
                name: '农作物病虫害防治活动',
                children: [],
              },
              {
                code: '0519',
                name: '其他农业专业及辅助性活动',
                children: [],
              },
            ],
          },
          {
            code: '052',
            name: '林业专业及辅助性活动',
            children: [
              {
                code: '0521',
                name: '林业有害生物防治活动',
                children: [],
              },
              {
                code: '0522',
                name: '森林防火活动',
                children: [],
              },
              {
                code: '0523',
                name: '林产品初级加工活动',
                children: [],
              },
              {
                code: '0529',
                name: '其他林业专业及辅助性活动',
                children: [],
              },
            ],
          },
          {
            code: '053',
            name: '畜牧专业及辅助性活动',
            children: [
              {
                code: '0531',
                name: '畜牧良种繁殖活动',
                children: [],
              },
              {
                code: '0532',
                name: '畜禽粪污处理活动',
                children: [],
              },
              {
                code: '0539',
                name: '其他畜牧专业及辅助性活动',
                children: [],
              },
            ],
          },
          {
            code: '054',
            name: '渔业专业及辅助性活动',
            children: [
              {
                code: '0541',
                name: '鱼苗及鱼种场活动',
                children: [],
              },
              {
                code: '0549',
                name: '其他渔业专业及辅助性活动',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'B',
    name: '采矿业',
    children: [
      {
        code: '06',
        name: '煤炭开采和洗选业',
        children: [
          {
            code: '061',
            name: '烟煤和无烟煤开采洗选',
            children: [
              {
                code: '0610',
                name: '烟煤和无烟煤开采洗选',
                children: [],
              },
            ],
          },
          {
            code: '062',
            name: '褐煤开采洗选',
            children: [
              {
                code: '0620',
                name: '褐煤开采洗选',
                children: [],
              },
            ],
          },
          {
            code: '069',
            name: '其他煤炭采选',
            children: [
              {
                code: '0690',
                name: '其他煤炭采选',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '07',
        name: '石油和天然气开采业',
        children: [
          {
            code: '071',
            name: '石油开采',
            children: [
              {
                code: '0711',
                name: '陆地石油开采',
                children: [],
              },
              {
                code: '0712',
                name: '海洋石油开采',
                children: [],
              },
            ],
          },
          {
            code: '072',
            name: '天然气开采',
            children: [
              {
                code: '0721',
                name: '陆地天然气开采',
                children: [],
              },
              {
                code: '0722',
                name: '海洋天然气及可燃冰开采',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '08',
        name: '黑色金属矿采选业',
        children: [
          {
            code: '081',
            name: '铁矿采选',
            children: [
              {
                code: '0810',
                name: '铁矿采选',
                children: [],
              },
            ],
          },
          {
            code: '082',
            name: '锰矿、铬矿采选',
            children: [
              {
                code: '0820',
                name: '锰矿、铬矿采选',
                children: [],
              },
            ],
          },
          {
            code: '089',
            name: '其他黑色金属矿采选',
            children: [
              {
                code: '0890',
                name: '其他黑色金属矿采选',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '09',
        name: '有色金属矿采选业',
        children: [
          {
            code: '091',
            name: '常用有色金属矿采选',
            children: [
              {
                code: '0911',
                name: '铜矿采选',
                children: [],
              },
              {
                code: '0912',
                name: '铅锌矿采选',
                children: [],
              },
              {
                code: '0913',
                name: '镍钴矿采选',
                children: [],
              },
              {
                code: '0914',
                name: '锡矿采选',
                children: [],
              },
              {
                code: '0915',
                name: '锑矿采选',
                children: [],
              },
              {
                code: '0916',
                name: '铝矿采选',
                children: [],
              },
              {
                code: '0917',
                name: '镁矿采选',
                children: [],
              },
              {
                code: '0919',
                name: '其他常用有色金属矿采选',
                children: [],
              },
            ],
          },
          {
            code: '092',
            name: '贵金属矿采选',
            children: [
              {
                code: '0921',
                name: '金矿采选',
                children: [],
              },
              {
                code: '0922',
                name: '银矿采选',
                children: [],
              },
              {
                code: '0929',
                name: '其他贵金属矿采选',
                children: [],
              },
            ],
          },
          {
            code: '093',
            name: '稀有稀土金属矿采选',
            children: [
              {
                code: '0931',
                name: '钨钼矿采选',
                children: [],
              },
              {
                code: '0932',
                name: '稀土金属矿采选',
                children: [],
              },
              {
                code: '0933',
                name: '放射性金属矿采选',
                children: [],
              },
              {
                code: '0939',
                name: '其他稀有金属矿采选',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '10',
        name: '非金属矿采选业',
        children: [
          {
            code: '101',
            name: '土砂石开采',
            children: [
              {
                code: '1011',
                name: '石灰石、石膏开采',
                children: [],
              },
              {
                code: '1012',
                name: '建筑装饰用石开采',
                children: [],
              },
              {
                code: '1013',
                name: '耐火土石开采',
                children: [],
              },
              {
                code: '1019',
                name: '粘土及其他土砂石开采',
                children: [],
              },
            ],
          },
          {
            code: '102',
            name: '化学矿开采',
            children: [
              {
                code: '1020',
                name: '化学矿开采',
                children: [],
              },
            ],
          },
          {
            code: '103',
            name: '采盐',
            children: [
              {
                code: '1030',
                name: '采盐',
                children: [],
              },
            ],
          },
          {
            code: '109',
            name: '石棉及其他非金属矿采选',
            children: [
              {
                code: '1091',
                name: '石棉、云母矿采选',
                children: [],
              },
              {
                code: '1092',
                name: '石墨、滑石采选',
                children: [],
              },
              {
                code: '1093',
                name: '宝石、玉石采选',
                children: [],
              },
              {
                code: '1099',
                name: '其他未列明非金属矿采选',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '11',
        name: '开采专业及辅助性活动',
        children: [
          {
            code: '111',
            name: '煤炭开采和洗选专业及辅助性活动',
            children: [
              {
                code: '1110',
                name: '煤炭开采和洗选专业及辅助性活动',
                children: [],
              },
            ],
          },
          {
            code: '112',
            name: '石油和天然气开采专业及辅助性活动',
            children: [
              {
                code: '1120',
                name: '石油和天然气开采专业及辅助性活动',
                children: [],
              },
            ],
          },
          {
            code: '119',
            name: '其他开采专业及辅助性活动',
            children: [
              {
                code: '1190',
                name: '其他开采专业及辅助性活动',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '12',
        name: '其他采矿业',
        children: [
          {
            code: '120',
            name: '其他采矿业',
            children: [
              {
                code: '1200',
                name: '其他采矿业',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'C',
    name: '制造业',
    children: [
      {
        code: '13',
        name: '农副食品加工业',
        children: [
          {
            code: '131',
            name: '谷物磨制',
            children: [
              {
                code: '1311',
                name: '稻谷加工',
                children: [],
              },
              {
                code: '1312',
                name: '小麦加工',
                children: [],
              },
              {
                code: '1313',
                name: '玉米加工',
                children: [],
              },
              {
                code: '1314',
                name: '杂粮加工',
                children: [],
              },
              {
                code: '1319',
                name: '其他谷物磨制',
                children: [],
              },
            ],
          },
          {
            code: '132',
            name: '饲料加工',
            children: [
              {
                code: '1321',
                name: '宠物饲料加工',
                children: [],
              },
              {
                code: '1329',
                name: '其他饲料加工',
                children: [],
              },
            ],
          },
          {
            code: '133',
            name: '植物油加工',
            children: [
              {
                code: '1331',
                name: '食用植物油加工',
                children: [],
              },
              {
                code: '1332',
                name: '非食用植物油加工',
                children: [],
              },
            ],
          },
          {
            code: '134',
            name: '制糖业',
            children: [
              {
                code: '1340',
                name: '制糖业',
                children: [],
              },
            ],
          },
          {
            code: '135',
            name: '屠宰及肉类加工',
            children: [
              {
                code: '1351',
                name: '牲畜屠宰',
                children: [],
              },
              {
                code: '1352',
                name: '禽类屠宰',
                children: [],
              },
              {
                code: '1353',
                name: '肉制品及副产品加工',
                children: [],
              },
            ],
          },
          {
            code: '136',
            name: '水产品加工',
            children: [
              {
                code: '1361',
                name: '水产品冷冻加工',
                children: [],
              },
              {
                code: '1362',
                name: '鱼糜制品及水产品干腌制加工',
                children: [],
              },
              {
                code: '1363',
                name: '鱼油提取及制品制造',
                children: [],
              },
              {
                code: '1369',
                name: '其他水产品加工',
                children: [],
              },
            ],
          },
          {
            code: '137',
            name: '蔬菜、菌类、水果和坚果加工',
            children: [
              {
                code: '1371',
                name: '蔬菜加工',
                children: [],
              },
              {
                code: '1372',
                name: '食用菌加工',
                children: [],
              },
              {
                code: '1373',
                name: '水果和坚果加工',
                children: [],
              },
            ],
          },
          {
            code: '139',
            name: '其他农副食品加工',
            children: [
              {
                code: '1391',
                name: '淀粉及淀粉制品制造',
                children: [],
              },
              {
                code: '1392',
                name: '豆制品制造',
                children: [],
              },
              {
                code: '1393',
                name: '蛋品加工',
                children: [],
              },
              {
                code: '1399',
                name: '其他未列明农副食品加工',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '14',
        name: '食品制造业',
        children: [
          {
            code: '141',
            name: '焙烤食品制造',
            children: [
              {
                code: '1411',
                name: '糕点、面包制造',
                children: [],
              },
              {
                code: '1419',
                name: '饼干及其他焙烤食品制造',
                children: [],
              },
            ],
          },
          {
            code: '142',
            name: '糖果、巧克力及蜜饯制造',
            children: [
              {
                code: '1421',
                name: '糖果、巧克力制造',
                children: [],
              },
              {
                code: '1422',
                name: '蜜饯制作',
                children: [],
              },
            ],
          },
          {
            code: '143',
            name: '方便食品制造',
            children: [
              {
                code: '1431',
                name: '米、面制品制造',
                children: [],
              },
              {
                code: '1432',
                name: '速冻食品制造',
                children: [],
              },
              {
                code: '1433',
                name: '方便面制造',
                children: [],
              },
              {
                code: '1439',
                name: '其他方便食品制造',
                children: [],
              },
            ],
          },
          {
            code: '144',
            name: '乳制品制造',
            children: [
              {
                code: '1441',
                name: '液体乳制造',
                children: [],
              },
              {
                code: '1442',
                name: '乳粉制造',
                children: [],
              },
              {
                code: '1449',
                name: '其他乳制品制造',
                children: [],
              },
            ],
          },
          {
            code: '145',
            name: '罐头食品制造',
            children: [
              {
                code: '1451',
                name: '肉、禽类罐头制造',
                children: [],
              },
              {
                code: '1452',
                name: '水产品罐头制造',
                children: [],
              },
              {
                code: '1453',
                name: '蔬菜、水果罐头制造',
                children: [],
              },
              {
                code: '1459',
                name: '其他罐头食品制造',
                children: [],
              },
            ],
          },
          {
            code: '146',
            name: '调味品、发酵制品制造',
            children: [
              {
                code: '1461',
                name: '味精制造',
                children: [],
              },
              {
                code: '1462',
                name: '酱油、食醋及类似制品制造',
                children: [],
              },
              {
                code: '1469',
                name: '其他调味品、发酵制品制造',
                children: [],
              },
            ],
          },
          {
            code: '149',
            name: '其他食品制造',
            children: [
              {
                code: '1491',
                name: '营养食品制造',
                children: [],
              },
              {
                code: '1492',
                name: '保健食品制造',
                children: [],
              },
              {
                code: '1493',
                name: '冷冻饮品及食用冰制造',
                children: [],
              },
              {
                code: '1494',
                name: '盐加工',
                children: [],
              },
              {
                code: '1495',
                name: '食品及饲料添加剂制造',
                children: [],
              },
              {
                code: '1499',
                name: '其他未列明食品制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '15',
        name: '酒、饮料和精制茶制造业',
        children: [
          {
            code: '151',
            name: '酒的制造',
            children: [
              {
                code: '1511',
                name: '酒精制造',
                children: [],
              },
              {
                code: '1512',
                name: '白酒制造',
                children: [],
              },
              {
                code: '1513',
                name: '啤酒制造',
                children: [],
              },
              {
                code: '1514',
                name: '黄酒制造',
                children: [],
              },
              {
                code: '1515',
                name: '葡萄酒制造',
                children: [],
              },
              {
                code: '1519',
                name: '其他酒制造',
                children: [],
              },
            ],
          },
          {
            code: '152',
            name: '饮料制造',
            children: [
              {
                code: '1521',
                name: '碳酸饮料制造',
                children: [],
              },
              {
                code: '1522',
                name: '瓶（罐）装饮用水制造',
                children: [],
              },
              {
                code: '1523',
                name: '果菜汁及果菜汁饮料制造',
                children: [],
              },
              {
                code: '1524',
                name: '含乳饮料和植物蛋白饮料制造',
                children: [],
              },
              {
                code: '1525',
                name: '固体饮料制造',
                children: [],
              },
              {
                code: '1529',
                name: '茶饮料及其他饮料制造',
                children: [],
              },
            ],
          },
          {
            code: '153',
            name: '精制茶加工',
            children: [
              {
                code: '1530',
                name: '精制茶加工',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '16',
        name: '烟草制品业',
        children: [
          {
            code: '161',
            name: '烟叶复烤',
            children: [
              {
                code: '1610',
                name: '烟叶复烤',
                children: [],
              },
            ],
          },
          {
            code: '162',
            name: '卷烟制造',
            children: [
              {
                code: '1620',
                name: '卷烟制造',
                children: [],
              },
            ],
          },
          {
            code: '169',
            name: '其他烟草制品制造',
            children: [
              {
                code: '1690',
                name: '其他烟草制品制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '17',
        name: '纺织业',
        children: [
          {
            code: '171',
            name: '棉纺织及印染精加工',
            children: [
              {
                code: '1711',
                name: '棉纺纱加工',
                children: [],
              },
              {
                code: '1712',
                name: '棉织造加工',
                children: [],
              },
              {
                code: '1713',
                name: '棉印染精加工',
                children: [],
              },
            ],
          },
          {
            code: '172',
            name: '毛纺织及染整精加工',
            children: [
              {
                code: '1721',
                name: '毛条和毛纱线加工',
                children: [],
              },
              {
                code: '1722',
                name: '毛织造加工',
                children: [],
              },
              {
                code: '1723',
                name: '毛染整精加工',
                children: [],
              },
            ],
          },
          {
            code: '173',
            name: '麻纺织及染整精加工',
            children: [
              {
                code: '1731',
                name: '麻纤维纺前加工和纺纱',
                children: [],
              },
              {
                code: '1732',
                name: '麻织造加工',
                children: [],
              },
              {
                code: '1733',
                name: '麻染整精加工',
                children: [],
              },
            ],
          },
          {
            code: '174',
            name: '丝绢纺织及印染精加工',
            children: [
              {
                code: '1741',
                name: '缫丝加工',
                children: [],
              },
              {
                code: '1742',
                name: '绢纺和丝织加工',
                children: [],
              },
              {
                code: '1743',
                name: '丝印染精加工',
                children: [],
              },
            ],
          },
          {
            code: '175',
            name: '化纤织造及印染精加工',
            children: [
              {
                code: '1751',
                name: '化纤织造加工',
                children: [],
              },
              {
                code: '1752',
                name: '化纤织物染整精加工',
                children: [],
              },
            ],
          },
          {
            code: '176',
            name: '针织或钩针编织物及其制品制造',
            children: [
              {
                code: '1761',
                name: '针织或钩针编织物织造',
                children: [],
              },
              {
                code: '1762',
                name: '针织或钩针编织物印染精加工',
                children: [],
              },
              {
                code: '1763',
                name: '针织或钩针编织品制造',
                children: [],
              },
            ],
          },
          {
            code: '177',
            name: '家用纺织制成品制造',
            children: [
              {
                code: '1771',
                name: '床上用品制造',
                children: [],
              },
              {
                code: '1772',
                name: '毛巾类制品制造',
                children: [],
              },
              {
                code: '1773',
                name: '窗帘、布艺类产品制造',
                children: [],
              },
              {
                code: '1779',
                name: '其他家用纺织制成品制造',
                children: [],
              },
            ],
          },
          {
            code: '178',
            name: '产业用纺织制成品制造',
            children: [
              {
                code: '1781',
                name: '非织造布制造',
                children: [],
              },
              {
                code: '1782',
                name: '绳、索、缆制造',
                children: [],
              },
              {
                code: '1783',
                name: '纺织带和帘子布制造',
                children: [],
              },
              {
                code: '1784',
                name: '篷、帆布制造',
                children: [],
              },
              {
                code: '1789',
                name: '其他产业用纺织制成品制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '18',
        name: '纺织服装、服饰业',
        children: [
          {
            code: '181',
            name: '机织服装制造',
            children: [
              {
                code: '1811',
                name: '运动机织服装制造',
                children: [],
              },
              {
                code: '1819',
                name: '其他机织服装制造',
                children: [],
              },
            ],
          },
          {
            code: '182',
            name: '针织或钩针编织服装制造',
            children: [
              {
                code: '1821',
                name: '运动休闲针织服装制造',
                children: [],
              },
              {
                code: '1829',
                name: '其他针织或钩针编织服装制造',
                children: [],
              },
            ],
          },
          {
            code: '183',
            name: '服饰制造',
            children: [
              {
                code: '1830',
                name: '服饰制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '19',
        name: '皮革、毛皮、羽毛及其制品和制鞋业',
        children: [
          {
            code: '191',
            name: '皮革鞣制加工',
            children: [
              {
                code: '1910',
                name: '皮革鞣制加工',
                children: [],
              },
            ],
          },
          {
            code: '192',
            name: '皮革制品制造',
            children: [
              {
                code: '1921',
                name: '皮革服装制造',
                children: [],
              },
              {
                code: '1922',
                name: '皮箱、包（袋）制造',
                children: [],
              },
              {
                code: '1923',
                name: '皮手套及皮装饰制品制造',
                children: [],
              },
              {
                code: '1929',
                name: '其他皮革制品制造',
                children: [],
              },
            ],
          },
          {
            code: '193',
            name: '毛皮鞣制及制品加工',
            children: [
              {
                code: '1931',
                name: '毛皮鞣制加工',
                children: [],
              },
              {
                code: '1932',
                name: '毛皮服装加工',
                children: [],
              },
              {
                code: '1939',
                name: '其他毛皮制品加工',
                children: [],
              },
            ],
          },
          {
            code: '194',
            name: '羽毛(绒)加工及制品制造',
            children: [
              {
                code: '1941',
                name: '羽毛（绒）加工',
                children: [],
              },
              {
                code: '1942',
                name: '羽毛（绒）制品加工',
                children: [],
              },
            ],
          },
          {
            code: '195',
            name: '制鞋业',
            children: [
              {
                code: '1951',
                name: '纺织面料鞋制造',
                children: [],
              },
              {
                code: '1952',
                name: '皮鞋制造',
                children: [],
              },
              {
                code: '1953',
                name: '塑料鞋制造',
                children: [],
              },
              {
                code: '1954',
                name: '橡胶鞋制造',
                children: [],
              },
              {
                code: '1959',
                name: '其他制鞋业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '20',
        name: '木材加工和木、竹、藤、棕、草制品业',
        children: [
          {
            code: '201',
            name: '木材加工',
            children: [
              {
                code: '2011',
                name: '锯材加工',
                children: [],
              },
              {
                code: '2012',
                name: '木片加工',
                children: [],
              },
              {
                code: '2013',
                name: '单板加工',
                children: [],
              },
              {
                code: '2019',
                name: '其他木材加工',
                children: [],
              },
            ],
          },
          {
            code: '202',
            name: '人造板制造',
            children: [
              {
                code: '2021',
                name: '胶合板制造',
                children: [],
              },
              {
                code: '2022',
                name: '纤维板制造',
                children: [],
              },
              {
                code: '2023',
                name: '刨花板制造',
                children: [],
              },
              {
                code: '2029',
                name: '其他人造板制造',
                children: [],
              },
            ],
          },
          {
            code: '203',
            name: '木质制品制造',
            children: [
              {
                code: '2031',
                name: '建筑用木料及木材组件加工',
                children: [],
              },
              {
                code: '2032',
                name: '木门窗制造',
                children: [],
              },
              {
                code: '2033',
                name: '木楼梯制造',
                children: [],
              },
              {
                code: '2034',
                name: '木地板制造',
                children: [],
              },
              {
                code: '2035',
                name: '木制容器制造',
                children: [],
              },
              {
                code: '2039',
                name: '软木制品及其他木制品制造',
                children: [],
              },
            ],
          },
          {
            code: '204',
            name: '竹、藤、棕、草等制品制造',
            children: [
              {
                code: '2041',
                name: '竹制品制造',
                children: [],
              },
              {
                code: '2042',
                name: '藤制品制造',
                children: [],
              },
              {
                code: '2043',
                name: '棕制品制造',
                children: [],
              },
              {
                code: '2049',
                name: '草及其他制品制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '21',
        name: '家具制造业',
        children: [
          {
            code: '211',
            name: '木质家具制造',
            children: [
              {
                code: '2110',
                name: '木质家具制造',
                children: [],
              },
            ],
          },
          {
            code: '212',
            name: '竹、藤家具制造',
            children: [
              {
                code: '2120',
                name: '竹、藤家具制造',
                children: [],
              },
            ],
          },
          {
            code: '213',
            name: '金属家具制造',
            children: [
              {
                code: '2130',
                name: '金属家具制造',
                children: [],
              },
            ],
          },
          {
            code: '214',
            name: '塑料家具制造',
            children: [
              {
                code: '2140',
                name: '塑料家具制造',
                children: [],
              },
            ],
          },
          {
            code: '219',
            name: '其他家具制造',
            children: [
              {
                code: '2190',
                name: '其他家具制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '22',
        name: '造纸和纸制品业',
        children: [
          {
            code: '221',
            name: '纸浆制造',
            children: [
              {
                code: '2211',
                name: '木竹浆制造',
                children: [],
              },
              {
                code: '2212',
                name: '非木竹浆制造',
                children: [],
              },
            ],
          },
          {
            code: '222',
            name: '造纸',
            children: [
              {
                code: '2221',
                name: '机制纸及纸板制造',
                children: [],
              },
              {
                code: '2222',
                name: '手工纸制造',
                children: [],
              },
              {
                code: '2223',
                name: '加工纸制造',
                children: [],
              },
            ],
          },
          {
            code: '223',
            name: '纸制品制造',
            children: [
              {
                code: '2231',
                name: '纸和纸板容器制造',
                children: [],
              },
              {
                code: '2239',
                name: '其他纸制品制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '23',
        name: '印刷和记录媒介复制业',
        children: [
          {
            code: '231',
            name: '印刷',
            children: [
              {
                code: '2311',
                name: '书、报刊印刷',
                children: [],
              },
              {
                code: '2312',
                name: '本册印制',
                children: [],
              },
              {
                code: '2319',
                name: '包装装潢及其他印刷',
                children: [],
              },
            ],
          },
          {
            code: '232',
            name: '装订及印刷相关服务',
            children: [
              {
                code: '2320',
                name: '装订及印刷相关服务',
                children: [],
              },
            ],
          },
          {
            code: '233',
            name: '记录媒介复制',
            children: [
              {
                code: '2330',
                name: '记录媒介复制',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '24',
        name: '文教、工美、体育和娱乐用品制造业',
        children: [
          {
            code: '241',
            name: '文教办公用品制造',
            children: [
              {
                code: '2411',
                name: '文具制造',
                children: [],
              },
              {
                code: '2412',
                name: '笔的制造',
                children: [],
              },
              {
                code: '2413',
                name: '教学用模型及教具制造',
                children: [],
              },
              {
                code: '2414',
                name: '墨水、墨汁制造',
                children: [],
              },
              {
                code: '2419',
                name: '其他文教办公用品制造',
                children: [],
              },
            ],
          },
          {
            code: '242',
            name: '乐器制造',
            children: [
              {
                code: '2421',
                name: '中乐器制造',
                children: [],
              },
              {
                code: '2422',
                name: '西乐器制造',
                children: [],
              },
              {
                code: '2423',
                name: '电子乐器制造',
                children: [],
              },
              {
                code: '2429',
                name: '其他乐器及零件制造',
                children: [],
              },
            ],
          },
          {
            code: '243',
            name: '工艺美术及礼仪用品制造',
            children: [
              {
                code: '2431',
                name: '雕塑工艺品制造',
                children: [],
              },
              {
                code: '2432',
                name: '金属工艺品制造',
                children: [],
              },
              {
                code: '2433',
                name: '漆器工艺品制造',
                children: [],
              },
              {
                code: '2434',
                name: '花画工艺品制造',
                children: [],
              },
              {
                code: '2435',
                name: '天然植物纤维编织工艺品制造',
                children: [],
              },
              {
                code: '2436',
                name: '抽纱刺绣工艺品制造',
                children: [],
              },
              {
                code: '2437',
                name: '地毯、挂毯制造',
                children: [],
              },
              {
                code: '2438',
                name: '珠宝首饰及有关物品制造',
                children: [],
              },
              {
                code: '2439',
                name: '其他工艺美术及礼仪用品制造',
                children: [],
              },
            ],
          },
          {
            code: '244',
            name: '体育用品制造',
            children: [
              {
                code: '2441',
                name: '球类制造',
                children: [],
              },
              {
                code: '2442',
                name: '专项运动器材及配件制造',
                children: [],
              },
              {
                code: '2443',
                name: '健身器材制造',
                children: [],
              },
              {
                code: '2444',
                name: '运动防护用具制造',
                children: [],
              },
              {
                code: '2449',
                name: '其他体育用品制造',
                children: [],
              },
            ],
          },
          {
            code: '245',
            name: '玩具制造',
            children: [
              {
                code: '2451',
                name: '电玩具制造',
                children: [],
              },
              {
                code: '2452',
                name: '塑胶玩具制造',
                children: [],
              },
              {
                code: '2453',
                name: '金属玩具制造',
                children: [],
              },
              {
                code: '2454',
                name: '弹射玩具制造',
                children: [],
              },
              {
                code: '2455',
                name: '娃娃玩具制造',
                children: [],
              },
              {
                code: '2456',
                name: '儿童乘骑玩耍的童车类产品制造',
                children: [],
              },
              {
                code: '2459',
                name: '其他玩具制造',
                children: [],
              },
            ],
          },
          {
            code: '246',
            name: '游艺器材及娱乐用品制造',
            children: [
              {
                code: '2461',
                name: '露天游乐场所游乐设备制造',
                children: [],
              },
              {
                code: '2462',
                name: '游艺用品及室内游艺器材制造',
                children: [],
              },
              {
                code: '2469',
                name: '其他娱乐用品制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '25',
        name: '石油、煤炭及其他燃料加工业',
        children: [
          {
            code: '251',
            name: '精炼石油产品制造',
            children: [
              {
                code: '2511',
                name: '原油加工及石油制品制造',
                children: [],
              },
              {
                code: '2519',
                name: '其他原油制造',
                children: [],
              },
            ],
          },
          {
            code: '252',
            name: '煤炭加工',
            children: [
              {
                code: '2521',
                name: '炼焦',
                children: [],
              },
              {
                code: '2522',
                name: '煤制合成气生产',
                children: [],
              },
              {
                code: '2523',
                name: '煤制液体燃料生产',
                children: [],
              },
              {
                code: '2524',
                name: '煤制品制造',
                children: [],
              },
              {
                code: '2529',
                name: '其他煤炭加工',
                children: [],
              },
            ],
          },
          {
            code: '253',
            name: '核燃料加工',
            children: [
              {
                code: '2530',
                name: '核燃料加工',
                children: [],
              },
            ],
          },
          {
            code: '254',
            name: '生物质燃料加工',
            children: [
              {
                code: '2541',
                name: ' 生物质液体燃料生产',
                children: [],
              },
              {
                code: '2542',
                name: '生物质致密成型燃料加工',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '26',
        name: '化学原料和化学制品制造业',
        children: [
          {
            code: '261',
            name: '基础化学原料制造',
            children: [
              {
                code: '2611',
                name: '无机酸制造',
                children: [],
              },
              {
                code: '2612',
                name: '无机碱制造',
                children: [],
              },
              {
                code: '2613',
                name: '无机盐制造',
                children: [],
              },
              {
                code: '2614',
                name: '有机化学原料制造',
                children: [],
              },
              {
                code: '2619',
                name: '其他基础化学原料制造',
                children: [],
              },
            ],
          },
          {
            code: '262',
            name: '肥料制造',
            children: [
              {
                code: '2621',
                name: '氮肥制造',
                children: [],
              },
              {
                code: '2622',
                name: '磷肥制造',
                children: [],
              },
              {
                code: '2623',
                name: '钾肥制造',
                children: [],
              },
              {
                code: '2624',
                name: '复混肥料制造',
                children: [],
              },
              {
                code: '2625',
                name: '有机肥料及微生物肥料制造',
                children: [],
              },
              {
                code: '2629',
                name: '其他肥料制造',
                children: [],
              },
            ],
          },
          {
            code: '263',
            name: '农药制造',
            children: [
              {
                code: '2631',
                name: '化学农药制造',
                children: [],
              },
              {
                code: '2632',
                name: '生物化学农药及微生物农药制造',
                children: [],
              },
            ],
          },
          {
            code: '264',
            name: '涂料、油墨、颜料及类似产品制造',
            children: [
              {
                code: '2641',
                name: '涂料制造',
                children: [],
              },
              {
                code: '2642',
                name: '油墨及类似产品制造',
                children: [],
              },
              {
                code: '2643',
                name: '工业颜料制造',
                children: [],
              },
              {
                code: '2644',
                name: '工艺美术颜料制造',
                children: [],
              },
              {
                code: '2645',
                name: '染料制造',
                children: [],
              },
              {
                code: '2646',
                name: '密封用填料及类似品制造',
                children: [],
              },
            ],
          },
          {
            code: '265',
            name: '合成材料制造',
            children: [
              {
                code: '2651',
                name: '初级形态塑料及合成树脂制造',
                children: [],
              },
              {
                code: '2652',
                name: '合成橡胶制造',
                children: [],
              },
              {
                code: '2653',
                name: '合成纤维单（聚合）体制造',
                children: [],
              },
              {
                code: '2659',
                name: '其他合成材料制造',
                children: [],
              },
            ],
          },
          {
            code: '266',
            name: '专用化学产品制造',
            children: [
              {
                code: '2661',
                name: '化学试剂和助剂制造',
                children: [],
              },
              {
                code: '2662',
                name: '专项化学用品制造',
                children: [],
              },
              {
                code: '2663',
                name: '林产化学产品制造',
                children: [],
              },
              {
                code: '2664',
                name: '文化用信息化学品制造',
                children: [],
              },
              {
                code: '2665',
                name: '医学生产用信息化学品制造',
                children: [],
              },
              {
                code: '2666',
                name: '环境污染处理专用药剂材料制造',
                children: [],
              },
              {
                code: '2667',
                name: '动物胶制造',
                children: [],
              },
              {
                code: '2669',
                name: '其他专用化学产品制造',
                children: [],
              },
            ],
          },
          {
            code: '267',
            name: '炸药、火工及焰火产品制造',
            children: [
              {
                code: '2671',
                name: '炸药及火工产品制造',
                children: [],
              },
              {
                code: '2672',
                name: '焰火、鞭炮产品制造',
                children: [],
              },
            ],
          },
          {
            code: '268',
            name: '日用化学产品制造',
            children: [
              {
                code: '2681',
                name: '肥皂及洗涤剂制造',
                children: [],
              },
              {
                code: '2682',
                name: '化妆品制造',
                children: [],
              },
              {
                code: '2683',
                name: '口腔清洁用品制造',
                children: [],
              },
              {
                code: '2684',
                name: '香料、香精制造',
                children: [],
              },
              {
                code: '2689',
                name: '其他日用化学产品制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '27',
        name: '医药制造业',
        children: [
          {
            code: '271',
            name: '化学药品原料药制造',
            children: [
              {
                code: '2710',
                name: '化学药品原料药制造',
                children: [],
              },
            ],
          },
          {
            code: '272',
            name: '化学药品制剂制造',
            children: [
              {
                code: '2720',
                name: '化学药品制剂制造',
                children: [],
              },
            ],
          },
          {
            code: '273',
            name: '中药饮片加工',
            children: [
              {
                code: '2730',
                name: '中药饮片加工',
                children: [],
              },
            ],
          },
          {
            code: '274',
            name: '中成药生产',
            children: [
              {
                code: '2740',
                name: '中成药生产',
                children: [],
              },
            ],
          },
          {
            code: '275',
            name: '兽用药品制造',
            children: [
              {
                code: '2750',
                name: '兽用药品制造',
                children: [],
              },
            ],
          },
          {
            code: '276',
            name: '生物药品制品制造',
            children: [
              {
                code: '2761',
                name: '生物药品制造',
                children: [],
              },
              {
                code: '2762',
                name: '基因工程药物和疫苗制造',
                children: [],
              },
            ],
          },
          {
            code: '277',
            name: '卫生材料及医药用品制造',
            children: [
              {
                code: '2770',
                name: '卫生材料及医药用品制造',
                children: [],
              },
            ],
          },
          {
            code: '278',
            name: '药用辅料及包装材料',
            children: [
              {
                code: '2780',
                name: '药用辅料及包装材料',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '28',
        name: '化学纤维制造业',
        children: [
          {
            code: '281',
            name: '纤维素纤维原料及纤维制造',
            children: [
              {
                code: '2811',
                name: '化纤浆粕制造',
                children: [],
              },
              {
                code: '2812',
                name: '人造纤维（纤维素纤维）制造',
                children: [],
              },
            ],
          },
          {
            code: '282',
            name: '合成纤维制造',
            children: [
              {
                code: '2821',
                name: '锦纶纤维制造',
                children: [],
              },
              {
                code: '2822',
                name: '涤纶纤维制造',
                children: [],
              },
              {
                code: '2823',
                name: '腈纶纤维制造',
                children: [],
              },
              {
                code: '2824',
                name: '维纶纤维制造',
                children: [],
              },
              {
                code: '2825',
                name: '丙纶纤维制造',
                children: [],
              },
              {
                code: '2826',
                name: '氨纶纤维制造',
                children: [],
              },
              {
                code: '2829',
                name: '其他合成纤维制造',
                children: [],
              },
            ],
          },
          {
            code: '283',
            name: '生物基材料制造',
            children: [
              {
                code: '2831',
                name: '生物基化学纤维制造',
                children: [],
              },
              {
                code: '2832',
                name: '生物基、淀粉基新材料制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '29',
        name: '橡胶和塑料制品业',
        children: [
          {
            code: '291',
            name: '橡胶制品业',
            children: [
              {
                code: '2911',
                name: '轮胎制造',
                children: [],
              },
              {
                code: '2912',
                name: '橡胶板、管、带制造',
                children: [],
              },
              {
                code: '2913',
                name: '橡胶零件制造',
                children: [],
              },
              {
                code: '2914',
                name: '再生橡胶制造',
                children: [],
              },
              {
                code: '2915',
                name: '日用及医用橡胶制品制造',
                children: [],
              },
              {
                code: '2916',
                name: '运动场地用塑胶制造',
                children: [],
              },
              {
                code: '2919',
                name: '其他橡胶制品制造',
                children: [],
              },
            ],
          },
          {
            code: '292',
            name: '塑料制品业',
            children: [
              {
                code: '2921',
                name: '塑料薄膜制造',
                children: [],
              },
              {
                code: '2922',
                name: '塑料板、管、型材制造',
                children: [],
              },
              {
                code: '2923',
                name: '塑料丝、绳及编织品制造',
                children: [],
              },
              {
                code: '2924',
                name: '泡沫塑料制造',
                children: [],
              },
              {
                code: '2925',
                name: '塑料人造革、合成革制造',
                children: [],
              },
              {
                code: '2926',
                name: '塑料包装箱及容器制造',
                children: [],
              },
              {
                code: '2927',
                name: '日用塑料制品制造',
                children: [],
              },
              {
                code: '2928',
                name: '人造草坪制造',
                children: [],
              },
              {
                code: '2929',
                name: '塑料零件及其他塑料制品制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '30',
        name: '非金属矿物制品业',
        children: [
          {
            code: '301',
            name: '水泥、石灰和石膏制造',
            children: [
              {
                code: '3011',
                name: '水泥制造',
                children: [],
              },
              {
                code: '3012',
                name: '石灰和石膏制造',
                children: [],
              },
            ],
          },
          {
            code: '302',
            name: '石膏、水泥制品及类似制品制造',
            children: [
              {
                code: '3021',
                name: '水泥制品制造',
                children: [],
              },
              {
                code: '3022',
                name: '砼结构构件制造',
                children: [],
              },
              {
                code: '3023',
                name: '石棉水泥制品制造',
                children: [],
              },
              {
                code: '3024',
                name: '轻质建筑材料制造',
                children: [],
              },
              {
                code: '3029',
                name: '其他水泥类似制品制造',
                children: [],
              },
            ],
          },
          {
            code: '303',
            name: '砖瓦、石材等建筑材料制造',
            children: [
              {
                code: '3031',
                name: '粘土砖瓦及建筑砌块制造',
                children: [],
              },
              {
                code: '3032',
                name: '建筑用石加工',
                children: [],
              },
              {
                code: '3033',
                name: '防水建筑材料制造',
                children: [],
              },
              {
                code: '3034',
                name: '隔热和隔音材料制造',
                children: [],
              },
              {
                code: '3039',
                name: '其他建筑材料制造',
                children: [],
              },
            ],
          },
          {
            code: '304',
            name: '玻璃制造',
            children: [
              {
                code: '3041',
                name: '平板玻璃制造',
                children: [],
              },
              {
                code: '3042',
                name: '特种玻璃制造',
                children: [],
              },
              {
                code: '3049',
                name: '其他玻璃制造',
                children: [],
              },
            ],
          },
          {
            code: '305',
            name: '玻璃制品制造',
            children: [
              {
                code: '3051',
                name: '技术玻璃制品制造',
                children: [],
              },
              {
                code: '3052',
                name: '光学玻璃制造',
                children: [],
              },
              {
                code: '3053',
                name: '玻璃仪器制造',
                children: [],
              },
              {
                code: '3054',
                name: '日用玻璃制品制造',
                children: [],
              },
              {
                code: '3055',
                name: '玻璃包装容器制造',
                children: [],
              },
              {
                code: '3056',
                name: '玻璃保温容器制造',
                children: [],
              },
              {
                code: '3057',
                name: '制镜及类似品加工',
                children: [],
              },
              {
                code: '3059',
                name: '其他玻璃制品制造',
                children: [],
              },
            ],
          },
          {
            code: '306',
            name: '玻璃纤维和玻璃纤维增强塑料制品制',
            children: [
              {
                code: '3061',
                name: '玻璃纤维及制品制造',
                children: [],
              },
              {
                code: '3062',
                name: '玻璃纤维增强塑料制品制造',
                children: [],
              },
            ],
          },
          {
            code: '307',
            name: '陶瓷制品制造',
            children: [
              {
                code: '3071',
                name: '建筑陶瓷制品制造',
                children: [],
              },
              {
                code: '3072',
                name: '卫生陶瓷制品制造',
                children: [],
              },
              {
                code: '3073',
                name: '特种陶瓷制品制造',
                children: [],
              },
              {
                code: '3074',
                name: '日用陶瓷制品制造',
                children: [],
              },
              {
                code: '3075',
                name: '陈设艺术陶瓷制造',
                children: [],
              },
              {
                code: '3076',
                name: '园艺陶瓷制造',
                children: [],
              },
              {
                code: '3079',
                name: '其他陶瓷制品制造',
                children: [],
              },
            ],
          },
          {
            code: '308',
            name: '耐火材料制品制造',
            children: [
              {
                code: '3081',
                name: '石棉制品制造',
                children: [],
              },
              {
                code: '3082',
                name: '云母制品制造',
                children: [],
              },
              {
                code: '3089',
                name: '耐火陶瓷制品及其他耐火材料制造',
                children: [],
              },
            ],
          },
          {
            code: '309',
            name: '石墨及其他非金属矿物制品制造',
            children: [
              {
                code: '3091',
                name: '石墨及碳素制品制造',
                children: [],
              },
              {
                code: '3099',
                name: '其他非金属矿物制品制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '31',
        name: '黑色金属冶炼和压延加工业',
        children: [
          {
            code: '311',
            name: '炼铁',
            children: [
              {
                code: '3110',
                name: '炼铁',
                children: [],
              },
            ],
          },
          {
            code: '312',
            name: '炼钢',
            children: [
              {
                code: '3120',
                name: '炼钢',
                children: [],
              },
            ],
          },
          {
            code: '313',
            name: '钢压延加工',
            children: [
              {
                code: '3130',
                name: '钢压延加工',
                children: [],
              },
            ],
          },
          {
            code: '314',
            name: '铁合金冶炼',
            children: [
              {
                code: '3140',
                name: '铁合金冶炼',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '32',
        name: '有色金属冶炼和压延加工业',
        children: [
          {
            code: '321',
            name: '常用有色金属冶炼',
            children: [
              {
                code: '3211',
                name: '铜冶炼',
                children: [],
              },
              {
                code: '3212',
                name: '铅锌冶炼',
                children: [],
              },
              {
                code: '3213',
                name: '镍钴冶炼',
                children: [],
              },
              {
                code: '3214',
                name: '锡冶炼',
                children: [],
              },
              {
                code: '3215',
                name: '锑冶炼',
                children: [],
              },
              {
                code: '3216',
                name: '铝冶炼',
                children: [],
              },
              {
                code: '3217',
                name: '镁冶炼',
                children: [],
              },
              {
                code: '3218',
                name: '硅冶炼',
                children: [],
              },
              {
                code: '3219',
                name: '其他常用有色金属冶炼',
                children: [],
              },
            ],
          },
          {
            code: '322',
            name: '贵金属冶炼',
            children: [
              {
                code: '3221',
                name: '金冶炼',
                children: [],
              },
              {
                code: '3222',
                name: '银冶炼',
                children: [],
              },
              {
                code: '3229',
                name: '其他贵金属冶炼',
                children: [],
              },
            ],
          },
          {
            code: '323',
            name: '稀有稀土金属冶炼',
            children: [
              {
                code: '3231',
                name: '钨钼冶炼',
                children: [],
              },
              {
                code: '3232',
                name: '稀土金属冶炼',
                children: [],
              },
              {
                code: '3239',
                name: '其他稀有金属冶炼',
                children: [],
              },
            ],
          },
          {
            code: '324',
            name: '有色金属合金制造',
            children: [
              {
                code: '3240',
                name: '有色金属合金制造',
                children: [],
              },
            ],
          },
          {
            code: '325',
            name: '有色金属压延加工',
            children: [
              {
                code: '3251',
                name: '铜压延加工',
                children: [],
              },
              {
                code: '3252',
                name: '铝压延加工',
                children: [],
              },
              {
                code: '3253',
                name: '贵金属压延加工',
                children: [],
              },
              {
                code: '3254',
                name: '稀有稀土金属压延加工',
                children: [],
              },
              {
                code: '3259',
                name: '其他有色金属压延加工',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '33',
        name: '金属制品业',
        children: [
          {
            code: '331',
            name: '结构性金属制品制造',
            children: [
              {
                code: '3311',
                name: '金属结构制造',
                children: [],
              },
              {
                code: '3312',
                name: '金属门窗制造',
                children: [],
              },
            ],
          },
          {
            code: '332',
            name: '金属工具制造',
            children: [
              {
                code: '3321',
                name: '切削工具制造',
                children: [],
              },
              {
                code: '3322',
                name: '手工具制造',
                children: [],
              },
              {
                code: '3323',
                name: '农用及园林用金属工具制造',
                children: [],
              },
              {
                code: '3324',
                name: '刀剪及类似日用金属工具制造',
                children: [],
              },
              {
                code: '3329',
                name: '其他金属工具制造',
                children: [],
              },
            ],
          },
          {
            code: '333',
            name: '集装箱及金属包装容器制造',
            children: [
              {
                code: '3331',
                name: '集装箱制造',
                children: [],
              },
              {
                code: '3332',
                name: '金属压力容器制造',
                children: [],
              },
              {
                code: '3333',
                name: '金属包装容器及材料制造',
                children: [],
              },
            ],
          },
          {
            code: '334',
            name: '金属丝绳及其制品制造',
            children: [
              {
                code: '3340',
                name: '金属丝绳及其制品制造',
                children: [],
              },
            ],
          },
          {
            code: '335',
            name: '建筑、安全用金属制品制造',
            children: [
              {
                code: '3351',
                name: '建筑、家具用金属配件制造',
                children: [],
              },
              {
                code: '3352',
                name: '建筑装饰及水暖管道零件制造',
                children: [],
              },
              {
                code: '3353',
                name: '安全、消防用金属制品制造',
                children: [],
              },
              {
                code: '3359',
                name: '其他建筑、安全用金属制品制造',
                children: [],
              },
            ],
          },
          {
            code: '336',
            name: '金属表面处理及热处理加工',
            children: [
              {
                code: '3360',
                name: '金属表面处理及热处理加工',
                children: [],
              },
            ],
          },
          {
            code: '337',
            name: '搪瓷制品制造',
            children: [
              {
                code: '3371',
                name: '生产专用搪瓷制品制造',
                children: [],
              },
              {
                code: '3372',
                name: '建筑装饰搪瓷制品制造',
                children: [],
              },
              {
                code: '3373',
                name: '搪瓷卫生洁具制造',
                children: [],
              },
              {
                code: '3379',
                name: '搪瓷日用品及其他搪瓷制品制造',
                children: [],
              },
            ],
          },
          {
            code: '338',
            name: '金属制日用品制造',
            children: [
              {
                code: '3381',
                name: '金属制厨房用器具制造',
                children: [],
              },
              {
                code: '3382',
                name: '金属制餐具和器皿制造',
                children: [],
              },
              {
                code: '3383',
                name: '金属制卫生器具制造',
                children: [],
              },
              {
                code: '3389',
                name: '其他金属制日用品制造',
                children: [],
              },
            ],
          },
          {
            code: '339',
            name: '铸造及其他金属制品制造',
            children: [
              {
                code: '3391',
                name: '黑色金属铸造',
                children: [],
              },
              {
                code: '3392',
                name: '有色金属铸造',
                children: [],
              },
              {
                code: '3393',
                name: '锻件及粉末冶金制品制造',
                children: [],
              },
              {
                code: '3394',
                name: '交通及公共管理用金属标牌制造',
                children: [],
              },
              {
                code: '3399',
                name: '其他未列明金属制品制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '34',
        name: '通用设备制造业',
        children: [
          {
            code: '341',
            name: '锅炉及原动设备制造',
            children: [
              {
                code: '3411',
                name: '锅炉及辅助设备制造',
                children: [],
              },
              {
                code: '3412',
                name: '内燃机及配件制造',
                children: [],
              },
              {
                code: '3413',
                name: '汽轮机及辅机制造',
                children: [],
              },
              {
                code: '3414',
                name: '水轮机及辅机制造',
                children: [],
              },
              {
                code: '3415',
                name: '风能原动设备制造',
                children: [],
              },
              {
                code: '3419',
                name: '其他原动设备制造',
                children: [],
              },
            ],
          },
          {
            code: '342',
            name: '金属加工机械制造',
            children: [
              {
                code: '3421',
                name: '金属切削机床制造',
                children: [],
              },
              {
                code: '3422',
                name: '金属成形机床制造',
                children: [],
              },
              {
                code: '3423',
                name: '铸造机械制造',
                children: [],
              },
              {
                code: '3424',
                name: '金属切割及焊接设备制造',
                children: [],
              },
              {
                code: '3425',
                name: '机床功能部件及附件制造',
                children: [],
              },
              {
                code: '3429',
                name: '其他金属加工机械制造',
                children: [],
              },
            ],
          },
          {
            code: '343',
            name: '物料搬运设备制造',
            children: [
              {
                code: '3431',
                name: '轻小型起重设备制造',
                children: [],
              },
              {
                code: '3432',
                name: '生产专用起重机制造',
                children: [],
              },
              {
                code: '3433',
                name: '生产专用车辆制造',
                children: [],
              },
              {
                code: '3434',
                name: '连续搬运设备制造',
                children: [],
              },
              {
                code: '3435',
                name: '电梯、自动扶梯及升降机制造',
                children: [],
              },
              {
                code: '3436',
                name: '客运索道制造',
                children: [],
              },
              {
                code: '3437',
                name: '机械式停车设备制造',
                children: [],
              },
              {
                code: '3439',
                name: '其他物料搬运设备制造',
                children: [],
              },
            ],
          },
          {
            code: '344',
            name: '泵、阀门、压缩机及类似机械制造',
            children: [
              {
                code: '3441',
                name: '泵及真空设备制造',
                children: [],
              },
              {
                code: '3442',
                name: '气体压缩机械制造',
                children: [],
              },
              {
                code: '3443',
                name: '阀门和旋塞制造',
                children: [],
              },
              {
                code: '3444',
                name: '液压动力机械及元件制造',
                children: [],
              },
              {
                code: '3445',
                name: '液力动力机械元件制造',
                children: [],
              },
              {
                code: '3446',
                name: '气压动力机械及元件制造',
                children: [],
              },
            ],
          },
          {
            code: '345',
            name: '轴承、齿轮和传动部件制造',
            children: [
              {
                code: '3451',
                name: '滚动轴承制造',
                children: [],
              },
              {
                code: '3452',
                name: '滑动轴承制造',
                children: [],
              },
              {
                code: '3453',
                name: '齿轮及齿轮减、变速箱制造',
                children: [],
              },
              {
                code: '3459',
                name: '其他传动部件制造',
                children: [],
              },
            ],
          },
          {
            code: '346',
            name: '烘炉、风机、包装等设备制造',
            children: [
              {
                code: '3461',
                name: '烘炉、熔炉及电炉制造',
                children: [],
              },
              {
                code: '3462',
                name: '风机、风扇制造',
                children: [],
              },
              {
                code: '3463',
                name: '气体、液体分离及纯净设备制造',
                children: [],
              },
              {
                code: '3464',
                name: '制冷、空调设备制造',
                children: [],
              },
              {
                code: '3465',
                name: '风动和电动工具制造',
                children: [],
              },
              {
                code: '3466',
                name: '喷枪及类似器具制造',
                children: [],
              },
              {
                code: '3467',
                name: '包装专用设备制造',
                children: [],
              },
            ],
          },
          {
            code: '347',
            name: '文化、办公用机械制造',
            children: [
              {
                code: '3471',
                name: '电影机械制造',
                children: [],
              },
              {
                code: '3472',
                name: '幻灯及投影设备制造',
                children: [],
              },
              {
                code: '3473',
                name: '照相机及器材制造',
                children: [],
              },
              {
                code: '3474',
                name: '复印和胶印设备制造',
                children: [],
              },
              {
                code: '3475',
                name: '计算器及货币专用设备制造',
                children: [],
              },
              {
                code: '3479',
                name: '其他文化、办公用机械制造',
                children: [],
              },
            ],
          },
          {
            code: '348',
            name: '通用零部件制造',
            children: [
              {
                code: '3481',
                name: '金属密封件制造',
                children: [],
              },
              {
                code: '3482',
                name: '紧固件制造',
                children: [],
              },
              {
                code: '3483',
                name: '弹簧制造',
                children: [],
              },
              {
                code: '3484',
                name: '机械零部件加工',
                children: [],
              },
              {
                code: '3489',
                name: '其他通用零部件制造',
                children: [],
              },
            ],
          },
          {
            code: '349',
            name: '其他通用设备制造业',
            children: [
              {
                code: '3491',
                name: '工业机器人制造',
                children: [],
              },
              {
                code: '3492',
                name: '特殊作业机器人制造',
                children: [],
              },
              {
                code: '3493',
                name: '增材制造装备制造',
                children: [],
              },
              {
                code: '3499',
                name: '其他未列明通用设备制造业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '35',
        name: '专用设备制造业',
        children: [
          {
            code: '351',
            name: '采矿、冶金、建筑专用设备制造',
            children: [
              {
                code: '3511',
                name: '矿山机械制造',
                children: [],
              },
              {
                code: '3512',
                name: '石油钻采专用设备制造',
                children: [],
              },
              {
                code: '3513',
                name: '深海石油钻探设备制造',
                children: [],
              },
              {
                code: '3514',
                name: '建筑工程用机械制造',
                children: [],
              },
              {
                code: '3515',
                name: '建筑材料生产专用机械制造',
                children: [],
              },
              {
                code: '3516',
                name: '冶金专用设备制造',
                children: [],
              },
              {
                code: '3517',
                name: '隧道施工专用机械制造',
                children: [],
              },
            ],
          },
          {
            code: '352',
            name: '化工、木材、非金属加工专用设备制造',
            children: [
              {
                code: '3521',
                name: '炼油、化工生产专用设备制造',
                children: [],
              },
              {
                code: '3522',
                name: '橡胶加工专用设备制造',
                children: [],
              },
              {
                code: '3523',
                name: '塑料加工专用设备制造',
                children: [],
              },
              {
                code: '3524',
                name: '木竹材加工机械制造',
                children: [],
              },
              {
                code: '3525',
                name: '模具制造',
                children: [],
              },
              {
                code: '3529',
                name: '其他非金属加工专用设备制造',
                children: [],
              },
            ],
          },
          {
            code: '353',
            name: '食品、饮料、烟草及饲料生产专用设备制造',
            children: [
              {
                code: '3531',
                name: '食品、酒、饮料及茶生产专用设备制     指主要用于食品、酒、饮料生产及茶制品加',
                children: [],
              },
              {
                code: '3532',
                name: '农副食品加工专用设备制造',
                children: [],
              },
              {
                code: '3533',
                name: '烟草生产专用设备制造',
                children: [],
              },
              {
                code: '3534',
                name: '饲料生产专用设备制造',
                children: [],
              },
            ],
          },
          {
            code: '354',
            name: '印刷、制药、日化及日用品生产专用设',
            children: [
              {
                code: '3541',
                name: '制浆和造纸专用设备制造',
                children: [],
              },
              {
                code: '3542',
                name: '印刷专用设备制造',
                children: [],
              },
              {
                code: '3543',
                name: '日用化工专用设备制造',
                children: [],
              },
              {
                code: '3544',
                name: '制药专用设备制造',
                children: [],
              },
              {
                code: '3545',
                name: '照明器具生产专用设备制造',
                children: [],
              },
              {
                code: '3546',
                name: '玻璃、陶瓷和搪瓷制品生产专用设备',
                children: [],
              },
              {
                code: '3549',
                name: '其他日用品生产专用设备制造',
                children: [],
              },
            ],
          },
          {
            code: '355',
            name: '纺织、服装和皮革加工专用设备制造',
            children: [
              {
                code: '3551',
                name: '纺织专用设备制造',
                children: [],
              },
              {
                code: '3552',
                name: '皮革、毛皮及其制品加工专用设备制',
                children: [],
              },
              {
                code: '3553',
                name: '缝制机械制造',
                children: [],
              },
              {
                code: '3554',
                name: '洗涤机械制造',
                children: [],
              },
            ],
          },
          {
            code: '356',
            name: '电子和电工机械专用设备制造',
            children: [
              {
                code: '3561',
                name: '电工机械专用设备制造',
                children: [],
              },
              {
                code: '3562',
                name: '半导体器件专用设备制造',
                children: [],
              },
              {
                code: '3563',
                name: '电子元器件与机电组件设备制造',
                children: [],
              },
              {
                code: '3569',
                name: '其他电子专用设备制造',
                children: [],
              },
            ],
          },
          {
            code: '357',
            name: '农、林、牧、渔专用机械制造',
            children: [
              {
                code: '3571',
                name: '拖拉机制造',
                children: [],
              },
              {
                code: '3572',
                name: '机械化农业及园艺机具制造',
                children: [],
              },
              {
                code: '3573',
                name: '营林及木竹采伐机械制造',
                children: [],
              },
              {
                code: '3574',
                name: '畜牧机械制造',
                children: [],
              },
              {
                code: '3575',
                name: '渔业机械制造',
                children: [],
              },
              {
                code: '3576',
                name: '农林牧渔机械配件制造',
                children: [],
              },
              {
                code: '3577',
                name: '棉花加工机械制造',
                children: [],
              },
              {
                code: '3579',
                name: '其他农、林、牧、渔业机械制造',
                children: [],
              },
            ],
          },
          {
            code: '358',
            name: '医疗仪器设备及器械制造',
            children: [
              {
                code: '3581',
                name: '医疗诊断、监护及治疗设备制造',
                children: [],
              },
              {
                code: '3582',
                name: '口腔科用设备及器具制造',
                children: [],
              },
              {
                code: '3583',
                name: '医疗实验室及医用消毒设备和器具',
                children: [],
              },
              {
                code: '3584',
                name: '医疗、外科及兽医用器械制造',
                children: [],
              },
              {
                code: '3585',
                name: '机械治疗及病房护理设备制造',
                children: [],
              },
              {
                code: '3586',
                name: '康复辅具制造',
                children: [],
              },
              {
                code: '3587',
                name: '眼镜制造',
                children: [],
              },
              {
                code: '3589',
                name: '其他医疗设备及器械制造',
                children: [],
              },
            ],
          },
          {
            code: '359',
            name: '环保、邮政、社会公共服务及其他专用',
            children: [
              {
                code: '3591',
                name: '环境保护专用设备制造',
                children: [],
              },
              {
                code: '3592',
                name: '地质勘查专用设备制造',
                children: [],
              },
              {
                code: '3593',
                name: '邮政专用机械及器材制造',
                children: [],
              },
              {
                code: '3594',
                name: '商业、饮食、服务专用设备制造',
                children: [],
              },
              {
                code: '3595',
                name: '社会公共安全设备及器材制造',
                children: [],
              },
              {
                code: '3596',
                name: '交通安全、管制及类似专用设备制造',
                children: [],
              },
              {
                code: '3597',
                name: '水资源专用机械制造',
                children: [],
              },
              {
                code: '3599',
                name: '其他专用设备制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '36',
        name: '汽车制造业',
        children: [
          {
            code: '361',
            name: '汽车整车制造',
            children: [
              {
                code: '3611',
                name: '汽柴油车整车制造',
                children: [],
              },
              {
                code: '3612',
                name: '新能源车整车制造',
                children: [],
              },
            ],
          },
          {
            code: '362',
            name: '汽车用发动机制造',
            children: [
              {
                code: '3620',
                name: '汽车用发动机制造',
                children: [],
              },
            ],
          },
          {
            code: '363',
            name: '改装汽车制造',
            children: [
              {
                code: '3630',
                name: '改装汽车制造',
                children: [],
              },
            ],
          },
          {
            code: '364',
            name: '低速汽车制造',
            children: [
              {
                code: '3640',
                name: '低速汽车制造',
                children: [],
              },
            ],
          },
          {
            code: '365',
            name: '电车制造',
            children: [
              {
                code: '3650',
                name: '电车制造',
                children: [],
              },
            ],
          },
          {
            code: '366',
            name: '汽车车身、挂车制造',
            children: [
              {
                code: '3660',
                name: '汽车车身、挂车制造',
                children: [],
              },
            ],
          },
          {
            code: '367',
            name: '汽车零部件及配件制造',
            children: [
              {
                code: '3670',
                name: '汽车零部件及配件制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '37',
        name: '铁路、船舶、航空航天和其他运输设备制',
        children: [
          {
            code: '371',
            name: '铁路运输设备制造',
            children: [
              {
                code: '3711',
                name: '高铁车组制造',
                children: [],
              },
              {
                code: '3712',
                name: '铁路机车车辆制造',
                children: [],
              },
              {
                code: '3713',
                name: '窄轨机车车辆制造',
                children: [],
              },
              {
                code: '3714',
                name: '高铁设备、配件制造',
                children: [],
              },
              {
                code: '3715',
                name: '铁路机车车辆配件制造',
                children: [],
              },
              {
                code: '3716',
                name: '铁路专用设备及器材、配件制造',
                children: [],
              },
              {
                code: '3719',
                name: '其他铁路运输设备制造',
                children: [],
              },
            ],
          },
          {
            code: '372',
            name: '城市轨道交通设备制造',
            children: [
              {
                code: '3720',
                name: '城市轨道交通设备制造',
                children: [],
              },
            ],
          },
          {
            code: '373',
            name: '船舶及相关装置制造',
            children: [
              {
                code: '3731',
                name: '金属船舶制造',
                children: [],
              },
              {
                code: '3732',
                name: '非金属船舶制造',
                children: [],
              },
              {
                code: '3733',
                name: '娱乐船和运动船制造',
                children: [],
              },
              {
                code: '3734',
                name: '船用配套设备制造',
                children: [],
              },
              {
                code: '3735',
                name: '船舶改装',
                children: [],
              },
              {
                code: '3736',
                name: '船舶拆除',
                children: [],
              },
              {
                code: '3737',
                name: '海洋工程装备制造',
                children: [],
              },
              {
                code: '3739',
                name: '航标器材及其他相关装置制造',
                children: [],
              },
            ],
          },
          {
            code: '374',
            name: '航空、航天器及设备制造',
            children: [
              {
                code: '3741',
                name: '飞机制造',
                children: [],
              },
              {
                code: '3742',
                name: '航天器及运载火箭制造',
                children: [],
              },
              {
                code: '3743',
                name: '航天相关设备制造',
                children: [],
              },
              {
                code: '3744',
                name: '航空相关设备制造',
                children: [],
              },
              {
                code: '3749',
                name: '其他航空航天器制造',
                children: [],
              },
            ],
          },
          {
            code: '375',
            name: '摩托车制造',
            children: [
              {
                code: '3751',
                name: '摩托车整车制造',
                children: [],
              },
              {
                code: '3752',
                name: '摩托车零部件及配件制造',
                children: [],
              },
            ],
          },
          {
            code: '376',
            name: '自行车和残疾人座车制造',
            children: [
              {
                code: '3761',
                name: '自行车制造',
                children: [],
              },
              {
                code: '3762',
                name: '残疾人座车制造',
                children: [],
              },
            ],
          },
          {
            code: '377',
            name: '助动车制造',
            children: [
              {
                code: '3770',
                name: '助动车制造',
                children: [],
              },
            ],
          },
          {
            code: '378',
            name: '非公路休闲车及零配件制造',
            children: [
              {
                code: '3780',
                name: '非公路休闲车及零配件制造',
                children: [],
              },
            ],
          },
          {
            code: '379',
            name: '潜水救捞及其他未列明运输设备制造',
            children: [
              {
                code: '3791',
                name: '潜水装备制造',
                children: [],
              },
              {
                code: '3792',
                name: '水下救捞装备制造',
                children: [],
              },
              {
                code: '3799',
                name: '其他未列明运输设备制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '38',
        name: '电气机械和器材制造业',
        children: [
          {
            code: '381',
            name: '电机制造',
            children: [
              {
                code: '3811',
                name: '发电机及发电机组制造',
                children: [],
              },
              {
                code: '3812',
                name: '电动机制造',
                children: [],
              },
              {
                code: '3813',
                name: '微特电机及组件制造',
                children: [],
              },
              {
                code: '3819',
                name: '其他电机制造',
                children: [],
              },
            ],
          },
          {
            code: '382',
            name: '输配电及控制设备制造',
            children: [
              {
                code: '3821',
                name: '变压器、整流器和电感器制造',
                children: [],
              },
              {
                code: '3822',
                name: '电容器及其配套设备制造',
                children: [],
              },
              {
                code: '3823',
                name: '配电开关控制设备制造',
                children: [],
              },
              {
                code: '3824',
                name: '电力电子元器件制造',
                children: [],
              },
              {
                code: '3825',
                name: '光伏设备及元器件制造',
                children: [],
              },
              {
                code: '3829',
                name: '其他输配电及控制设备制造',
                children: [],
              },
            ],
          },
          {
            code: '383',
            name: '电线、电缆、光缆及电工器材制造',
            children: [
              {
                code: '3831',
                name: '电线、电缆制造',
                children: [],
              },
              {
                code: '3832',
                name: '光纤制造',
                children: [],
              },
              {
                code: '3833',
                name: '光缆制造',
                children: [],
              },
              {
                code: '3834',
                name: '绝缘制品制造',
                children: [],
              },
              {
                code: '3839',
                name: '其他电工器材制造',
                children: [],
              },
            ],
          },
          {
            code: '384',
            name: '电池制造',
            children: [
              {
                code: '3841',
                name: '锂离子电池制造',
                children: [],
              },
              {
                code: '3842',
                name: '镍氢电池制造',
                children: [],
              },
              {
                code: '3843',
                name: '铅蓄电池制造',
                children: [],
              },
              {
                code: '3844',
                name: '锌锰电池制造',
                children: [],
              },
              {
                code: '3849',
                name: '其他电池制造',
                children: [],
              },
            ],
          },
          {
            code: '385',
            name: '家用电力器具制造',
            children: [
              {
                code: '3851',
                name: '家用制冷电器具制造',
                children: [],
              },
              {
                code: '3852',
                name: '家用空气调节器制造',
                children: [],
              },
              {
                code: '3853',
                name: '家用通风电器具制造',
                children: [],
              },
              {
                code: '3854',
                name: '家用厨房电器具制造',
                children: [],
              },
              {
                code: '3855',
                name: '家用清洁卫生电器具制造',
                children: [],
              },
              {
                code: '3856',
                name: '家用美容、保健护理电器具制造',
                children: [],
              },
              {
                code: '3857',
                name: '家用电力器具专用配件制造',
                children: [],
              },
              {
                code: '3859',
                name: '其他家用电力器具制造',
                children: [],
              },
            ],
          },
          {
            code: '386',
            name: '非电力家用器具制造',
            children: [
              {
                code: '3861',
                name: '燃气及类似能源家用器具制造',
                children: [],
              },
              {
                code: '3862',
                name: '太阳能器具制造',
                children: [],
              },
              {
                code: '3869',
                name: '其他非电力家用器具制造',
                children: [],
              },
            ],
          },
          {
            code: '387',
            name: '照明器具制造',
            children: [
              {
                code: '3871',
                name: '电光源制造',
                children: [],
              },
              {
                code: '3872',
                name: '照明灯具制造',
                children: [],
              },
              {
                code: '3873',
                name: '舞台及场地用灯制造',
                children: [],
              },
              {
                code: '3874',
                name: '智能照明器具制造',
                children: [],
              },
              {
                code: '3879',
                name: '灯用电器附件及其他照明器具制造',
                children: [],
              },
            ],
          },
          {
            code: '389',
            name: '其他电气机械及器材制造',
            children: [
              {
                code: '3891',
                name: '电气信号设备装置制造',
                children: [],
              },
              {
                code: '3899',
                name: '其他未列明电气机械及器材制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '39',
        name: '计算机、通信和其他电子设备制造业',
        children: [
          {
            code: '391',
            name: '计算机制造',
            children: [
              {
                code: '3911',
                name: '计算机整机制造',
                children: [],
              },
              {
                code: '3912',
                name: '计算机零部件制造',
                children: [],
              },
              {
                code: '3913',
                name: '计算机外围设备制造',
                children: [],
              },
              {
                code: '3914',
                name: '工业控制计算机及系统制造',
                children: [],
              },
              {
                code: '3915',
                name: '信息安全设备制造',
                children: [],
              },
              {
                code: '3919',
                name: '其他计算机制造',
                children: [],
              },
            ],
          },
          {
            code: '392',
            name: '通信设备制造',
            children: [
              {
                code: '3921',
                name: '通信系统设备制造',
                children: [],
              },
              {
                code: '3922',
                name: '通信终端设备制造',
                children: [],
              },
            ],
          },
          {
            code: '393',
            name: '广播电视设备制造',
            children: [
              {
                code: '3931',
                name: '广播电视节目制作及发射设备制造',
                children: [],
              },
              {
                code: '3932',
                name: '广播电视接收设备制造',
                children: [],
              },
              {
                code: '3933',
                name: '广播电视专用配件制造',
                children: [],
              },
              {
                code: '3934',
                name: '专业音响设备制造',
                children: [],
              },
              {
                code: '3939',
                name: '应用电视设备及其他广播电视设备',
                children: [],
              },
            ],
          },
          {
            code: '394',
            name: '雷达及配套设备制造',
            children: [
              {
                code: '3940',
                name: '雷达及配套设备制造',
                children: [],
              },
            ],
          },
          {
            code: '395',
            name: '非专业视听设备制造',
            children: [
              {
                code: '3951',
                name: '电视机制造',
                children: [],
              },
              {
                code: '3952',
                name: '音响设备制造',
                children: [],
              },
              {
                code: '3953',
                name: '影视录放设备制造',
                children: [],
              },
            ],
          },
          {
            code: '396',
            name: '智能消费设备制造',
            children: [
              {
                code: '3961',
                name: '可穿戴智能设备制造',
                children: [],
              },
              {
                code: '3962',
                name: '智能车载设备制造',
                children: [],
              },
              {
                code: '3963',
                name: '智能无人飞行器制造',
                children: [],
              },
              {
                code: '3964',
                name: '服务消费机器人制造',
                children: [],
              },
              {
                code: '3969',
                name: '其他智能消费设备制造',
                children: [],
              },
            ],
          },
          {
            code: '397',
            name: '电子器件制造',
            children: [
              {
                code: '3971',
                name: '电子真空器件制造',
                children: [],
              },
              {
                code: '3972',
                name: '半导体分立器件制造',
                children: [],
              },
              {
                code: '3973',
                name: '集成电路制造',
                children: [],
              },
              {
                code: '3974',
                name: '显示器件制造',
                children: [],
              },
              {
                code: '3975',
                name: '半导体照明器件制造',
                children: [],
              },
              {
                code: '3976',
                name: '光电子器件制造',
                children: [],
              },
              {
                code: '3979',
                name: '其他电子器件制造',
                children: [],
              },
            ],
          },
          {
            code: '398',
            name: '电子元件及电子专用材料制造',
            children: [
              {
                code: '3981',
                name: '电阻电容电感元件制造',
                children: [],
              },
              {
                code: '3982',
                name: '电子电路制造',
                children: [],
              },
              {
                code: '3983',
                name: '敏感元件及传感器制造',
                children: [],
              },
              {
                code: '3984',
                name: '电声器件及零件制造',
                children: [],
              },
              {
                code: '3985',
                name: '电子专用材料制造',
                children: [],
              },
              {
                code: '3989',
                name: '其他电子元件制造',
                children: [],
              },
            ],
          },
          {
            code: '399',
            name: '其他电子设备制造',
            children: [
              {
                code: '3990',
                name: '其他电子设备制造',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '40',
        name: '仪器仪表制造业',
        children: [
          {
            code: '401',
            name: '通用仪器仪表制造',
            children: [
              {
                code: '4011',
                name: '工业自动控制系统装置制造',
                children: [],
              },
              {
                code: '4012',
                name: '电工仪器仪表制造',
                children: [],
              },
              {
                code: '4013',
                name: '绘图、计算及测量仪器制造',
                children: [],
              },
              {
                code: '4014',
                name: '实验分析仪器制造',
                children: [],
              },
              {
                code: '4015',
                name: '试验机制造',
                children: [],
              },
              {
                code: '4016',
                name: '供应用仪器仪表制造',
                children: [],
              },
              {
                code: '4019',
                name: '其他通用仪器制造',
                children: [],
              },
            ],
          },
          {
            code: '402',
            name: '专用仪器仪表制造',
            children: [
              {
                code: '4021',
                name: '环境监测专用仪器仪表制造',
                children: [],
              },
              {
                code: '4022',
                name: '运输设备及生产用计数仪表制造',
                children: [],
              },
              {
                code: '4023',
                name: '导航、测绘、气象及海洋专用仪器制',
                children: [],
              },
              {
                code: '4024',
                name: '农林牧渔专用仪器仪表制造',
                children: [],
              },
              {
                code: '4025',
                name: '地质勘探和地震专用仪器制造',
                children: [],
              },
              {
                code: '4026',
                name: '教学专用仪器制造',
                children: [],
              },
              {
                code: '4027',
                name: '核子及核辐射测量仪器制造',
                children: [],
              },
              {
                code: '4028',
                name: '电子测量仪器制造',
                children: [],
              },
              {
                code: '4029',
                name: '其他专用仪器制造',
                children: [],
              },
            ],
          },
          {
            code: '403',
            name: '钟表与计时仪器制造',
            children: [
              {
                code: '4030',
                name: '钟表与计时仪器制造',
                children: [],
              },
            ],
          },
          {
            code: '404',
            name: '光学仪器制造',
            children: [
              {
                code: '4040',
                name: '光学仪器制造',
                children: [],
              },
            ],
          },
          {
            code: '405',
            name: '衡器制造',
            children: [
              {
                code: '4050',
                name: '衡器制造',
                children: [],
              },
            ],
          },
          {
            code: '409',
            name: '其他仪器仪表制造业',
            children: [
              {
                code: '4090',
                name: '其他仪器仪表制造业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '41',
        name: '其他制造业',
        children: [
          {
            code: '411',
            name: '日用杂品制造',
            children: [
              {
                code: '4111',
                name: '鬃毛加工、制刷及清扫工具制造',
                children: [],
              },
              {
                code: '4119',
                name: '其他日用杂品制造',
                children: [],
              },
            ],
          },
          {
            code: '412',
            name: '核辐射加工',
            children: [
              {
                code: '4120',
                name: '核辐射加工',
                children: [],
              },
            ],
          },
          {
            code: '419',
            name: '其他未列明制造业',
            children: [
              {
                code: '4190',
                name: '其他未列明制造业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '42',
        name: '废弃资源综合利用业',
        children: [
          {
            code: '421',
            name: '金属废料和碎屑加工处理',
            children: [
              {
                code: '4210',
                name: '金属废料和碎屑加工处理',
                children: [],
              },
            ],
          },
          {
            code: '422',
            name: '非金属废料和碎屑加工处理',
            children: [
              {
                code: '4220',
                name: '非金属废料和碎屑加工处理',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '43',
        name: '金属制品、机械和设备修理业',
        children: [
          {
            code: '431',
            name: '金属制品修理',
            children: [
              {
                code: '4310',
                name: '金属制品修理',
                children: [],
              },
            ],
          },
          {
            code: '432',
            name: '通用设备修理',
            children: [
              {
                code: '4320',
                name: '通用设备修理',
                children: [],
              },
            ],
          },
          {
            code: '433',
            name: '专用设备修理',
            children: [
              {
                code: '4330',
                name: '专用设备修理',
                children: [],
              },
            ],
          },
          {
            code: '434',
            name: '铁路、船舶、航空航天等运输设备修理',
            children: [
              {
                code: '4341',
                name: '铁路运输设备修理',
                children: [],
              },
              {
                code: '4342',
                name: '船舶修理',
                children: [],
              },
              {
                code: '4343',
                name: '航空航天器修理',
                children: [],
              },
              {
                code: '4349',
                name: '其他运输设备修理',
                children: [],
              },
            ],
          },
          {
            code: '435',
            name: '电气设备修理',
            children: [
              {
                code: '4350',
                name: '电气设备修理',
                children: [],
              },
            ],
          },
          {
            code: '436',
            name: '仪器仪表修理',
            children: [
              {
                code: '4360',
                name: '仪器仪表修理',
                children: [],
              },
            ],
          },
          {
            code: '439',
            name: '其他机械和设备修理业',
            children: [
              {
                code: '4390',
                name: '其他机械和设备修理业',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'D',
    name: '电力、热力、燃气及水生产和供应业',
    children: [
      {
        code: '44',
        name: '电力、热力生产和供应业',
        children: [
          {
            code: '441',
            name: '电力生产',
            children: [
              {
                code: '4411',
                name: '火力发电',
                children: [],
              },
              {
                code: '4412',
                name: '热电联产',
                children: [],
              },
              {
                code: '4413',
                name: '水力发电',
                children: [],
              },
              {
                code: '4414',
                name: '核力发电',
                children: [],
              },
              {
                code: '4415',
                name: '风力发电',
                children: [],
              },
              {
                code: '4416',
                name: '太阳能发电',
                children: [],
              },
              {
                code: '4417',
                name: '生物质能发电',
                children: [],
              },
              {
                code: '4419',
                name: '其他电力生产',
                children: [],
              },
            ],
          },
          {
            code: '442',
            name: '电力供应',
            children: [
              {
                code: '4420',
                name: '电力供应',
                children: [],
              },
            ],
          },
          {
            code: '443',
            name: '热力生产和供应',
            children: [
              {
                code: '4430',
                name: '热力生产和供应',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '45',
        name: '燃气生产和供应业',
        children: [
          {
            code: '451',
            name: '燃气生产和供应业',
            children: [
              {
                code: '4511',
                name: '天然气生产和供应业',
                children: [],
              },
              {
                code: '4512',
                name: '液化石油气生产和供应业',
                children: [],
              },
              {
                code: '4513',
                name: '煤气生产和供应业',
                children: [],
              },
            ],
          },
          {
            code: '452',
            name: '生物质燃气生产和供应业',
            children: [
              {
                code: '4520',
                name: '生物质燃气生产和供应业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '46',
        name: '水的生产和供应业',
        children: [
          {
            code: '461',
            name: '自来水生产和供应',
            children: [
              {
                code: '4610',
                name: '自来水生产和供应',
                children: [],
              },
            ],
          },
          {
            code: '462',
            name: '污水处理及其再生利用',
            children: [
              {
                code: '4620',
                name: '污水处理及其再生利用',
                children: [],
              },
            ],
          },
          {
            code: '463',
            name: '海水淡化处理',
            children: [
              {
                code: '4630',
                name: '海水淡化处理',
                children: [],
              },
            ],
          },
          {
            code: '469',
            name: '其他水的处理、利用与分配',
            children: [
              {
                code: '4690',
                name: '其他水的处理、利用与分配',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'E',
    name: '建筑业',
    children: [
      {
        code: '47',
        name: '房屋建筑业',
        children: [
          {
            code: '471',
            name: '住宅房屋建筑',
            children: [
              {
                code: '4710',
                name: '住宅房屋建筑',
                children: [],
              },
            ],
          },
          {
            code: '472',
            name: '体育场馆建筑',
            children: [
              {
                code: '4720',
                name: '体育场馆建筑',
                children: [],
              },
            ],
          },
          {
            code: '479',
            name: '其他房屋建筑业',
            children: [
              {
                code: '4790',
                name: '其他房屋建筑业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '48',
        name: '土木工程建筑业',
        children: [
          {
            code: '481',
            name: '铁路、道路、隧道和桥梁工程建筑',
            children: [
              {
                code: '4811',
                name: '铁路工程建筑',
                children: [],
              },
              {
                code: '4812',
                name: '公路工程建筑',
                children: [],
              },
              {
                code: '4813',
                name: '市政道路工程建筑',
                children: [],
              },
              {
                code: '4814',
                name: '城市轨道交通工程建筑',
                children: [],
              },
              {
                code: '4819',
                name: '其他道路、隧道和桥梁工程建筑',
                children: [],
              },
            ],
          },
          {
            code: '482',
            name: '水利和水运工程建筑',
            children: [
              {
                code: '4821',
                name: '水源及供水设施工程建筑',
                children: [],
              },
              {
                code: '4822',
                name: '河湖治理及防洪设施工程建筑',
                children: [],
              },
              {
                code: '4823',
                name: '港口及航运设施工程建筑',
                children: [],
              },
            ],
          },
          {
            code: '483',
            name: '海洋工程建筑',
            children: [
              {
                code: '4831',
                name: '海洋油气资源开发利用工程建筑',
                children: [],
              },
              {
                code: '4832',
                name: '海洋能源开发利用工程建筑',
                children: [],
              },
              {
                code: '4833',
                name: '海底隧道工程建筑',
                children: [],
              },
              {
                code: '4834',
                name: '海底设施铺设工程建筑',
                children: [],
              },
              {
                code: '4839',
                name: '其他海洋工程建筑',
                children: [],
              },
            ],
          },
          {
            code: '484',
            name: '工矿工程建筑',
            children: [
              {
                code: '4840',
                name: '工矿工程建筑',
                children: [],
              },
            ],
          },
          {
            code: '485',
            name: '架线和管道工程建筑',
            children: [
              {
                code: '4851',
                name: '架线及设备工程建筑',
                children: [],
              },
              {
                code: '4852',
                name: '管道工程建筑',
                children: [],
              },
              {
                code: '4853',
                name: '地下综合管廊工程建筑',
                children: [],
              },
            ],
          },
          {
            code: '486',
            name: '节能环保工程施工',
            children: [
              {
                code: '4861',
                name: '节能工程施工',
                children: [],
              },
              {
                code: '4862',
                name: '环保工程施工',
                children: [],
              },
              {
                code: '4863',
                name: '生态保护工程施工',
                children: [],
              },
            ],
          },
          {
            code: '487',
            name: '电力工程施工',
            children: [
              {
                code: '4871',
                name: '火力发电工程施工',
                children: [],
              },
              {
                code: '4872',
                name: '水力发电工程施工',
                children: [],
              },
              {
                code: '4873',
                name: '核电工程施工',
                children: [],
              },
              {
                code: '4874',
                name: '风能发电工程施工',
                children: [],
              },
              {
                code: '4875',
                name: '太阳能发电工程施工',
                children: [],
              },
              {
                code: '4879',
                name: '其他电力工程施工',
                children: [],
              },
            ],
          },
          {
            code: '489',
            name: '其他土木工程建筑',
            children: [
              {
                code: '4891',
                name: '园林绿化工程施工',
                children: [],
              },
              {
                code: '4892',
                name: '体育场地设施工程施工',
                children: [],
              },
              {
                code: '4893',
                name: '游乐设施工程施工',
                children: [],
              },
              {
                code: '4899',
                name: '其他土木工程建筑施工',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '49',
        name: '建筑安装业',
        children: [
          {
            code: '491',
            name: '电气安装',
            children: [
              {
                code: '4910',
                name: '电气安装',
                children: [],
              },
            ],
          },
          {
            code: '492',
            name: '管道和设备安装',
            children: [
              {
                code: '4920',
                name: '管道和设备安装',
                children: [],
              },
            ],
          },
          {
            code: '499',
            name: '其他建筑安装业',
            children: [
              {
                code: '4991',
                name: '体育场地设施安装',
                children: [],
              },
              {
                code: '4999',
                name: '其他建筑安装',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '50',
        name: '建筑装饰、装修和其他建筑业',
        children: [
          {
            code: '501',
            name: '建筑装饰和装修业',
            children: [
              {
                code: '5011',
                name: '公共建筑装饰和装修',
                children: [],
              },
              {
                code: '5012',
                name: '住宅装饰和装修',
                children: [],
              },
              {
                code: '5013',
                name: '建筑幕墙装饰和装修',
                children: [],
              },
            ],
          },
          {
            code: '502',
            name: '建筑物拆除和场地准备活动',
            children: [
              {
                code: '5021',
                name: '建筑物拆除活动',
                children: [],
              },
              {
                code: '5022',
                name: '场地准备活动',
                children: [],
              },
            ],
          },
          {
            code: '503',
            name: '提供施工设备服务',
            children: [
              {
                code: '5030',
                name: '提供施工设备服务',
                children: [],
              },
            ],
          },
          {
            code: '509',
            name: '其他未列明建筑业',
            children: [
              {
                code: '5090',
                name: '其他未列明建筑业',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'F',
    name: '批发和零售业',
    children: [
      {
        code: '51',
        name: '批发业',
        children: [
          {
            code: '511',
            name: '农、林、牧、渔产品批发',
            children: [
              {
                code: '5111',
                name: '谷物、豆及薯类批发',
                children: [],
              },
              {
                code: '5112',
                name: '种子批发',
                children: [],
              },
              {
                code: '5113',
                name: '畜牧渔业饲料批发',
                children: [],
              },
              {
                code: '5114',
                name: '棉、麻批发',
                children: [],
              },
              {
                code: '5115',
                name: '林业产品批发',
                children: [],
              },
              {
                code: '5116',
                name: '牲畜批发',
                children: [],
              },
              {
                code: '5117',
                name: '渔业产品批发',
                children: [],
              },
              {
                code: '5119',
                name: '其他农牧产品批发',
                children: [],
              },
            ],
          },
          {
            code: '512',
            name: '食品、饮料及烟草制品批发',
            children: [
              {
                code: '5121',
                name: '米、面制品及食用油批发',
                children: [],
              },
              {
                code: '5122',
                name: '糕点、糖果及糖批发',
                children: [],
              },
              {
                code: '5123',
                name: '果品、蔬菜批发',
                children: [],
              },
              {
                code: '5124',
                name: '肉、禽、蛋、奶及水产品批发',
                children: [],
              },
              {
                code: '5125',
                name: '盐及调味品批发',
                children: [],
              },
              {
                code: '5126',
                name: '营养和保健品批发',
                children: [],
              },
              {
                code: '5127',
                name: '酒、饮料及茶叶批发',
                children: [],
              },
              {
                code: '5128',
                name: '烟草制品批发',
                children: [],
              },
              {
                code: '5129',
                name: '其他食品批发',
                children: [],
              },
            ],
          },
          {
            code: '513',
            name: '纺织、服装及家庭用品批发',
            children: [
              {
                code: '5131',
                name: '纺织品、针织品及原料批发',
                children: [],
              },
              {
                code: '5132',
                name: '服装批发',
                children: [],
              },
              {
                code: '5133',
                name: '鞋帽批发',
                children: [],
              },
              {
                code: '5134',
                name: '化妆品及卫生用品批发',
                children: [],
              },
              {
                code: '5135',
                name: '厨具卫具及日用杂品批发',
                children: [],
              },
              {
                code: '5136',
                name: '灯具、装饰物品批发',
                children: [],
              },
              {
                code: '5137',
                name: '家用视听设备批发',
                children: [],
              },
              {
                code: '5138',
                name: '日用家电批发',
                children: [],
              },
              {
                code: '5139',
                name: '其他家庭用品批发',
                children: [],
              },
            ],
          },
          {
            code: '514',
            name: '文化、体育用品及器材批发',
            children: [
              {
                code: '5141',
                name: '文具用品批发',
                children: [],
              },
              {
                code: '5142',
                name: '体育用品及器材批发',
                children: [],
              },
              {
                code: '5143',
                name: '图书批发',
                children: [],
              },
              {
                code: '5144',
                name: '报刊批发',
                children: [],
              },
              {
                code: '5145',
                name: '音像制品、电子和数字出版物批发',
                children: [],
              },
              {
                code: '5146',
                name: '首饰、工艺品及收藏品批发',
                children: [],
              },
              {
                code: '5147',
                name: '乐器批发',
                children: [],
              },
              {
                code: '5149',
                name: '其他文化用品批发',
                children: [],
              },
            ],
          },
          {
            code: '515',
            name: '医药及医疗器材批发',
            children: [
              {
                code: '5151',
                name: '西药批发',
                children: [],
              },
              {
                code: '5152',
                name: '中药批发',
                children: [],
              },
              {
                code: '5153',
                name: '动物用药品批发',
                children: [],
              },
              {
                code: '5154',
                name: '医疗用品及器材批发',
                children: [],
              },
            ],
          },
          {
            code: '516',
            name: '矿产品、建材及化工产品批发',
            children: [
              {
                code: '5161',
                name: '煤炭及制品批发',
                children: [],
              },
              {
                code: '5162',
                name: '石油及制品批发',
                children: [],
              },
              {
                code: '5163',
                name: '非金属矿及制品批发',
                children: [],
              },
              {
                code: '5164',
                name: '金属及金属矿批发',
                children: [],
              },
              {
                code: '5165',
                name: '建材批发',
                children: [],
              },
              {
                code: '5166',
                name: '化肥批发',
                children: [],
              },
              {
                code: '5167',
                name: '农药批发',
                children: [],
              },
              {
                code: '5168',
                name: '农用薄膜批发',
                children: [],
              },
              {
                code: '5169',
                name: '其他化工产品批发',
                children: [],
              },
            ],
          },
          {
            code: '517',
            name: '机械设备、五金产品及电子产品批发',
            children: [
              {
                code: '5171',
                name: '农业机械批发',
                children: [],
              },
              {
                code: '5172',
                name: '汽车及零配件批发',
                children: [],
              },
              {
                code: '5173',
                name: '摩托车及零配件批发',
                children: [],
              },
              {
                code: '5174',
                name: '五金产品批发',
                children: [],
              },
              {
                code: '5175',
                name: '电气设备批发',
                children: [],
              },
              {
                code: '5176',
                name: '计算机、软件及辅助设备批发',
                children: [],
              },
              {
                code: '5177',
                name: '通讯设备批发',
                children: [],
              },
              {
                code: '5178',
                name: '广播影视设备批发',
                children: [],
              },
              {
                code: '5179',
                name: '其他机械设备及电子产品批发',
                children: [],
              },
            ],
          },
          {
            code: '518',
            name: '贸易经纪与代理',
            children: [
              {
                code: '5181',
                name: '贸易代理',
                children: [],
              },
              {
                code: '5182',
                name: '一般物品拍卖',
                children: [],
              },
              {
                code: '5183',
                name: '艺术品、收藏品拍卖',
                children: [],
              },
              {
                code: '5184',
                name: '艺术品代理',
                children: [],
              },
              {
                code: '5189',
                name: '其他贸易经纪与代理',
                children: [],
              },
            ],
          },
          {
            code: '519',
            name: '其他批发业',
            children: [
              {
                code: '5191',
                name: '再生物资回收与批发',
                children: [],
              },
              {
                code: '5192',
                name: '宠物食品用品批发',
                children: [],
              },
              {
                code: '5193',
                name: '互联网批发',
                children: [],
              },
              {
                code: '5199',
                name: '其他未列明批发业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '52',
        name: '零售业',
        children: [
          {
            code: '521',
            name: '综合零售',
            children: [
              {
                code: '5211',
                name: '百货零售',
                children: [],
              },
              {
                code: '5212',
                name: '超级市场零售',
                children: [],
              },
              {
                code: '5213',
                name: '便利店零售',
                children: [],
              },
              {
                code: '5219',
                name: '其他综合零售',
                children: [],
              },
            ],
          },
          {
            code: '522',
            name: '食品、饮料及烟草制品专门零售',
            children: [
              {
                code: '5221',
                name: '粮油零售',
                children: [],
              },
              {
                code: '5222',
                name: '糕点、面包零售',
                children: [],
              },
              {
                code: '5223',
                name: '果品、蔬菜零售',
                children: [],
              },
              {
                code: '5224',
                name: '肉、禽、蛋、奶及水产品零售',
                children: [],
              },
              {
                code: '5225',
                name: '营养和保健品零售',
                children: [],
              },
              {
                code: '5226',
                name: '酒、饮料及茶叶零售',
                children: [],
              },
              {
                code: '5227',
                name: '烟草制品零售',
                children: [],
              },
              {
                code: '5229',
                name: '其他食品零售',
                children: [],
              },
            ],
          },
          {
            code: '523',
            name: '纺织、服装及日用品专门零售',
            children: [
              {
                code: '5231',
                name: '纺织品及针织品零售',
                children: [],
              },
              {
                code: '5232',
                name: '服装零售',
                children: [],
              },
              {
                code: '5233',
                name: '鞋帽零售',
                children: [],
              },
              {
                code: '5234',
                name: '化妆品及卫生用品零售',
                children: [],
              },
              {
                code: '5235',
                name: '厨具卫具及日用杂品零售',
                children: [],
              },
              {
                code: '5236',
                name: '钟表、眼镜零售',
                children: [],
              },
              {
                code: '5237',
                name: '箱包零售',
                children: [],
              },
              {
                code: '5238',
                name: '自行车等代步设备零售',
                children: [],
              },
              {
                code: '5239',
                name: '其他日用品零售',
                children: [],
              },
            ],
          },
          {
            code: '524',
            name: '文化、体育用品及器材专门零售',
            children: [
              {
                code: '5241',
                name: '文具用品零售',
                children: [],
              },
              {
                code: '5242',
                name: '体育用品及器材零售',
                children: [],
              },
              {
                code: '5243',
                name: '图书、报刊零售',
                children: [],
              },
              {
                code: '5244',
                name: '音像制品、电子和数字出版物零售',
                children: [],
              },
              {
                code: '5245',
                name: '珠宝首饰零售',
                children: [],
              },
              {
                code: '5246',
                name: '工艺美术品及收藏品零售',
                children: [],
              },
              {
                code: '5247',
                name: '乐器零售',
                children: [],
              },
              {
                code: '5248',
                name: '照相器材零售',
                children: [],
              },
              {
                code: '5249',
                name: '其他文化用品零售',
                children: [],
              },
            ],
          },
          {
            code: '525',
            name: '医药及医疗器材专门零售',
            children: [
              {
                code: '5251',
                name: '西药零售',
                children: [],
              },
              {
                code: '5252',
                name: '中药零售',
                children: [],
              },
              {
                code: '5253',
                name: '动物用药品零售',
                children: [],
              },
              {
                code: '5254',
                name: '医疗用品及器材零售',
                children: [],
              },
              {
                code: '5255',
                name: '保健辅助治疗器材零售',
                children: [],
              },
            ],
          },
          {
            code: '526',
            name: '汽车、摩托车、零配件和燃料及其他动力销售',
            children: [
              {
                code: '5261',
                name: '汽车新车零售',
                children: [],
              },
              {
                code: '5262',
                name: '汽车旧车零售',
                children: [],
              },
              {
                code: '5263',
                name: '汽车零配件零售',
                children: [],
              },
              {
                code: '5264',
                name: '摩托车及零配件零售',
                children: [],
              },
              {
                code: '5265',
                name: '机动车燃油零售',
                children: [],
              },
              {
                code: '5266',
                name: '机动车燃气零售',
                children: [],
              },
              {
                code: '5267',
                name: '机动车充电销售',
                children: [],
              },
            ],
          },
          {
            code: '527',
            name: '家用电器及电子产品专门零售',
            children: [
              {
                code: '5271',
                name: '家用视听设备零售',
                children: [],
              },
              {
                code: '5272',
                name: '日用家电零售',
                children: [],
              },
              {
                code: '5273',
                name: '计算机、软件及辅助设备零售',
                children: [],
              },
              {
                code: '5274',
                name: '通信设备零售',
                children: [],
              },
              {
                code: '5279',
                name: '其他电子产品零售',
                children: [],
              },
            ],
          },
          {
            code: '528',
            name: '五金、家具及室内装饰材料专门零售',
            children: [
              {
                code: '5281',
                name: '五金零售',
                children: [],
              },
              {
                code: '5282',
                name: '灯具零售',
                children: [],
              },
              {
                code: '5283',
                name: '家具零售',
                children: [],
              },
              {
                code: '5284',
                name: '涂料零售',
                children: [],
              },
              {
                code: '5285',
                name: '卫生洁具零售',
                children: [],
              },
              {
                code: '5286',
                name: '木质装饰材料零售',
                children: [],
              },
              {
                code: '5287',
                name: '陶瓷、石材装饰材料零售',
                children: [],
              },
              {
                code: '5289',
                name: '其他室内装饰材料零售',
                children: [],
              },
            ],
          },
          {
            code: '529',
            name: '货摊、无店铺及其他零售业',
            children: [
              {
                code: '5291',
                name: '流动货摊零售',
                children: [],
              },
              {
                code: '5292',
                name: '互联网零售',
                children: [],
              },
              {
                code: '5293',
                name: '邮购及电视、电话零售',
                children: [],
              },
              {
                code: '5294',
                name: '自动售货机零售',
                children: [],
              },
              {
                code: '5295',
                name: '旧货零售',
                children: [],
              },
              {
                code: '5296',
                name: '生活用燃料零售',
                children: [],
              },
              {
                code: '5297',
                name: '宠物食品用品零售',
                children: [],
              },
              {
                code: '5299',
                name: '其他未列明零售业',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'G',
    name: '交通运输、仓储和邮政业',
    children: [
      {
        code: '53',
        name: '铁路运输业',
        children: [
          {
            code: '531',
            name: '铁路旅客运输',
            children: [
              {
                code: '5311',
                name: '高速铁路旅客运输',
                children: [],
              },
              {
                code: '5312',
                name: '城际铁路旅客运输',
                children: [],
              },
              {
                code: '5313',
                name: '普通铁路旅客运输',
                children: [],
              },
            ],
          },
          {
            code: '532',
            name: '铁路货物运输',
            children: [
              {
                code: '5320',
                name: '铁路货物运输',
                children: [],
              },
            ],
          },
          {
            code: '533',
            name: '铁路运输辅助活动',
            children: [
              {
                code: '5331',
                name: '客运火车站',
                children: [],
              },
              {
                code: '5332',
                name: '货运火车站（场）',
                children: [],
              },
              {
                code: '5333',
                name: '铁路运输维护活动',
                children: [],
              },
              {
                code: '5339',
                name: '其他铁路运输辅助活动',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '54',
        name: '道路运输业',
        children: [
          {
            code: '541',
            name: '城市公共交通运输',
            children: [
              {
                code: '5411',
                name: '公共电汽车客运',
                children: [],
              },
              {
                code: '5412',
                name: '城市轨道交通',
                children: [],
              },
              {
                code: '5413',
                name: '出租车客运',
                children: [],
              },
              {
                code: '5414',
                name: '公共自行车服务',
                children: [],
              },
              {
                code: '5419',
                name: '其他城市公共交通运输',
                children: [],
              },
            ],
          },
          {
            code: '542',
            name: '公路旅客运输',
            children: [
              {
                code: '5421',
                name: '长途客运',
                children: [],
              },
              {
                code: '5422',
                name: '旅游客运',
                children: [],
              },
              {
                code: '5429',
                name: '其他公路客运',
                children: [],
              },
            ],
          },
          {
            code: '543',
            name: '道路货物运输',
            children: [
              {
                code: '5431',
                name: '普通货物道路运输',
                children: [],
              },
              {
                code: '5432',
                name: '冷藏车道路运输',
                children: [],
              },
              {
                code: '5433',
                name: '集装箱道路运输',
                children: [],
              },
              {
                code: '5434',
                name: '大型货物道路运输',
                children: [],
              },
              {
                code: '5435',
                name: '危险货物道路运输',
                children: [],
              },
              {
                code: '5436',
                name: '邮件包裹道路运输',
                children: [],
              },
              {
                code: '5437',
                name: '城市配送',
                children: [],
              },
              {
                code: '5438',
                name: '搬家运输',
                children: [],
              },
              {
                code: '5439',
                name: '其他道路货物运输',
                children: [],
              },
            ],
          },
          {
            code: '544',
            name: '道路运输辅助活动',
            children: [
              {
                code: '5441',
                name: '客运汽车站',
                children: [],
              },
              {
                code: '5442',
                name: '货运枢纽（站）',
                children: [],
              },
              {
                code: '5443',
                name: '公路管理与养护',
                children: [],
              },
              {
                code: '5449',
                name: '其他道路运输辅助活动',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '55',
        name: '水上运输业',
        children: [
          {
            code: '551',
            name: '水上旅客运输',
            children: [
              {
                code: '5511',
                name: '海上旅客运输',
                children: [],
              },
              {
                code: '5512',
                name: '内河旅客运输',
                children: [],
              },
              {
                code: '5513',
                name: '客运轮渡运输',
                children: [],
              },
            ],
          },
          {
            code: '552',
            name: '水上货物运输',
            children: [
              {
                code: '5521',
                name: '远洋货物运输',
                children: [],
              },
              {
                code: '5522',
                name: '沿海货物运输',
                children: [],
              },
              {
                code: '5523',
                name: '内河货物运输',
                children: [],
              },
            ],
          },
          {
            code: '553',
            name: '水上运输辅助活动',
            children: [
              {
                code: '5531',
                name: '客运港口',
                children: [],
              },
              {
                code: '5532',
                name: '货运港口',
                children: [],
              },
              {
                code: '5539',
                name: '其他水上运输辅助活动',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '56',
        name: '航空运输业',
        children: [
          {
            code: '561',
            name: '航空客货运输',
            children: [
              {
                code: '5611',
                name: '航空旅客运输',
                children: [],
              },
              {
                code: '5612',
                name: '航空货物运输',
                children: [],
              },
            ],
          },
          {
            code: '562',
            name: '通用航空服务',
            children: [
              {
                code: '5621',
                name: '通用航空生产服务',
                children: [],
              },
              {
                code: '5622',
                name: '观光游览航空服务',
                children: [],
              },
              {
                code: '5623',
                name: '体育航空运动服务',
                children: [],
              },
              {
                code: '5629',
                name: '其他通用航空服务',
                children: [],
              },
            ],
          },
          {
            code: '563',
            name: '航空运输辅助活动',
            children: [
              {
                code: '5631',
                name: '机场',
                children: [],
              },
              {
                code: '5632',
                name: '空中交通管理',
                children: [],
              },
              {
                code: '5639',
                name: '其他航空运输辅助活动',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '57',
        name: '管道运输业',
        children: [
          {
            code: '571',
            name: '海底管道运输',
            children: [
              {
                code: '5710',
                name: '海底管道运输',
                children: [],
              },
            ],
          },
          {
            code: '572',
            name: '陆地管道运输',
            children: [
              {
                code: '5720',
                name: '陆地管道运输',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '58',
        name: '多式联运和运输代理业',
        children: [
          {
            code: '581',
            name: '多式联运',
            children: [
              {
                code: '5810',
                name: '多式联运',
                children: [],
              },
            ],
          },
          {
            code: '582',
            name: '运输代理业',
            children: [
              {
                code: '5821',
                name: '货物运输代理',
                children: [],
              },
              {
                code: '5822',
                name: '旅客票务代理',
                children: [],
              },
              {
                code: '5829',
                name: '其他运输代理业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '59',
        name: '装卸搬运和仓储业',
        children: [
          {
            code: '591',
            name: '装卸搬运',
            children: [
              {
                code: '5910',
                name: '装卸搬运',
                children: [],
              },
            ],
          },
          {
            code: '592',
            name: '通用仓储',
            children: [
              {
                code: '5920',
                name: '通用仓储',
                children: [],
              },
            ],
          },
          {
            code: '593',
            name: '低温仓储',
            children: [
              {
                code: '5930',
                name: '低温仓储',
                children: [],
              },
            ],
          },
          {
            code: '594',
            name: '危险品仓储',
            children: [
              {
                code: '5941',
                name: '油气仓储',
                children: [],
              },
              {
                code: '5942',
                name: '危险化学品仓储',
                children: [],
              },
              {
                code: '5949',
                name: '其他危险品仓储',
                children: [],
              },
            ],
          },
          {
            code: '595',
            name: '谷物、棉花等农产品仓储',
            children: [
              {
                code: '5951',
                name: '谷物仓储',
                children: [],
              },
              {
                code: '5952',
                name: '棉花仓储',
                children: [],
              },
              {
                code: '5959',
                name: '其他农产品仓储',
                children: [],
              },
            ],
          },
          {
            code: '596',
            name: '中药材仓储',
            children: [
              {
                code: '5960',
                name: '中药材仓储',
                children: [],
              },
            ],
          },
          {
            code: '599',
            name: '其他仓储业',
            children: [
              {
                code: '5990',
                name: '其他仓储业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '60',
        name: '邮政业',
        children: [
          {
            code: '601',
            name: '邮政基本服务',
            children: [
              {
                code: '6010',
                name: '邮政基本服务',
                children: [],
              },
            ],
          },
          {
            code: '602',
            name: '快递服务',
            children: [
              {
                code: '6020',
                name: '快递服务',
                children: [],
              },
            ],
          },
          {
            code: '609',
            name: '其他寄递服务',
            children: [
              {
                code: '6090',
                name: '其他寄递服务',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'H',
    name: '住宿和餐饮业',
    children: [
      {
        code: '61',
        name: '住宿业',
        children: [
          {
            code: '611',
            name: '旅游饭店',
            children: [
              {
                code: '6110',
                name: '旅游饭店',
                children: [],
              },
            ],
          },
          {
            code: '612',
            name: '一般旅馆',
            children: [
              {
                code: '6121',
                name: '经济型连锁酒店',
                children: [],
              },
              {
                code: '6129',
                name: '其他一般旅馆',
                children: [],
              },
            ],
          },
          {
            code: '613',
            name: '民宿服务',
            children: [
              {
                code: '6130',
                name: '民宿服务',
                children: [],
              },
            ],
          },
          {
            code: '614',
            name: '露营地服务',
            children: [
              {
                code: '6140',
                name: '露营地服务',
                children: [],
              },
            ],
          },
          {
            code: '619',
            name: '其他住宿业',
            children: [
              {
                code: '6190',
                name: '其他住宿业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '62',
        name: '餐饮业',
        children: [
          {
            code: '621',
            name: '正餐服务',
            children: [
              {
                code: '6210',
                name: '正餐服务',
                children: [],
              },
            ],
          },
          {
            code: '622',
            name: '快餐服务',
            children: [
              {
                code: '6220',
                name: '快餐服务',
                children: [],
              },
            ],
          },
          {
            code: '623',
            name: '饮料及冷饮服务',
            children: [
              {
                code: '6231',
                name: '茶馆服务',
                children: [],
              },
              {
                code: '6232',
                name: '咖啡馆服务',
                children: [],
              },
              {
                code: '6233',
                name: '酒吧服务',
                children: [],
              },
              {
                code: '6239',
                name: '其他饮料及冷饮服务',
                children: [],
              },
            ],
          },
          {
            code: '624',
            name: '餐饮配送及外卖送餐服务',
            children: [
              {
                code: '6241',
                name: '餐饮配送服务',
                children: [],
              },
              {
                code: '6242',
                name: '外卖送餐服务',
                children: [],
              },
            ],
          },
          {
            code: '629',
            name: '其他餐饮业',
            children: [
              {
                code: '6291',
                name: '小吃服务',
                children: [],
              },
              {
                code: '6299',
                name: '其他未列明餐饮业',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'I',
    name: '信息传输、软件和信息技术服务业',
    children: [
      {
        code: '63',
        name: '电信、广播电视和卫星传输服务',
        children: [
          {
            code: '631',
            name: '电信',
            children: [
              {
                code: '6311',
                name: '固定电信服务',
                children: [],
              },
              {
                code: '6312',
                name: '移动电信服务',
                children: [],
              },
              {
                code: '6319',
                name: '其他电信服务',
                children: [],
              },
            ],
          },
          {
            code: '632',
            name: '广播电视传输服务',
            children: [
              {
                code: '6321',
                name: '有线广播电视传输服务',
                children: [],
              },
              {
                code: '6322',
                name: '无线广播电视传输服务',
                children: [],
              },
            ],
          },
          {
            code: '633',
            name: '卫星传输服务',
            children: [
              {
                code: '6331',
                name: '广播电视卫星传输服务',
                children: [],
              },
              {
                code: '6339',
                name: '其他卫星传输服务',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '64',
        name: '互联网和相关服务',
        children: [
          {
            code: '641',
            name: '互联网接入及相关服务',
            children: [
              {
                code: '6410',
                name: '互联网接入及相关服务',
                children: [],
              },
            ],
          },
          {
            code: '642',
            name: '互联网信息服务',
            children: [
              {
                code: '6421',
                name: '互联网搜索服务',
                children: [],
              },
              {
                code: '6422',
                name: '互联网游戏服务',
                children: [],
              },
              {
                code: '6429',
                name: '互联网其他信息服务',
                children: [],
              },
            ],
          },
          {
            code: '643',
            name: '互联网平台',
            children: [
              {
                code: '6431',
                name: '互联网生产服务平台',
                children: [],
              },
              {
                code: '6432',
                name: '互联网生活服务平台',
                children: [],
              },
              {
                code: '6433',
                name: '互联网科技创新平台',
                children: [],
              },
              {
                code: '6434',
                name: '互联网公共服务平台',
                children: [],
              },
              {
                code: '6439',
                name: '其他互联网平台',
                children: [],
              },
            ],
          },
          {
            code: '644',
            name: '互联网安全服务',
            children: [
              {
                code: '6440',
                name: '互联网安全服务',
                children: [],
              },
            ],
          },
          {
            code: '645',
            name: '互联网数据服务',
            children: [
              {
                code: '6450',
                name: '互联网数据服务',
                children: [],
              },
            ],
          },
          {
            code: '649',
            name: '其他互联网服务',
            children: [
              {
                code: '6490',
                name: '其他互联网服务',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '65',
        name: '软件和信息技术服务业',
        children: [
          {
            code: '651',
            name: '软件开发',
            children: [
              {
                code: '6511',
                name: '基础软件开发',
                children: [],
              },
              {
                code: '6512',
                name: '支撑软件开发',
                children: [],
              },
              {
                code: '6513',
                name: '应用软件开发',
                children: [],
              },
              {
                code: '6519',
                name: '其他软件开发',
                children: [],
              },
            ],
          },
          {
            code: '652',
            name: '集成电路设计',
            children: [
              {
                code: '6520',
                name: '集成电路设计',
                children: [],
              },
            ],
          },
          {
            code: '653',
            name: '信息系统集成和物联网技术服务',
            children: [
              {
                code: '6531',
                name: '信息系统集成服务',
                children: [],
              },
              {
                code: '6532',
                name: '物联网技术服务',
                children: [],
              },
            ],
          },
          {
            code: '654',
            name: '运行维护服务',
            children: [
              {
                code: '6540',
                name: '运行维护服务',
                children: [],
              },
            ],
          },
          {
            code: '655',
            name: '信息处理和存储支持服务',
            children: [
              {
                code: '6550',
                name: '信息处理和存储支持服务',
                children: [],
              },
            ],
          },
          {
            code: '656',
            name: '信息技术咨询服务',
            children: [
              {
                code: '6560',
                name: '信息技术咨询服务',
                children: [],
              },
            ],
          },
          {
            code: '657',
            name: '数字内容服务',
            children: [
              {
                code: '6571',
                name: '地理遥感信息服务',
                children: [],
              },
              {
                code: '6572',
                name: '动漫、游戏数字内容服务',
                children: [],
              },
              {
                code: '6579',
                name: '其他数字内容服务',
                children: [],
              },
            ],
          },
          {
            code: '659',
            name: '其他信息技术服务业',
            children: [
              {
                code: '6591',
                name: '呼叫中心',
                children: [],
              },
              {
                code: '6599',
                name: '其他未列明信息技术服务业',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'J',
    name: '金融业',
    children: [
      {
        code: '66',
        name: '货币金融服务',
        children: [
          {
            code: '661',
            name: '中央银行服务',
            children: [
              {
                code: '6610',
                name: '中央银行服务',
                children: [],
              },
            ],
          },
          {
            code: '662',
            name: '货币银行服务',
            children: [
              {
                code: '6621',
                name: '商业银行服务',
                children: [],
              },
              {
                code: '6622',
                name: '政策性银行服务',
                children: [],
              },
              {
                code: '6623',
                name: '信用合作社服务',
                children: [],
              },
              {
                code: '6624',
                name: '农村资金互助社服务',
                children: [],
              },
              {
                code: '6629',
                name: '其他货币银行服务',
                children: [],
              },
            ],
          },
          {
            code: '663',
            name: '非货币银行服务',
            children: [
              {
                code: '6631',
                name: '融资租赁服务',
                children: [],
              },
              {
                code: '6632',
                name: '财务公司服务',
                children: [],
              },
              {
                code: '6633',
                name: '典当',
                children: [],
              },
              {
                code: '6634',
                name: '汽车金融公司服务',
                children: [],
              },
              {
                code: '6635',
                name: '小额贷款公司服务',
                children: [],
              },
              {
                code: '6636',
                name: '消费金融公司服务',
                children: [],
              },
              {
                code: '6637',
                name: '网络借贷服务',
                children: [],
              },
              {
                code: '6639',
                name: '其他非货币银行服务',
                children: [],
              },
            ],
          },
          {
            code: '664',
            name: '银行理财服务',
            children: [
              {
                code: '6640',
                name: '银行理财服务',
                children: [],
              },
            ],
          },
          {
            code: '665',
            name: '银行监管服务',
            children: [
              {
                code: '6650',
                name: '银行监管服务',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '67',
        name: '资本市场服务',
        children: [
          {
            code: '671',
            name: '证券市场服务',
            children: [
              {
                code: '6711',
                name: '证券市场管理服务',
                children: [],
              },
              {
                code: '6712',
                name: '证券经纪交易服务',
                children: [],
              },
            ],
          },
          {
            code: '672',
            name: '公开募集证券投资基金',
            children: [
              {
                code: '6720',
                name: '公开募集证券投资基金',
                children: [],
              },
            ],
          },
          {
            code: '673',
            name: '非公开募集证券投资基金',
            children: [
              {
                code: '6731',
                name: '创业投资基金',
                children: [],
              },
              {
                code: '6732',
                name: '天使投资',
                children: [],
              },
              {
                code: '6739',
                name: '其他非公开募集证券投资基金',
                children: [],
              },
            ],
          },
          {
            code: '674',
            name: '期货市场服务',
            children: [
              {
                code: '6741',
                name: '期货市场管理服务',
                children: [],
              },
              {
                code: '6749',
                name: '其他期货市场服务',
                children: [],
              },
            ],
          },
          {
            code: '675',
            name: '证券期货监管服务',
            children: [
              {
                code: '6750',
                name: '证券期货监管服务',
                children: [],
              },
            ],
          },
          {
            code: '676',
            name: '资本投资服务',
            children: [
              {
                code: '6760',
                name: '资本投资服务',
                children: [],
              },
            ],
          },
          {
            code: '679',
            name: '其他资本市场服务',
            children: [
              {
                code: '6790',
                name: '其他资本市场服务',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '68',
        name: '保险业',
        children: [
          {
            code: '681',
            name: '人身保险',
            children: [
              {
                code: '6811',
                name: '人寿保险',
                children: [],
              },
              {
                code: '6812',
                name: '年金保险',
                children: [],
              },
              {
                code: '6813',
                name: '健康保险',
                children: [],
              },
              {
                code: '6814',
                name: '意外伤害保险',
                children: [],
              },
            ],
          },
          {
            code: '682',
            name: '财产保险',
            children: [
              {
                code: '6820',
                name: '财产保险',
                children: [],
              },
            ],
          },
          {
            code: '683',
            name: '再保险',
            children: [
              {
                code: '6830',
                name: '再保险',
                children: [],
              },
            ],
          },
          {
            code: '684',
            name: '商业养老金',
            children: [
              {
                code: '6840',
                name: '商业养老金',
                children: [],
              },
            ],
          },
          {
            code: '685',
            name: '保险中介服务',
            children: [
              {
                code: '6851',
                name: '保险经纪服务',
                children: [],
              },
              {
                code: '6852',
                name: '保险代理服务',
                children: [],
              },
              {
                code: '6853',
                name: '保险公估服务',
                children: [],
              },
            ],
          },
          {
            code: '686',
            name: '保险资产管理',
            children: [
              {
                code: '6860',
                name: '保险资产管理',
                children: [],
              },
            ],
          },
          {
            code: '687',
            name: '保险监管服务',
            children: [
              {
                code: '6870',
                name: '保险监管服务',
                children: [],
              },
            ],
          },
          {
            code: '689',
            name: '其他保险活动',
            children: [
              {
                code: '6890',
                name: '其他保险活动',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '69',
        name: '其他金融业',
        children: [
          {
            code: '691',
            name: '金融信托与管理服务',
            children: [
              {
                code: '6911',
                name: '信托公司',
                children: [],
              },
              {
                code: '6919',
                name: '其他金融信托与管理服务',
                children: [],
              },
            ],
          },
          {
            code: '692',
            name: '控股公司服务',
            children: [
              {
                code: '6920',
                name: '控股公司服务',
                children: [],
              },
            ],
          },
          {
            code: '693',
            name: '非金融机构支付服务',
            children: [
              {
                code: '6930',
                name: '非金融机构支付服务',
                children: [],
              },
            ],
          },
          {
            code: '694',
            name: '金融信息服务',
            children: [
              {
                code: '6940',
                name: '金融信息服务',
                children: [],
              },
            ],
          },
          {
            code: '695',
            name: '金融资产管理公司',
            children: [
              {
                code: '6950',
                name: '金融资产管理公司',
                children: [],
              },
            ],
          },
          {
            code: '699',
            name: '其他未列明金融业',
            children: [
              {
                code: '6991',
                name: '货币经纪公司服务',
                children: [],
              },
              {
                code: '6999',
                name: '其他未包括金融业',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'K',
    name: '房地产业',
    children: [
      {
        code: '70',
        name: '房地产业',
        children: [
          {
            code: '701',
            name: '房地产开发经营',
            children: [
              {
                code: '7010',
                name: '房地产开发经营',
                children: [],
              },
            ],
          },
          {
            code: '702',
            name: '物业管理',
            children: [
              {
                code: '7020',
                name: '物业管理',
                children: [],
              },
            ],
          },
          {
            code: '703',
            name: '房地产中介服务',
            children: [
              {
                code: '7030',
                name: '房地产中介服务',
                children: [],
              },
            ],
          },
          {
            code: '704',
            name: '房地产租赁经营',
            children: [
              {
                code: '7040',
                name: '房地产租赁经营',
                children: [],
              },
            ],
          },
          {
            code: '709',
            name: '其他房地产业',
            children: [
              {
                code: '7090',
                name: '其他房地产业',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'L',
    name: '租赁和商务服务业',
    children: [
      {
        code: '71',
        name: '租赁业',
        children: [
          {
            code: '711',
            name: '机械设备经营租赁',
            children: [
              {
                code: '7111',
                name: '汽车租赁',
                children: [],
              },
              {
                code: '7112',
                name: '农业机械经营租赁',
                children: [],
              },
              {
                code: '7113',
                name: '建筑工程机械与设备经营租赁',
                children: [],
              },
              {
                code: '7114',
                name: '计算机及通讯设备经营租赁',
                children: [],
              },
              {
                code: '7115',
                name: '医疗设备经营租赁',
                children: [],
              },
              {
                code: '7119',
                name: '其他机械与设备经营租赁',
                children: [],
              },
            ],
          },
          {
            code: '712',
            name: '文体设备和用品出租',
            children: [
              {
                code: '7121',
                name: '休闲娱乐用品设备出租',
                children: [],
              },
              {
                code: '7122',
                name: '体育用品设备出租',
                children: [],
              },
              {
                code: '7123',
                name: '文化用品设备出租',
                children: [],
              },
              {
                code: '7124',
                name: '图书出租',
                children: [],
              },
              {
                code: '7125',
                name: '音像制品出租',
                children: [],
              },
              {
                code: '7129',
                name: '其他文体设备和用品出租',
                children: [],
              },
            ],
          },
          {
            code: '713',
            name: '日用品出租',
            children: [
              {
                code: '7130',
                name: '日用品出租',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '72',
        name: '商务服务业',
        children: [
          {
            code: '721',
            name: '组织管理服务',
            children: [
              {
                code: '7211',
                name: '企业总部管理',
                children: [],
              },
              {
                code: '7212',
                name: '投资与资产管理',
                children: [],
              },
              {
                code: '7213',
                name: '资源与产权交易服务',
                children: [],
              },
              {
                code: '7214',
                name: '单位后勤管理服务',
                children: [],
              },
              {
                code: '7215',
                name: '农村集体经济组织管理',
                children: [],
              },
              {
                code: '7219',
                name: '其他组织管理服务',
                children: [],
              },
            ],
          },
          {
            code: '722',
            name: '综合管理服务',
            children: [
              {
                code: '7221',
                name: '园区管理服务',
                children: [],
              },
              {
                code: '7222',
                name: '商业综合体管理服务',
                children: [],
              },
              {
                code: '7223',
                name: '市场管理服务',
                children: [],
              },
              {
                code: '7224',
                name: '供应链管理服务',
                children: [],
              },
              {
                code: '7229',
                name: '其他综合管理服务',
                children: [],
              },
            ],
          },
          {
            code: '723',
            name: '法律服务',
            children: [
              {
                code: '7231',
                name: '律师及相关法律服务',
                children: [],
              },
              {
                code: '7232',
                name: '公证服务',
                children: [],
              },
              {
                code: '7239',
                name: '其他法律服务',
                children: [],
              },
            ],
          },
          {
            code: '724',
            name: '咨询与调查',
            children: [
              {
                code: '7241',
                name: '会计、审计及税务服务',
                children: [],
              },
              {
                code: '7242',
                name: '市场调查',
                children: [],
              },
              {
                code: '7243',
                name: '社会经济咨询',
                children: [],
              },
              {
                code: '7244',
                name: '健康咨询',
                children: [],
              },
              {
                code: '7245',
                name: '环保咨询',
                children: [],
              },
              {
                code: '7246',
                name: '体育咨询',
                children: [],
              },
              {
                code: '7249',
                name: '其他专业咨询与调查',
                children: [],
              },
            ],
          },
          {
            code: '725',
            name: '广告业',
            children: [
              {
                code: '7251',
                name: '互联网广告服务',
                children: [],
              },
              {
                code: '7259',
                name: '其他广告服务',
                children: [],
              },
            ],
          },
          {
            code: '726',
            name: '人力资源服务',
            children: [
              {
                code: '7261',
                name: '公共就业服务',
                children: [],
              },
              {
                code: '7262',
                name: '职业中介服务',
                children: [],
              },
              {
                code: '7263',
                name: '劳务派遣服务',
                children: [],
              },
              {
                code: '7264',
                name: '创业指导服务',
                children: [],
              },
              {
                code: '7269',
                name: '其他人力资源服务',
                children: [],
              },
            ],
          },
          {
            code: '727',
            name: '安全保护服务',
            children: [
              {
                code: '7271',
                name: '安全服务',
                children: [],
              },
              {
                code: '7272',
                name: '安全系统监控服务',
                children: [],
              },
              {
                code: '7279',
                name: '其他安全保护服务',
                children: [],
              },
            ],
          },
          {
            code: '728',
            name: '会议、展览及相关服务',
            children: [
              {
                code: '7281',
                name: '科技会展服务',
                children: [],
              },
              {
                code: '7282',
                name: '旅游会展服务',
                children: [],
              },
              {
                code: '7283',
                name: '体育会展服务',
                children: [],
              },
              {
                code: '7284',
                name: '文化会展服务',
                children: [],
              },
              {
                code: '7289',
                name: '其他会议、会展及相关服务',
                children: [],
              },
            ],
          },
          {
            code: '729',
            name: '其他商务服务业',
            children: [
              {
                code: '7291',
                name: '旅行社及相关服务',
                children: [],
              },
              {
                code: '7292',
                name: '包装服务',
                children: [],
              },
              {
                code: '7293',
                name: '办公服务',
                children: [],
              },
              {
                code: '7294',
                name: '翻译服务',
                children: [],
              },
              {
                code: '7295',
                name: '信用服务',
                children: [],
              },
              {
                code: '7296',
                name: '非融资担保服务',
                children: [],
              },
              {
                code: '7297',
                name: '商务代理代办服务',
                children: [],
              },
              {
                code: '7298',
                name: '票务代理服务',
                children: [],
              },
              {
                code: '7299',
                name: '其他未列明商务服务业',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'M',
    name: '科学研究和技术服务业',
    children: [
      {
        code: '73',
        name: '研究和试验发展',
        children: [
          {
            code: '731',
            name: '自然科学研究和试验发展',
            children: [
              {
                code: '7310',
                name: '自然科学研究和试验发展',
                children: [],
              },
            ],
          },
          {
            code: '732',
            name: '工程和技术研究和试验发展',
            children: [
              {
                code: '7320',
                name: '工程和技术研究和试验发展',
                children: [],
              },
            ],
          },
          {
            code: '733',
            name: '农业科学研究和试验发展',
            children: [
              {
                code: '7330',
                name: '农业科学研究和试验发展',
                children: [],
              },
            ],
          },
          {
            code: '734',
            name: '医学研究和试验发展',
            children: [
              {
                code: '7340',
                name: '医学研究和试验发展',
                children: [],
              },
            ],
          },
          {
            code: '735',
            name: '社会人文科学研究',
            children: [
              {
                code: '7350',
                name: '社会人文科学研究',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '74',
        name: '专业技术服务业',
        children: [
          {
            code: '741',
            name: '气象服务',
            children: [
              {
                code: '7410',
                name: '气象服务',
                children: [],
              },
            ],
          },
          {
            code: '742',
            name: '地震服务',
            children: [
              {
                code: '7420',
                name: '地震服务',
                children: [],
              },
            ],
          },
          {
            code: '743',
            name: '海洋服务',
            children: [
              {
                code: '7431',
                name: '海洋气象服务',
                children: [],
              },
              {
                code: '7432',
                name: '海洋环境服务',
                children: [],
              },
              {
                code: '7439',
                name: '其他海洋服务',
                children: [],
              },
            ],
          },
          {
            code: '744',
            name: '测绘地理信息服务',
            children: [
              {
                code: '7441',
                name: '遥感测绘服务',
                children: [],
              },
              {
                code: '7449',
                name: '其他测绘地理信息服务',
                children: [],
              },
            ],
          },
          {
            code: '745',
            name: '质检技术服务',
            children: [
              {
                code: '7451',
                name: '检验检疫服务',
                children: [],
              },
              {
                code: '7452',
                name: '检测服务',
                children: [],
              },
              {
                code: '7453',
                name: '计量服务',
                children: [],
              },
              {
                code: '7454',
                name: '标准化服务',
                children: [],
              },
              {
                code: '7455',
                name: '认证认可服务',
                children: [],
              },
              {
                code: '7459',
                name: '其他质检技术服务',
                children: [],
              },
            ],
          },
          {
            code: '746',
            name: '环境与生态监测检测服务',
            children: [
              {
                code: '7461',
                name: '环境保护监测',
                children: [],
              },
              {
                code: '7462',
                name: '生态资源监测',
                children: [],
              },
              {
                code: '7463',
                name: '野生动物疫源疫病防控监测',
                children: [],
              },
            ],
          },
          {
            code: '747',
            name: '地质勘查',
            children: [
              {
                code: '7471',
                name: '能源矿产地质勘查',
                children: [],
              },
              {
                code: '7472',
                name: '固体矿产地质勘查',
                children: [],
              },
              {
                code: '7473',
                name: '水、二氧化碳等矿产地质勘查',
                children: [],
              },
              {
                code: '7474',
                name: '基础地质勘查',
                children: [],
              },
              {
                code: '7475',
                name: '地质勘查技术服务',
                children: [],
              },
            ],
          },
          {
            code: '748',
            name: '工程技术与设计服务',
            children: [
              {
                code: '7481',
                name: '工程管理服务',
                children: [],
              },
              {
                code: '7482',
                name: '工程监理服务',
                children: [],
              },
              {
                code: '7483',
                name: '工程勘察活动',
                children: [],
              },
              {
                code: '7484',
                name: '工程设计活动',
                children: [],
              },
              {
                code: '7485',
                name: '规划设计管理',
                children: [],
              },
              {
                code: '7486',
                name: '土地规划服务',
                children: [],
              },
            ],
          },
          {
            code: '749',
            name: '工业与专业设计及其他专业技术服务',
            children: [
              {
                code: '7491',
                name: '工业设计服务',
                children: [],
              },
              {
                code: '7492',
                name: '专业设计服务',
                children: [],
              },
              {
                code: '7493',
                name: '兽医服务',
                children: [],
              },
              {
                code: '7499',
                name: '其他未列明专业技术服务业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '75',
        name: '科技推广和应用服务业',
        children: [
          {
            code: '751',
            name: '技术推广服务',
            children: [
              {
                code: '7511',
                name: '农林牧渔技术推广服务',
                children: [],
              },
              {
                code: '7512',
                name: '生物技术推广服务',
                children: [],
              },
              {
                code: '7513',
                name: '新材料技术推广服务',
                children: [],
              },
              {
                code: '7514',
                name: '节能技术推广服务',
                children: [],
              },
              {
                code: '7515',
                name: '新能源技术推广服务',
                children: [],
              },
              {
                code: '7516',
                name: '环保技术推广服务',
                children: [],
              },
              {
                code: '7517',
                name: '三维（3D)打印技术推广服务',
                children: [],
              },
              {
                code: '7519',
                name: '其他技术推广服务',
                children: [],
              },
            ],
          },
          {
            code: '752',
            name: '知识产权服务',
            children: [
              {
                code: '7520',
                name: '知识产权服务',
                children: [],
              },
            ],
          },
          {
            code: '753',
            name: '科技中介服务',
            children: [
              {
                code: '7530',
                name: '科技中介服务',
                children: [],
              },
            ],
          },
          {
            code: '754',
            name: '创业空间服务',
            children: [
              {
                code: '7540',
                name: '创业空间服务',
                children: [],
              },
            ],
          },
          {
            code: '759',
            name: '其他科技推广服务业',
            children: [
              {
                code: '7590',
                name: '其他科技推广服务业',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'N',
    name: '水利、环境和公共设施管理业',
    children: [
      {
        code: '76',
        name: '水利管理业',
        children: [
          {
            code: '761',
            name: '防洪除涝设施管理',
            children: [
              {
                code: '7610',
                name: '防洪除涝设施管理',
                children: [],
              },
            ],
          },
          {
            code: '762',
            name: '水资源管理',
            children: [
              {
                code: '7620',
                name: '水资源管理',
                children: [],
              },
            ],
          },
          {
            code: '763',
            name: '天然水收集与分配',
            children: [
              {
                code: '7630',
                name: '天然水收集与分配',
                children: [],
              },
            ],
          },
          {
            code: '764',
            name: '水文服务',
            children: [
              {
                code: '7640',
                name: '水文服务',
                children: [],
              },
            ],
          },
          {
            code: '769',
            name: '其他水利管理业',
            children: [
              {
                code: '7690',
                name: '其他水利管理业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '77',
        name: '生态保护和环境治理业',
        children: [
          {
            code: '771',
            name: '生态保护',
            children: [
              {
                code: '7711',
                name: '自然生态系统保护管理',
                children: [],
              },
              {
                code: '7712',
                name: '自然遗迹保护管理',
                children: [],
              },
              {
                code: '7713',
                name: '野生动物保护',
                children: [],
              },
              {
                code: '7714',
                name: '野生植物保护',
                children: [],
              },
              {
                code: '7715',
                name: '动物园、水族馆管理服务',
                children: [],
              },
              {
                code: '7716',
                name: '植物园管理服务',
                children: [],
              },
              {
                code: '7719',
                name: '其他自然保护',
                children: [],
              },
            ],
          },
          {
            code: '772',
            name: '环境治理业',
            children: [
              {
                code: '7721',
                name: '水污染治理',
                children: [],
              },
              {
                code: '7722',
                name: '大气污染治理',
                children: [],
              },
              {
                code: '7723',
                name: '固体废物治理',
                children: [],
              },
              {
                code: '7724',
                name: '危险废物治理',
                children: [],
              },
              {
                code: '7725',
                name: '放射性废物治理',
                children: [],
              },
              {
                code: '7726',
                name: '土壤污染治理与修复服务',
                children: [],
              },
              {
                code: '7727',
                name: '噪声与振动控制服务',
                children: [],
              },
              {
                code: '7729',
                name: '其他污染治理',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '78',
        name: '公共设施管理业',
        children: [
          {
            code: '781',
            name: '市政设施管理',
            children: [
              {
                code: '7810',
                name: '市政设施管理',
                children: [],
              },
            ],
          },
          {
            code: '782',
            name: '环境卫生管理',
            children: [
              {
                code: '7820',
                name: '环境卫生管理',
                children: [],
              },
            ],
          },
          {
            code: '783',
            name: '城乡市容管理',
            children: [
              {
                code: '7830',
                name: '城乡市容管理',
                children: [],
              },
            ],
          },
          {
            code: '784',
            name: '绿化管理',
            children: [
              {
                code: '7840',
                name: '绿化管理',
                children: [],
              },
            ],
          },
          {
            code: '785',
            name: '城市公园管理',
            children: [
              {
                code: '7850',
                name: '城市公园管理',
                children: [],
              },
            ],
          },
          {
            code: '786',
            name: '游览景区管理',
            children: [
              {
                code: '7861',
                name: '名胜风景区管理',
                children: [],
              },
              {
                code: '7862',
                name: '森林公园管理',
                children: [],
              },
              {
                code: '7869',
                name: '其他游览景区管理',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '79',
        name: '土地管理业',
        children: [
          {
            code: '791',
            name: '土地整治服务',
            children: [
              {
                code: '7910',
                name: '土地整治服务',
                children: [],
              },
            ],
          },
          {
            code: '792',
            name: '土地调查评估服务',
            children: [
              {
                code: '7920',
                name: '土地调查评估服务',
                children: [],
              },
            ],
          },
          {
            code: '793',
            name: '土地登记服务',
            children: [
              {
                code: '7930',
                name: '土地登记服务',
                children: [],
              },
            ],
          },
          {
            code: '794',
            name: '土地登记代理服务',
            children: [
              {
                code: '7940',
                name: '土地登记代理服务',
                children: [],
              },
            ],
          },
          {
            code: '799',
            name: '其他土地管理服务',
            children: [
              {
                code: '7990',
                name: '其他土地管理服务',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'O',
    name: '居民服务、修理和其他服务业',
    children: [
      {
        code: '80',
        name: '居民服务业',
        children: [
          {
            code: '801',
            name: '家庭服务',
            children: [
              {
                code: '8010',
                name: '家庭服务',
                children: [],
              },
            ],
          },
          {
            code: '802',
            name: '托儿所服务',
            children: [
              {
                code: '8020',
                name: '托儿所服务',
                children: [],
              },
            ],
          },
          {
            code: '803',
            name: '洗染服务',
            children: [
              {
                code: '8030',
                name: '洗染服务',
                children: [],
              },
            ],
          },
          {
            code: '804',
            name: '理发及美容服务',
            children: [
              {
                code: '8040',
                name: '理发及美容服务',
                children: [],
              },
            ],
          },
          {
            code: '805',
            name: '洗浴和保健养生服务',
            children: [
              {
                code: '8051',
                name: '洗浴服务',
                children: [],
              },
              {
                code: '8052',
                name: '足浴服务',
                children: [],
              },
              {
                code: '8053',
                name: '养生保健服务',
                children: [],
              },
            ],
          },
          {
            code: '806',
            name: '摄影扩印服务',
            children: [
              {
                code: '8060',
                name: '摄影扩印服务',
                children: [],
              },
            ],
          },
          {
            code: '807',
            name: '婚姻服务',
            children: [
              {
                code: '8070',
                name: '婚姻服务',
                children: [],
              },
            ],
          },
          {
            code: '808',
            name: '殡葬服务',
            children: [
              {
                code: '8080',
                name: '殡葬服务',
                children: [],
              },
            ],
          },
          {
            code: '809',
            name: '其他居民服务业',
            children: [
              {
                code: '8090',
                name: '其他居民服务业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '81',
        name: '机动车、电子产品和日用产品修理业',
        children: [
          {
            code: '811',
            name: '汽车、摩托车等修理与维护',
            children: [
              {
                code: '8111',
                name: '汽车修理与维护',
                children: [],
              },
              {
                code: '8112',
                name: '大型车辆装备修理与维护',
                children: [],
              },
              {
                code: '8113',
                name: '摩托车修理与维护',
                children: [],
              },
              {
                code: '8114',
                name: '助动车等修理与维护',
                children: [],
              },
            ],
          },
          {
            code: '812',
            name: '计算机和办公设备维修',
            children: [
              {
                code: '8121',
                name: '计算机和辅助设备修理',
                children: [],
              },
              {
                code: '8122',
                name: '通讯设备修理',
                children: [],
              },
              {
                code: '8129',
                name: '其他办公设备维修',
                children: [],
              },
            ],
          },
          {
            code: '813',
            name: '家用电器修理',
            children: [
              {
                code: '8131',
                name: '家用电子产品修理',
                children: [],
              },
              {
                code: '8132',
                name: '日用电器修理',
                children: [],
              },
            ],
          },
          {
            code: '819',
            name: '其他日用产品修理业',
            children: [
              {
                code: '8191',
                name: '自行车修理',
                children: [],
              },
              {
                code: '8192',
                name: '鞋和皮革修理',
                children: [],
              },
              {
                code: '8193',
                name: '家具和相关物品修理',
                children: [],
              },
              {
                code: '8199',
                name: '其他未列明日用产品修理业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '82',
        name: '其他服务业',
        children: [
          {
            code: '821',
            name: '清洁服务',
            children: [
              {
                code: '8211',
                name: '建筑物清洁服务',
                children: [],
              },
              {
                code: '8219',
                name: '其他清洁服务',
                children: [],
              },
            ],
          },
          {
            code: '822',
            name: '宠物服务',
            children: [
              {
                code: '8221',
                name: '宠物饲养',
                children: [],
              },
              {
                code: '8222',
                name: '宠物医院服务',
                children: [],
              },
              {
                code: '8223',
                name: '宠物美容服务',
                children: [],
              },
              {
                code: '8224',
                name: '宠物寄托收养服务',
                children: [],
              },
              {
                code: '8229',
                name: '其他宠物服务',
                children: [],
              },
            ],
          },
          {
            code: '829',
            name: '其他未列明服务业',
            children: [
              {
                code: '8290',
                name: '其他未列明服务业',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'P',
    name: '教育',
    children: [
      {
        code: '83',
        name: '教育',
        children: [
          {
            code: '831',
            name: '学前教育',
            children: [
              {
                code: '8310',
                name: '学前教育',
                children: [],
              },
            ],
          },
          {
            code: '832',
            name: '初等教育',
            children: [
              {
                code: '8321',
                name: '普通小学教育',
                children: [],
              },
              {
                code: '8322',
                name: '成人小学教育',
                children: [],
              },
            ],
          },
          {
            code: '833',
            name: '中等教育',
            children: [
              {
                code: '8331',
                name: '普通初中教育',
                children: [],
              },
              {
                code: '8332',
                name: '职业初中教育',
                children: [],
              },
              {
                code: '8333',
                name: '成人初中教育',
                children: [],
              },
              {
                code: '8334',
                name: '普通高中教育',
                children: [],
              },
              {
                code: '8335',
                name: '成人高中教育',
                children: [],
              },
              {
                code: '8336',
                name: '中等职业学校教育',
                children: [],
              },
            ],
          },
          {
            code: '834',
            name: '高等教育',
            children: [
              {
                code: '8341',
                name: '普通高等教育',
                children: [],
              },
              {
                code: '8342',
                name: '成人高等教育',
                children: [],
              },
            ],
          },
          {
            code: '835',
            name: '特殊教育',
            children: [
              {
                code: '8350',
                name: '特殊教育',
                children: [],
              },
            ],
          },
          {
            code: '839',
            name: '技能培训、教育辅助及其他教育',
            children: [
              {
                code: '8391',
                name: '职业技能培训',
                children: [],
              },
              {
                code: '8392',
                name: '体校及体育培训',
                children: [],
              },
              {
                code: '8393',
                name: '文化艺术培训',
                children: [],
              },
              {
                code: '8394',
                name: '教育辅助服务',
                children: [],
              },
              {
                code: '8399',
                name: '其他未列明教育',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'Q',
    name: '卫生和社会工作',
    children: [
      {
        code: '84',
        name: '卫生',
        children: [
          {
            code: '841',
            name: '医院',
            children: [
              {
                code: '8411',
                name: '综合医院',
                children: [],
              },
              {
                code: '8412',
                name: '中医医院',
                children: [],
              },
              {
                code: '8413',
                name: '中西医结合医院',
                children: [],
              },
              {
                code: '8414',
                name: '民族医院',
                children: [],
              },
              {
                code: '8415',
                name: '专科医院',
                children: [],
              },
              {
                code: '8416',
                name: '疗养院',
                children: [],
              },
            ],
          },
          {
            code: '842',
            name: '基层医疗卫生服务',
            children: [
              {
                code: '8421',
                name: '社区卫生服务中心（站）',
                children: [],
              },
              {
                code: '8422',
                name: '街道卫生院',
                children: [],
              },
              {
                code: '8423',
                name: '乡镇卫生院',
                children: [],
              },
              {
                code: '8424',
                name: '村卫生室',
                children: [],
              },
              {
                code: '8425',
                name: '门诊部（所）',
                children: [],
              },
            ],
          },
          {
            code: '843',
            name: '专业公共卫生服务',
            children: [
              {
                code: '8431',
                name: '疾病预防控制中心',
                children: [],
              },
              {
                code: '8432',
                name: '专科疾病防治院（所、站）',
                children: [],
              },
              {
                code: '8433',
                name: '妇幼保健院（所、站）',
                children: [],
              },
              {
                code: '8434',
                name: '急救中心（站）服务',
                children: [],
              },
              {
                code: '8435',
                name: '采供血机构服务',
                children: [],
              },
              {
                code: '8436',
                name: '计划生育技术服务活动',
                children: [],
              },
            ],
          },
          {
            code: '849',
            name: '其他卫生活动',
            children: [
              {
                code: '8491',
                name: '健康体检服务',
                children: [],
              },
              {
                code: '8492',
                name: '临床检验服务',
                children: [],
              },
              {
                code: '8499',
                name: '其他未列明卫生服务',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '85',
        name: '社会工作',
        children: [
          {
            code: '851',
            name: '提供住宿社会工作',
            children: [
              {
                code: '8511',
                name: '干部休养所',
                children: [],
              },
              {
                code: '8512',
                name: '护理机构服务',
                children: [],
              },
              {
                code: '8513',
                name: '精神康复服务',
                children: [],
              },
              {
                code: '8514',
                name: '老年人、残疾人养护服务',
                children: [],
              },
              {
                code: '8515',
                name: '临终关怀服务',
                children: [],
              },
              {
                code: '8516',
                name: '孤残儿童收养和庇护服务',
                children: [],
              },
              {
                code: '8519',
                name: '其他提供住宿社会救助',
                children: [],
              },
            ],
          },
          {
            code: '852',
            name: '不提供住宿社会工作',
            children: [
              {
                code: '8521',
                name: '社会看护与帮助服务',
                children: [],
              },
              {
                code: '8522',
                name: '康复辅具适配服务',
                children: [],
              },
              {
                code: '8529',
                name: '其他不提供住宿社会工作',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'R',
    name: '文化、体育和娱乐业',
    children: [
      {
        code: '86',
        name: '新闻和出版业',
        children: [
          {
            code: '861',
            name: '新闻业',
            children: [
              {
                code: '8610',
                name: '新闻业',
                children: [],
              },
            ],
          },
          {
            code: '862',
            name: '出版业',
            children: [
              {
                code: '8621',
                name: '图书出版',
                children: [],
              },
              {
                code: '8622',
                name: '报纸出版',
                children: [],
              },
              {
                code: '8623',
                name: '期刊出版',
                children: [],
              },
              {
                code: '8624',
                name: '音像制品出版',
                children: [],
              },
              {
                code: '8625',
                name: '电子出版物出版',
                children: [],
              },
              {
                code: '8626',
                name: '数字出版',
                children: [],
              },
              {
                code: '8629',
                name: '其他出版业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '87',
        name: '广播、电视、电影和录音制作业',
        children: [
          {
            code: '871',
            name: '广播',
            children: [
              {
                code: '8710',
                name: '广播',
                children: [],
              },
            ],
          },
          {
            code: '872',
            name: '电视',
            children: [
              {
                code: '8720',
                name: '电视',
                children: [],
              },
            ],
          },
          {
            code: '873',
            name: '影视节目制作',
            children: [
              {
                code: '8730',
                name: '影视节目制作',
                children: [],
              },
            ],
          },
          {
            code: '874',
            name: '广播电视集成播控',
            children: [
              {
                code: '8740',
                name: '广播电视集成播控',
                children: [],
              },
            ],
          },
          {
            code: '875',
            name: '电影和广播电视节目发行',
            children: [
              {
                code: '8750',
                name: '电影和广播电视节目发行',
                children: [],
              },
            ],
          },
          {
            code: '876',
            name: '电影放映',
            children: [
              {
                code: '8760',
                name: '电影放映',
                children: [],
              },
            ],
          },
          {
            code: '877',
            name: '录音制作',
            children: [
              {
                code: '8770',
                name: '录音制作',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '88',
        name: '文化艺术业',
        children: [
          {
            code: '881',
            name: '文艺创作与表演',
            children: [
              {
                code: '8810',
                name: '文艺创作与表演',
                children: [],
              },
            ],
          },
          {
            code: '882',
            name: '艺术表演场馆',
            children: [
              {
                code: '8820',
                name: '艺术表演场馆',
                children: [],
              },
            ],
          },
          {
            code: '883',
            name: '图书馆与档案馆',
            children: [
              {
                code: '8831',
                name: '图书馆',
                children: [],
              },
              {
                code: '8832',
                name: '档案馆',
                children: [],
              },
            ],
          },
          {
            code: '884',
            name: '文物及非物质文化遗产保护',
            children: [
              {
                code: '8840',
                name: '文物及非物质文化遗产保护',
                children: [],
              },
            ],
          },
          {
            code: '885',
            name: '博物馆',
            children: [
              {
                code: '8850',
                name: '博物馆',
                children: [],
              },
            ],
          },
          {
            code: '886',
            name: '烈士陵园、纪念馆',
            children: [
              {
                code: '8860',
                name: '烈士陵园、纪念馆',
                children: [],
              },
            ],
          },
          {
            code: '887',
            name: '群众文体活动',
            children: [
              {
                code: '8870',
                name: '群众文体活动',
                children: [],
              },
            ],
          },
          {
            code: '889',
            name: '其他文化艺术业',
            children: [
              {
                code: '8890',
                name: '其他文化艺术业',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '89',
        name: '体育',
        children: [
          {
            code: '891',
            name: '体育组织',
            children: [
              {
                code: '8911',
                name: '体育竞赛组织',
                children: [],
              },
              {
                code: '8912',
                name: '体育保障组织',
                children: [],
              },
              {
                code: '8919',
                name: '其他体育组织',
                children: [],
              },
            ],
          },
          {
            code: '892',
            name: '体育场地设施管理',
            children: [
              {
                code: '8921',
                name: '体育场馆管理',
                children: [],
              },
              {
                code: '8929',
                name: '其他体育场地设施管理',
                children: [],
              },
            ],
          },
          {
            code: '893',
            name: '健身休闲活动',
            children: [
              {
                code: '8930',
                name: '健身休闲活动',
                children: [],
              },
            ],
          },
          {
            code: '899',
            name: '其他体育',
            children: [
              {
                code: '8991',
                name: '体育中介代理服务',
                children: [],
              },
              {
                code: '8992',
                name: '体育健康服务',
                children: [],
              },
              {
                code: '8999',
                name: '其他未列明体育',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '90',
        name: '娱乐业',
        children: [
          {
            code: '901',
            name: '室内娱乐活动',
            children: [
              {
                code: '9011',
                name: '歌舞厅娱乐活动',
                children: [],
              },
              {
                code: '9012',
                name: '电子游艺厅娱乐活动',
                children: [],
              },
              {
                code: '9013',
                name: '网吧活动',
                children: [],
              },
              {
                code: '9019',
                name: '其他室内娱乐活动',
                children: [],
              },
            ],
          },
          {
            code: '902',
            name: '游乐园',
            children: [
              {
                code: '9020',
                name: '游乐园',
                children: [],
              },
            ],
          },
          {
            code: '903',
            name: '休闲观光活动',
            children: [
              {
                code: '9030',
                name: '休闲观光活动',
                children: [],
              },
            ],
          },
          {
            code: '904',
            name: '彩票活动',
            children: [
              {
                code: '9041',
                name: '体育彩票服务',
                children: [],
              },
              {
                code: '9042',
                name: '福利彩票服务',
                children: [],
              },
              {
                code: '9049',
                name: '其他彩票服务',
                children: [],
              },
            ],
          },
          {
            code: '905',
            name: '文化体育娱乐活动与经纪代理服务',
            children: [
              {
                code: '9051',
                name: '文化活动服务',
                children: [],
              },
              {
                code: '9052',
                name: '体育表演服务',
                children: [],
              },
              {
                code: '9053',
                name: '文化娱乐经纪人',
                children: [],
              },
              {
                code: '9054',
                name: '体育经纪人',
                children: [],
              },
              {
                code: '9059',
                name: '其他文化艺术经纪代理',
                children: [],
              },
            ],
          },
          {
            code: '909',
            name: '其他娱乐业',
            children: [
              {
                code: '9090',
                name: '其他娱乐业',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'S',
    name: '公共管理、社会保障和社会组织',
    children: [
      {
        code: '91',
        name: '中国共产党机关',
        children: [
          {
            code: '910',
            name: '中国共产党机关',
            children: [
              {
                code: '9100',
                name: '中国共产党机关',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '92',
        name: '国家机构',
        children: [
          {
            code: '921',
            name: '国家权力机构',
            children: [
              {
                code: '9210',
                name: '国家权力机构',
                children: [],
              },
            ],
          },
          {
            code: '922',
            name: '国家行政机构',
            children: [
              {
                code: '9221',
                name: '综合事务管理机构',
                children: [],
              },
              {
                code: '9222',
                name: '对外事务管理机构',
                children: [],
              },
              {
                code: '9223',
                name: '公共安全管理机构',
                children: [],
              },
              {
                code: '9224',
                name: '社会事务管理机构',
                children: [],
              },
              {
                code: '9225',
                name: '经济事务管理机构',
                children: [],
              },
              {
                code: '9226',
                name: '行政监督检查机构',
                children: [],
              },
            ],
          },
          {
            code: '923',
            name: '人民法院和人民检察院',
            children: [
              {
                code: '9231',
                name: '人民法院',
                children: [],
              },
              {
                code: '9232',
                name: '人民检察院',
                children: [],
              },
            ],
          },
          {
            code: '929',
            name: '其他国家机构',
            children: [
              {
                code: '9291',
                name: '消防管理机构',
                children: [],
              },
              {
                code: '9299',
                name: '其他未列明国家机构',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '93',
        name: '人民政协、民主党派',
        children: [
          {
            code: '931',
            name: '人民政协',
            children: [
              {
                code: '9310',
                name: '人民政协',
                children: [],
              },
            ],
          },
          {
            code: '932',
            name: '民主党派',
            children: [
              {
                code: '9320',
                name: '民主党派',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '94',
        name: '社会保障',
        children: [
          {
            code: '941',
            name: '基本保险',
            children: [
              {
                code: '9411',
                name: '基本养老保险',
                children: [],
              },
              {
                code: '9412',
                name: '基本医疗保险',
                children: [],
              },
              {
                code: '9413',
                name: '失业保险',
                children: [],
              },
              {
                code: '9414',
                name: '工伤保险',
                children: [],
              },
              {
                code: '9415',
                name: '生育保险',
                children: [],
              },
              {
                code: '9419',
                name: '其他基本保险',
                children: [],
              },
            ],
          },
          {
            code: '942',
            name: '补充保险',
            children: [
              {
                code: '9420',
                name: '补充保险',
                children: [],
              },
            ],
          },
          {
            code: '949',
            name: '其他社会保障',
            children: [
              {
                code: '9490',
                name: '其他社会保障',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '95',
        name: '群众团体、社会团体和其他成员组织',
        children: [
          {
            code: '951',
            name: '群众团体',
            children: [
              {
                code: '9511',
                name: '工会',
                children: [],
              },
              {
                code: '9512',
                name: '妇联',
                children: [],
              },
              {
                code: '9513',
                name: '共青团',
                children: [],
              },
              {
                code: '9519',
                name: '其他群众团体',
                children: [],
              },
            ],
          },
          {
            code: '952',
            name: '社会团体',
            children: [
              {
                code: '9521',
                name: '专业性团体',
                children: [],
              },
              {
                code: '9522',
                name: '行业性团体',
                children: [],
              },
              {
                code: '9529',
                name: '其他社会团体',
                children: [],
              },
            ],
          },
          {
            code: '953',
            name: '基金会',
            children: [
              {
                code: '9530',
                name: '基金会',
                children: [],
              },
            ],
          },
          {
            code: '954',
            name: '宗教组织',
            children: [
              {
                code: '9541',
                name: '宗教团体服务',
                children: [],
              },
              {
                code: '9542',
                name: '宗教活动场所服务',
                children: [],
              },
            ],
          },
        ],
      },
      {
        code: '96',
        name: '基层群众自治组织及其他组织',
        children: [
          {
            code: '961',
            name: '社区居民自治组织',
            children: [
              {
                code: '9610',
                name: '社区居民自治组织',
                children: [],
              },
            ],
          },
          {
            code: '962',
            name: '村民自治组织',
            children: [
              {
                code: '9620',
                name: '村民自治组织',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'T',
    name: '国际组织',
    children: [
      {
        code: '97',
        name: '国际组织',
        children: [
          {
            code: '970',
            name: '国际组织',
            children: [
              {
                code: '9700',
                name: '国际组织',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];
