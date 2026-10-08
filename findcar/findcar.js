import {util,wxApi,common,regeneratorRuntime} from '../common/commonImport'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        windowheight: '',
        showInfo: false,
        showDialog: false,
        markers: [],
        latitude:23.159645,
        longitude:113.444762,
        licensePlate: '',
        qryDataSource: '[YQY,SINOIOV]',
        items: [
            {name: 'YQY', value: '易迁易平台数据源',checked: 'true'},
            {name: 'SINOIOV', value: '国家部标机数据源', checked: 'true'}
        ]
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

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    bindKeyInput: function (e) {
        this.setData({
            licensePlate: e.detail.value
        });
        return e.detail.value.toUpperCase();
    },

    checkboxChange: function (e) {
        console.log('checkbox发生change事件，携带value值为：', e.detail.value);
        var _self = this;
        _self.setData({
            qryDataSource: e.detail.value
        });

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
                showInfo: showInfo,
                showDialog: showDialog,
                markers,
            });

        })
    },

    Calcel: function () {
        this.setData({showDialog: false})
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});