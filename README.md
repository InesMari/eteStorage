# eteStorage · 亿仓壹原

> 一款面向物流与仓储企业的微信小程序移动办公平台，把"现场操作"和"移动审批"装进手机里。

`eteStorage`（项目代号"亿仓壹原"）是一套基于微信生态的轻量化移动办公解决方案，定位为 **"仓库 + 运力 + 单据 + 合同"的一站式掌上管理工具**。它把原本散落在 PC 端系统中的业务能力，按角色、按场景拆解成 11 个独立业务模块，让仓管员、调度、司机、采购、资产管理员等角色只需打开微信即可完成日常作业与审批协同。

---

## 一、产品定位

- **面向客户**：物流企业、第三方仓储、合同物流、自营仓配的现场作业团队。
- **面向用户角色**：仓管员、库内操作员、调度员、司机、采购员、资产管理员、财务人员、管理者。
- **核心价值**：
  - 现场作业轻量化：扫码出入库、扫码对比、温湿度巡检、消防巡检、考勤打卡、回单上传，全部在手机端闭环。
  - 流程审批移动化：出/入库核验、短驳调度、订单计划、费用申请、合同、资产调拨等流程随时随地审批。
  - 资源一站可视：自有车辆位置、运单成本、维修成本、异常情况在一个 App 中一目了然。
  - 系统高度集成：单点登录即可在一个 App 内完成"仓储 + 运输 + 采购 + 资产 + 单据"的联动。

---

## 二、核心能力一览

| 能力 | 简介 |
| --- | --- |
| 多组织、多仓库 | 支持用户在多个组织/仓库间切换，登录后默认带入工作上下文 |
| 扫码作业 | 一维码/二维码扫描实现出入库、对比、搬运、定位等操作 |
| 移动审批 | 出/入库核验、单据审批、合同审批、资产调拨审批、异常处理 |
| 运单全流程 | 下单、派车、调度、运单分拣、运单详情、订单码、回单管理 |
| 运力可视化 | 自有车辆地图、车辆监控、到期提醒、疲劳驾驶预警、考勤 |
| 业务联动 | 仓储、运输、采购、合同、异常、资产的数据相互打通 |
| 安全保障 | 通信加密（SHA/MD5/RSA）、登录态控制、版本强制更新提示 |

---

## 三、业务模块全景

小程序采用 **微信小程序原生分包加载架构**（`app.json` 中的 `subpackages`），共 11 个子包，每个子包对应一个业务线。

### 1. 仓储管理（`storage`）
仓内日常作业的核心模块，覆盖入出库、包裹、巡检、访客、记录表等场景。

- **出库管理**（`delivery`）：基于运单或拣货单生成出库任务，支持扫码核验。
- **入库管理**（`warehousing`）：到货登记、上架、收货确认。
- **包裹管理**（`packageManager` / `addPackage`）：包裹档案维护、状态跟踪。
- **扫码对比**（`scanCompare`）：扫码自动对比计划与实物，快速定位差异。
- **入库/出库核验**（`verification` / `verificationDetail`）：现场扫码二次核验并提交。
- **搬运作业**（`carryGoods`）：库内搬运任务派发与执行。
- **短驳管理**（`shortBarge`）：短驳任务列表、新增与详情，跟踪调拨过程。
- **盘点任务**（`inspectTasks` / `inspectDetail`）：盘点任务接收与执行。
- **盘点登记**（`inspectRegMain` + 物料异常 / 货品异常）：盘点过程中异常上报、列表与处理。
- **访客登记**（`visitorReg` / `visitorRegManage`）：外来人员进出仓库登记与台账。
- **记录表**（`recordSheet`）：温湿度日志（防潮/防冻）、点检日志、消防栓巡检等日常记录。

### 2. 运输管理（`transport`）
运单与车辆调度的中枢。

- **运输管理**（`transportManage`）：运输任务总览。
- **调度**（`dispatch` / `ldDispatch`）：普通调度与零担调度。
- **运单**（`waybill` / `wayDetail`）：运单列表与详情，运单状态、签收、回单一站查询。
- **运单分拣**（`waySort`）：按目的地区分拣运单。
- **运单管理**（`waybillManage`）：全量运单查询与批量操作。
- **派车**（`dispatchCar` / `ldDispatchCar`）：调度派车，零担派车独立流程。
- **新增订单**（`addOrder`）：业务员现场下单。
- **上传单据**（`uploadBill`）：回单、回执电子化上传。
- **车辆检查**（`vehicleCheckManage` / `vehicleCheckDetail`）：出车前车辆点检。
- **我的车辆**（`ownCar`）：与"自有车管理"联动的司机端入口。
- **订单码**（`wxOrderCode`）：生成订单二维码用于客户/司机扫码。
- **订单计划**（`orderPlanManage` / `orderPlanDetail` / `addOrderPlan`）：周期性或批量订单计划管理。

