import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        windowheight: '',
        showInfo: false,
        showDialog: false,
        markers: [],
        latitude:23.147853,
        longitude:113.629242,
        licensePlate: '',
        qryDataSource: '[YQY]',
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        var that = this;
        wx.getSystemInfo({
            success(res) {
                that.setData({windowheight: res.windowHeight * res.pixelRatio})
            }
        })
    },
    onLoad: function () {
      this.queryCars();
    },
    // 查询自有车列表
    async queryCars(){
      let {items} = await util.postByBeanName("resVehicleInfoTF", "queryVehicleInfoListByCond",{vehicleAttributionFlag:2,count:999});
      this.setData({vehicleList:items})
    },
    // 显示自有车列表
    showList(){
      this.setData({isshowList:true})
    },
    // 隐藏自有车列表
    hideList(){
      this.setData({isshowList:false})
    },
    bindKeyInput: function (e) {
        this.setData({
            licensePlate: e.detail.value
        });
    },

    checkboxChange: function (e) {
        console.log('checkbox发生change事件，携带value值为：', e.detail.value);
        var _self = this;
        _self.setData({
            qryDataSource: e.detail.value
        });

    },
    findCar(e){
        let {plate} = e.currentTarget.dataset;
        this.setData({licensePlate:plate});
        this.hideList();
        this.doQuery();
    },
    doQuery: function () {
        var _self = this;
        wx.showLoading();

        util.postByBeanName("wxcxBizSV", "queryLicensePlate", {
            licensePlate: _self.data.licensePlate,
            qryDataSource: _self.data.qryDataSource
        }, function (data) {
            let showInfo;
            let showDialog;
            let display;
            if (data.exist === 'Y') {
                showInfo = true;
                showDialog = false;
                display = "ALWAYS";
            } else {
                showInfo = false;
                showDialog = true;
                display = "";
            }

            // 坐标转换
            let point = common.bMapTransQQMap(data.longitude,data.latitude)
            // 地图设置
            let markers = [];
            let obj = {};
            obj.longitude = point.longitude;
            obj.latitude = point.latitude;
            obj.width = 48;
            obj.height = 24;
            obj.customCallout = {
              anchorY: 0,
              anchorX: 0,
              display: 'BYCLICK'
            };
            obj.iconPath = "/common/images/car.png";   
            obj.label = {
              content:"车牌号："+data.licensePlate,  
              padding:8,
              bgColor:"#fff",
              borderRadius:100,
              anchorX:-60,
              anchorY:-55,
              borderColor:"#aaa",
              borderWidth:1
            }   
            markers.push(obj);

            _self.setData({
                showDialog: showInfo,
                licensePlate: data.licensePlate,
                isLockName: data.isLockName,
                vehicleType: data.vehicleType,
                vehicleOwnname: data.vehicleOwnname,
                vehicleBill: data.vehicleBill,
                vehiclePlatform: data.vehiclePlatform,
                longitude: point.longitude,
                latitude: point.latitude,
                waybillNum: data.waybillNum,
                orderNum: data.orderNum,
                showInfo: showInfo,
                showDialog: showDialog,
                showList:false,
                markers,
            });
        })
    },

    Calcel: function () {
        this.setData({showDialog: false})
    },
});