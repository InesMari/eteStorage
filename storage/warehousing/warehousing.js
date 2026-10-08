import {
  util,
  wxApi,
  common,
  regeneratorRuntime
} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    packObjData: [],
    manualAddCodeAlert: false,
    manualAddCodeList: [{}],
    codeMap:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.doQuery();
  },
  async doQuery() {
    let outOrderMaterialList = await util.postByBeanName('wmsInOrderTF', 'queryInOrderList');
    this.setData({
      outOrderMaterialList,
      outOrderMaterialListCache: outOrderMaterialList
    })
  },
  changeTab(e) {
    let {
      index
    } = e.currentTarget.dataset;
    this.data.info.materialList.forEach(item => {
      item.active = false;
    })
    this.data.info.materialList[index].active = true;
    this.setData({
      currentMaterialIndex: index,
      ['info.materialList']: this.data.info.materialList
    });
  },
  // 选择入库单号popover
  showOutOrderMaterialPopover() {
    this.setData({
      isShowOutOrderMaterialPopover: true
    })
  },
  /**
   * 选择入库单号
   */
  async selectOutOrderMaterial(e) {
    let {
      item
    } = e.currentTarget.dataset;
    this.queryOrder(item.inOrderId);
  },
  // 查入库单
  async queryOrder(inOrderId) {
    let info = await util.postByBeanName('wmsInOrderTF', 'queryWmsInOrderInfoForConfirm', {
      inOrderId
    });
    info.inOrderId = inOrderId;
    info.info.realBoxNums = info.info.boxNums;
    info.info.realNums = info.info.nums;
    info.info.realPalletNums = info.info.palletNums;
    info.materialList.forEach(el => {
      if(common.isBlank(el.list)){
        el.list = [{
          realNums: el.nums,
          realBoxNums: el.boxNums,
          realPalletNums: el.palletNums,
          freezeState: 0,
          qrcodeList:[],
        }];
      }else{
        el.list.forEach(item => {
          item.perPaperNum = Math.ceil(item.realNums / item.perNum);
        })
      }
    })
    info.materialList[0].active = true;
    this.setData({
      isShowOutOrderMaterialPopover: false,
      info,
      currentMaterialIndex: 0,
    });
    this.queryReservoir();
    this.queryStorage();

  },
  // 本地遍历查询入库单号
  searchOutOrderMaterialList(e) {
    let value = e.detail.value;
    this.setData({
      outOrderMaterialSearch: value
    });
    let outOrderMaterialList = [];
    this.data.outOrderMaterialListCache.forEach(el => {
      if (el.inOrderNum.indexOf(value) > -1) {
        outOrderMaterialList.push(el);
      }
    })
    this.setData({
      outOrderMaterialList
    });
  },

  // 查询库区
  async queryReservoir() {
    let reservoir = await util.postByBeanName('wmsReservoirTF', 'getReservoirDataSel');
    this.setData({
      reservoirList: reservoir
    })
    // 回显
    this.data.info.materialList.forEach(item => {
      item.list.forEach(el => {
        reservoir.forEach((res,index) => {
          if(res.reservoirId == el.reservoirId){
            el.reservoirIndex = index;
          }
        })
      })
    })
    this.setData({['info.materialList']:this.data.info.materialList});
  },
  // 选择库区
  reservoirChange(e) {
    let {
      value
    } = e.detail;
    let {
      index
    } = e.currentTarget.dataset;
    let reservoirId = this.data.reservoirList[value].reservoirId
    this.setData({
      ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].reservoirId']: reservoirId,
      ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].reservoirIndex']: value,
      ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].storageId']: undefined,
      ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].storageIndex']: undefined,
    });
    this.queryStorage(reservoirId);
  },
  // 查询库位
  async queryStorage(reservoirId) {
    let storageList = await util.postByBeanName('wmsReservoirTF', 'queryStorageList', {
      reservoirId
    });
    this.setData({
      storageList
    });
    // 回显
    this.data.info.materialList.forEach(item => {
      item.list.forEach(el => {
        storageList.forEach((res,index) => {
          if(res.storageId == el.storageId){
            el.storageIndex = index;
          }
        })
      })
    })
    this.setData({['info.materialList']:this.data.info.materialList});
  },
  // 选择库位
  storageChange(e) {
    let {
      value
    } = e.detail;
    let {
      index
    } = e.currentTarget.dataset;
    this.setData({
      ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].storageId']: this.data.storageList[value].storageId,
      ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].storageIndex']: value,
    });
    //反选库区
    this.data.reservoirList.forEach((el, i) => {
      if (el.reservoirId == this.data.storageList[value].reservoirId) {
        this.setData({
          ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].reservoirId']: el.reservoirId,
          ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].reservoirIndex']: i,
        });
      }
    })
  },

  inputSetDataPerNum(e) {
    let {
      value
    } = e.detail;
    let {
      index
    } = e.currentTarget.dataset;
    let realNums = this.data.info.materialList[this.data.currentMaterialIndex].list[index].realNums;
    // 计算条码张数
    let perPaperNum = Math.ceil(realNums / value);
    this.setData({
      ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].perNum']: value,
      ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].perPaperNum']: perPaperNum,
    });
  },
  inputSetDataAndCal(e) {
    let {
      value
    } = e.detail;
    let {
      index,
      key
    } = e.currentTarget.dataset;
    this.setData({
      ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].' + key]: value,
    });

    let {
      perBoxNums,
      perPalletNums,
      list
    } = this.data.info.materialList[this.data.currentMaterialIndex];
    let {
      realNums,
      realBoxNums,
      realPalletNums
    } = list[index];
    // 输入数量
    if (key == 'realNums') {
      // 计算箱数
      if (perBoxNums) {
        let tmp = common.accDiv(realNums, perBoxNums);
        this.setData({
          ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].realBoxNums']: Math.ceil(tmp)
        });
      }
      // 计算托数
      if (perPalletNums) {
        let tmp = common.accDiv(realNums, perPalletNums);
        this.setData({
          ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].realPalletNums']: Math.ceil(tmp)
        });
      }
    }
    // 输入箱数
    if (key == 'realBoxNums') {
      // 计算数量
      if (perBoxNums) {
        realNums = common.accMul(realBoxNums, perBoxNums);
        this.setData({
          ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].realNums']: realNums
        });
      }
      // 计算托数
      if (perPalletNums) {
        let tmp = common.accDiv(realNums, perPalletNums);
        this.setData({
          ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].realPalletNums']: Math.ceil(tmp)
        });
      }
    }
    // 输入托数
    if (key == 'realPalletNums') {
      // 计算数量
      if (perPalletNums) {
        realNums = common.accMul(realPalletNums, perPalletNums);
        this.setData({
          ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].realNums']: realNums
        });
      }
      // 计算箱数
      if (perBoxNums) {
        let tmp = common.accDiv(realNums, perBoxNums);
        this.setData({
          ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].realBoxNums']: Math.ceil(tmp)
        });
      }
    }

    // 计算合计和条码张数
    let numTotal = 0;
    let boxTotal = 0;
    let palletTotal = 0;
    this.data.info.materialList.forEach(item => {
      item.list.forEach(el => {
        numTotal += Number(el.realNums ? el.realNums : 0);
        boxTotal += Number(el.realBoxNums ? el.realBoxNums : 0);
        palletTotal += Number(el.realPalletNums ? el.realPalletNums : 0);
        el.perPaperNum = Math.ceil(el.realNums / el.perNum);
      })
    })
    this.setData({
      ['info.info.realNums']: numTotal,
      ['info.info.realBoxNums']: boxTotal,
      ['info.info.realPalletNums']: palletTotal,
      ['info.materialList']:this.data.info.materialList,
    });
  },
  // 是否冻结
  onFreezeChange(e) {
    let value = e.detail;
    value = value ? 1 : 0;
    let {
      index
    } = e.currentTarget.dataset;
    this.setData({
      ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].freezeState']: value,
    });
  },
  // 添加物料
  addItem() {
    let list = this.data.info.materialList[this.data.currentMaterialIndex].list;
    list.push({
      freezeState:0,
      qrcodeList:[],
    });
    this.setData({
      ['info.materialList[' + this.data.currentMaterialIndex + '].list']: list,
    });
  },
  // 删除物料
  delItem(e) {
    let {
      index
    } = e.currentTarget.dataset;
    let list = this.data.info.materialList[this.data.currentMaterialIndex].list;
    list.splice(index, 1);
    this.setData({
      ['info.materialList[' + this.data.currentMaterialIndex + '].list']: list,
    });
  },
  // 清空物料输入数据
  clearNum(e) {
    let {
      index
    } = e.currentTarget.dataset;
    this.setData({
      ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].realNums']: '',
      ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].realBoxNums']: '',
      ['info.materialList[' + this.data.currentMaterialIndex + '].list[' + index + '].realPalletNums']: '',
    });
    let realNums = 0;
    let realBoxNums = 0;
    let realPalletNums = 0;
    this.data.info.materialList.forEach(item => {
      item.list.forEach(el => {
        realNums += Number(el.realNums);
        realBoxNums += Number(el.realBoxNums);
        realPalletNums += Number(el.realPalletNums);
      })
    })
    this.setData({
      ['info.info.realNums']: realNums,
      ['info.info.realBoxNums']: realBoxNums,
      ['info.info.realPalletNums']: realPalletNums,
    });
  },
  // 入库单扫码
  orderScan() {
    let _this = this;
    wx.scanCode({
      success(res) {
        let qrCode = res.result; //入库单号
        _this.data.outOrderMaterialList.forEach(el => {
          if (el.inOrderNum = qrCode) {
            _this.queryOrder(el.inOrderId);
          }
        })
      }
    });
  },
  // 时代条码扫码
  sdCodeScan(){
    let _this = this;
    wx.scanCode({
      success(res) {
        let codeNum = res.result; //时代条码
        _this.setData({
          ['info.materialList[' + _this.data.currentMaterialIndex + '].codeNum']: codeNum,
        });
      }
    });
  },
  // 库位扫码
  doScan(e) {
    let {
      index
    } = e.currentTarget.dataset;
    let _this = this;
    console.log('为了用于单据上传的拍照以及扫描识别二维码，开发者将在获取你的明示同意后，访问你的摄像头。')
    wx.scanCode({
      success(res) {
        let qrCode = res.result; //库位编码
        let storageId;
        let reservoirId;
        // 自动选择库位
        _this.data.storageList.forEach((el, i) => {
          if (el.qrCode == qrCode) {
            storageId = el.storageId;
            reservoirId = el.reservoirId;
            _this.setData({
              ['info.materialList[' + _this.data.currentMaterialIndex + '].list[' + index + '].storageId']: storageId,
              ['info.materialList[' + _this.data.currentMaterialIndex + '].list[' + index + '].storageIndex']: i,
            });
          }
        })
        console.log(reservoirId);
        //反选库区
        _this.data.reservoirList.forEach((el, i) => {
          if (el.reservoirId == reservoirId) {
            _this.setData({
              ['info.materialList[' + _this.data.currentMaterialIndex + '].list[' + index + '].reservoirId']: reservoirId,
              ['info.materialList[' + _this.data.currentMaterialIndex + '].list[' + index + '].reservoirIndex']: i,
            });
          }
        })
      }
    })
  },
  // 时代扫码
  sdScan(e){
    let _this = this;
    let {index} = e.currentTarget.dataset;
    console.log('为了用于单据上传的拍照以及扫描识别二维码，开发者将在获取你的明示同意后，访问你的摄像头。')
    if(common.isBlank(_this.data.info.materialList[_this.data.currentMaterialIndex].list[index].perNum)){
      wxApi.showToast("请输入先每张条码数量。");
      return;
    }
    wx.scanCode({
      async success (res) {
        let codeNum = res.result;   //物料编码
        // 存放已经扫过的码
        let codeMap = _this.data.codeMap;
        if(codeMap.includes(codeNum)){
          wxApi.showToast("该条码已被扫描。");
          return;
        }else{
          codeMap.push(codeNum);
          _this.setData({codeMap});
        }
        let {qrcodeList,perNum,realNums} = _this.data.info.materialList[_this.data.currentMaterialIndex].list[index];
        perNum = Number(perNum);
        realNums = Number(realNums);
        let obj = {codeNum};
        let total = 0;  //扫码数量统计
        qrcodeList.forEach(item => {
          total += Number(item.nums?item.nums:0);
        })
        if(realNums<total+perNum){
          obj.nums = Number(realNums - total);
        }else{
          obj.nums = perNum;
        }
        qrcodeList.push(obj);
        _this.setData({
          ['info.materialList[' + _this.data.currentMaterialIndex + '].list[' + index + '].qrcodeList']: qrcodeList,
        });

        // 滚动到最后扫码位置
        let clientHeight = 0;
        wx.getSystemInfo({
          success: function (res) {
            // 获取可使用窗口高度
            clientHeight = res.windowHeight;
          }
        });
        let query = wx.createSelectorQuery().in(this);
        query.selectViewport().scrollOffset()
        query.select("#scanTable"+index).boundingClientRect();
        query.exec(function (res) {
          let scrollTop = res[0].scrollTop + res[1].top + res[1].height - clientHeight + 80;
          wx.pageScrollTo({
            scrollTop,
            duration: 300
          });
        });
      }
    })
  },
  // 删除时代扫码
  delScanCode(e){
    let {index,listindex} = e.currentTarget.dataset;
    let {qrcodeList} = this.data.info.materialList[this.data.currentMaterialIndex].list[listindex];
    this.data.codeMap.forEach((el,i) => {
      if(el == qrcodeList[index].codeNum){
        this.data.codeMap.splice(i,1);
      }
    })
    qrcodeList.splice(index,1);
    this.setData({['info.materialList[' + this.data.currentMaterialIndex + '].list[' + listindex + '].qrcodeList']:qrcodeList});
  },
  // 时代扫码数量输入
  inputSetDataSDnums(e){
    let {
      value
    } = e.detail;
    let {index,listindex} = e.currentTarget.dataset;
    this.setData({['info.materialList[' + this.data.currentMaterialIndex + '].list[' + listindex + '].qrcodeList[' + index + '].nums']:value});

  },
  // 包材数量
  inputSetPackData(e){
    let {value} = e.detail;
    let {index} = e.currentTarget.dataset;
    this.setData({
      ['info.packMaterialList['+index+'].realNums']:value,
    });
  },
  async submit() {
    // 检查时代扫码数量
    this.data.info.materialList.forEach(el => {
      el.list.forEach(item => {
        let total = 0;
        item.qrcodeList.forEach(code => {
          total += Number(code.nums);
        })
        if(total > item.realNums){
          wxApi.showToast("时代扫码数量总数超过实际入库数量。")
          return;
        }
      })
    })
    await util.postByBeanName('wmsInOrderTF', 'inOrderSure', this.data.info);
    await wxApi.showModal('提交成功');
    wx.navigateBack({
      delta: 1,
    })
  },
})