### 3. 单据管理（`receipts`）
移动端的财务单据入口。

- **付款管理**（`paymentManager` / `paymentDetail`）：付款单据的提交与审批。
- **出款管理**（`cashOutManager` / `cashOutDetail`）：出款单据查询、审批与详情。

### 4. 合同管理（`contract`）
- **合同列表 / 详情**（`contractList` / `contractDetail`）：通用合同检索与详情查看。
- **客户合同列表 / 详情**（`customContractList` / `customContractDetail`）：面向客户维度的合同视图。

### 5. 资产管理（`assets`）
- **采购申请**（`purchaseApplyManage` / `purchaseApplyDetail`）：资产采购提报。
- **领用申请**（`itemClaimApplyManage` / `itemClaimApplyDetail`）：员工领用资产。
- **资产调拨**（`assetsAllocatManage` / `assetsAllocatDetail`）：组织/部门间资产转移。

### 6. 我要找车（`findcar`）
单页式"找车"入口，方便业务方快速搜索可用运力。

### 7. 仓储预约（`storageReserve`）
- **仓储列表**（`storageList`）：可预约的仓库资源。
- **预约**（`appointment`）：填写预约信息。
- **预约详情**（`appointmentDetail`）：查看预约状态与反馈。

### 8. 异常管理（`except`）
- **异常管理**（`exceptManage`）：异常工单列表。
- **异常详情**（`exceptDetail`）：异常描述、图片、影响范围。
- **异常处理**（`exceptHandle`）：处理过程记录与闭环。

### 9. 采购管理（`purchase`）
- **采购管理**（`purchaseManage`）：采购总览。
- **费用申请 / 详情**（`feeApply` / `feeApplyDetail`）：采购相关费用报销。
- **采购详情**（`purchaseDetail`）：单个采购单详情。
- **收货管理**（`takeDeliveryManage` / `takeDeliveryDetail` / `takeDelivery`）：到货签收。
- **领用管理**（`receiveManage` / `receiveDetail` / `receiveApply`）：物料/物资领用。
- **库存管理**（`inventoryManage`）：移动端库存查询。
- **费用库存**（`feeInventory`）：费用化库存台账。

### 10. 运力管理（`information`）
- **车辆管理**（`vehicleManage` / `addVehicle` / `vehicleDetail`）：车辆档案、状态、证件。
- **司机管理**（`driverManage` / `addDriver` / `driverDetail`）：司机档案与证件。
- **车辆监控**（`vehicleMonitor`）：实时车辆状态、位置。

### 11. 自有车管理（`ownVehicle`）
针对自营车队的精细化运营模块。

- **首页**（`home`）：自有车关键指标看板。
- **到期提醒**（`expire`）：车辆证件、保险、保养到期提示。
- **预警**（`warnList` / `offLine` / `fatigueDriving`）：车辆离线、疲劳驾驶等主动预警。
- **车辆地图**（`vehicleMap`）：基于地图的实时车辆位置。
- **考勤**（`attendance`）：司机打卡、出勤统计。
- **回单**（`returnTrip`）：回单电子化管理。
- **运单成本**（`vehicleWaybillCostManage` / `vehicleWaybillCostInfo`）：单车运单级成本分析。
- **维修成本**（`vehicleRepairCostManage` / `vehicleRepairCostInfo`）：维修费用与频次分析。
- **统计**（`ownVehicleStatistics`）：综合数据统计，结合 `ec-canvas` 图表展示。

---

## 四、接口与服务约定

小程序所有后端能力均通过统一网关访问，调用入口位于 `utils/util.js`。**前端不直接耦合具体接口 URL**，而是通过 *Bean 名称 + 方法名* 间接调用，便于后端服务演进与灰度。

### 4.1 网关与运行环境

| 环境 | 触发条件 | 网关地址 |
| --- | --- | --- |
| 开发版 | 微信开发者工具 → 编译模式 = 开发 | `https://wxapp-t.ete56.cn/intf?` |
| 体验版 | 微信后台标记为体验版 | `https://wxapp-t.ete56.cn/intf?` |
| 正式版 | 线上 release | `https://wxapp.1000e56.com/intf?` |

> 网关识别通过 `__wxConfig.envVersion` 自动切换，无需业务代码手动改地址。

### 4.2 主要调用方式

`util.postByBeanName(beanName, methodName, param, successFun, errorFun, postType, showLoading, errorModal)`

- `beanName`：后端服务 Bean 名（字符串）。
- `methodName`：该 Bean 暴露的方法名。
- `param`：请求参数对象，`{}` 表示无参。
- `successFun / errorFun`：可选回调。
- `postType`：请求方式（默认 POST）。
- `showLoading`：是否显示全局 loading（默认 `true`）。
- `errorModal`：是否在失败时自动弹错误提示（默认 `true`）。

辅助调用：

- `util.postByCode(inCode, param, successFun, errorFun, postType)`：通过接口编码（`inCode`）调用，适合面向业务编码已稳定的接口。

### 4.3 安全与签名

- **应用标识**：`WXAPP`。
- **通信加密**：使用 `sha.js` 计算请求摘要、`md5.js` 拼接签名、`jsencrypt.min.js` 处理关键字段的 RSA 加解密。
- **密钥管理**：内置 `intfKey`（见 `utils/util.js`），用于构造签名，**请勿在公网仓库泄露**，建议接入后端下发的动态密钥机制。
- **登录态**：登录信息存于 `wx.getStorageSync('userInfo')`，包含 `orgId / regionId / workId` 等多组织上下文。

### 4.4 通用业务调用示例

```js
import { util, common } from '../../common/commonImport'

// 拉取首页待办数量
const counts = await util.postByBeanName('wxUserTF', 'loadTodoData')

// 切换组织后回传后端
await util.postByBeanName('wxUserTF', 'selOrg', { orgId, regionId })

// 切换工作（仓库）
util.postByBeanName('wmsBaseTF', 'selWork', { workId })
```

### 4.5 接口约定建议（新增业务时）

1. **优先使用 Bean + MethodName 形式**，避免直接拼接 `inCode` 路径。
2. **统一在 `param` 中传递业务主键**（如 `orgId / workId / userId`），由后端在网关层注入。
3. **页面层只关心业务结果**，分页、loading、错误提示由 `util` 统一处理。
4. **新增模块前先在 `app.json` 中注册子包**（`subpackages` 数组），避免主包体积膨胀触发性能与审核问题。

---

## 五、项目结构

```
eteStorage/
├─ app.js / app.json / app.wxss   # 小程序入口与全局配置
├─ pages/                         # 主包页面（启动、登录、首页、协议、问卷等）
├─ common/                        # 公共资源
│  ├─ commonImport.js             # 统一导出 util / common / wxApi / regeneratorRuntime
│  ├─ components/                 # 自定义组件
│  ├─ wxApi/                      # 微信 API 二次封装
│  ├─ wxs/                        # 页面级脚本片段
│  ├─ css/                        # 全局样式
│  └─ images/                     # 公共图片资源
├─ utils/                         # 工具方法（util、common、runtime、加密等）
├─ miniprogram_npm/               # 通过 npm 构建的依赖（如 @vant/weapp）
├─ libs/                          # 其他第三方库
├─ icons/                         # 图标资源
├─ storage/                       # 仓储管理子包
├─ transport/                     # 运输管理子包
├─ receipts/                      # 单据管理子包
├─ contract/                      # 合同管理子包
├─ assets/                        # 资产管理子包
├─ findcar/                       # 我要找车子包
├─ storageReserve/                # 仓储预约子包
├─ except/                        # 异常管理子包
├─ purchase/                      # 采购管理子包
├─ information/                   # 运力管理子包
├─ ownVehicle/                    # 自有车管理子包
├─ ownCar/                        # 司机端"我的车辆"子模块（与运输/自有车联动）
├─ project.config.json            # 微信开发者工具项目配置
├─ sitemap.json                   # 站内搜索配置
├─ jsconfig.json                  # JavaScript 智能提示配置
├─ package.json                   # 依赖与脚本
└─ package-lock.json
```

每个业务子包内部结构基本一致：

```
<子包名>/
├─ home/                # 子包首页（一般是功能入口聚合页）
├─ <业务1>/ <业务2>/ …  # 各业务页面（每个页面含 .js / .json / .wxml / .wxss 四件套）
```

---

## 六、技术栈

| 类别 | 选型 |
| --- | --- |
| 运行平台 | 微信小程序（基础库 3.8.2 及以上） |
| 开发语言 | 原生 JavaScript（ES6+） |
| UI 组件库 | [`@vant/weapp`](https://youzan.github.io/vant-weapp/) 1.0 |
| 加密 | `sha.js` / `md5.js` / `jsencrypt.min.js` |
| 包管理 | npm（构建产物位于 `miniprogram_npm/`） |
| 接口调用 | 自研 `util.postByBeanName` / `util.postByCode` 网关封装 |
| 图表 | `ec-canvas`（自有车管理模块） |
| 工具链 | 微信开发者工具 + PostCSS + Babel/SWC |

---

## 七、版本与更新说明

- **当前版本**：`1.0.0`（`package.json`）。
- **AppID**：`wxf53f202ae55762e6`（`project.config.json`）。
- **版本管理**：
  - 小程序自身使用微信 `getUpdateManager` 检测新版本并提示用户重启。
  - 业务功能迭代以子包为单位独立发版，子包内页面按需预加载。
- **兼容性**：建议在 **微信 8.0+** 客户端运行以获得完整能力。

> 历史版本记录建议在 `CHANGELOG.md` 中维护（与 README 分开），本文件不展开。

---

## 八、常见问题（FAQ）

**Q1：登录后默认进入哪个模块？**
A：登录成功后会回到 `pages/index/index`，用户在首页根据权限选择业务模块入口；常见用户会被默认引导至"仓储管理"或"运输管理"。

**Q2：为什么首页看不到"仓储管理"入口？**
A：当前登录账号在所选组织下未配置工作（仓库）权限，页面会弹出"您的账号暂时未开通仓储管理权限"提示，请联系系统管理员。

**Q3：如何切换组织/仓库？**
A：仓储管理首页支持切换仓库，首页支持切换组织；切换后系统会调用 `selOrg` / `selWork` 接口回写后端，并刷新本地 `userInfo`。

**Q4：扫码、出/入库等模块需要哪些权限？**
A：相机（扫码）、定位（`getLocation`，已在 `requiredPrivateInfos` 中声明）、网络访问等。请在微信中允许对应权限。

**Q5：自有车管理与运输管理中的"车辆"是同一份数据吗？**
A：底层数据互通，但展示视角不同。`transport` 主要面向运单/调度，`ownVehicle` 面向自营车队的成本、维保、考勤等深度运营。

**Q6：后端接口会变吗？**
A：通过 `util.postByBeanName(beanName, methodName, ...)` 调用的接口由后端服务在网关层暴露，Bean 与方法名变更时需要在变更日志中同步说明，便于前端联调。

**Q7：为什么新页面要放在子包里？**
A：分包加载可减少主包体积、加快首屏启动；超过 16 个页面的业务线建议独立成子包。子包在 `app.json` 的 `subpackages` 中注册。

**Q8：如何处理登录态过期？**
A：登录信息（`userInfo`）存储在 `wx.storage` 中；当后端返回登录态失效时，可清空 `userInfo` 并跳转至 `pages/guideIndex/guideIndex` 重新登录。

---

## 九、贡献与迭代指南

1. **业务扩展**：在对应子包下新增页面，并补充 `app.json.subpackages` 中的注册信息。
2. **公共能力**：把可复用 UI 放进 `common/components/`，把可复用的微信 API 二次封装放进 `common/wxApi/`，把通用工具放进 `utils/`。
3. **接口扩展**：与后端约定新的 `beanName` / `methodName`，尽量复用 `util.postByBeanName` 入口；如需新的加解密策略，先在 `utils/util.js` 中抽象，再在页面中调用。
4. **样式规范**：使用 Vant Weapp 主题色（`#1989fa`）作为主色，保持与 PC 端一致；新增样式请复用 `common/css/` 的原子化样式。
5. **代码风格**：2 空格缩进（`editorSetting.tabSize`）；ES6+；优先使用 `async/await` 处理异步。
6. **测试与体验**：开发版联调时建议扫码预览（体验版），覆盖核心流程：登录 → 组织切换 → 仓储或运输作业 → 提交单据/审批 → 退出。
7. **发布前自检**：
   - `project.config.json` 中 `appid` 与发布小程序一致；
   - `requiredPrivateInfos` 包含所有用到的隐私接口；
   - 关闭 `urlCheck`、开启 ES6 编译、检查 `sitemap.json`；
   - 确认 11 个子包页面路径无残留。

---

## 十、版权与联系

- **项目名称**：eteStorage（亿仓壹原）
- **归属**：仅用于内部协作与对外介绍，请勿在未授权情况下用于商业分发。
- **问题反馈**：通过公司内部协作平台（项目群 / 需求管理工具）提交。
- **维护团队**：本 README 由项目组共同维护，更新时请同步至 `CHANGELOG.md`。

---

> 文档版本：v1.0 · 最近更新：2026-10-08
