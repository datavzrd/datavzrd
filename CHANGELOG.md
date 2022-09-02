# Changelog

## [2.0.0](https://www.github.com/koesterlab/datavzrd/compare/v1.19.0...v2.0.0) (2022-09-02)


### ⚠ BREAKING CHANGES

* Add heatmap option for additional headers (#174)

### Features

* Add heatmap option for additional headers ([#174](https://www.github.com/koesterlab/datavzrd/issues/174)) ([6f91cd8](https://www.github.com/koesterlab/datavzrd/commit/6f91cd8e8b899228d170dfffb5af3567acc76acc))

## [1.19.0](https://www.github.com/koesterlab/datavzrd/compare/v1.18.1...v1.19.0) (2022-08-24)


### Features

* Add PDF generation for current view ([#171](https://www.github.com/koesterlab/datavzrd/issues/171)) ([4f2a4c4](https://www.github.com/koesterlab/datavzrd/commit/4f2a4c45a48824b39aacdf462d351ab6107009b4))
* Allow rendering custom content into any heatmap cell ([#172](https://www.github.com/koesterlab/datavzrd/issues/172)) ([8c5ba92](https://www.github.com/koesterlab/datavzrd/commit/8c5ba92453f8fc29a71921fc0b1386e9d017e0d7))

### [1.18.1](https://www.github.com/koesterlab/datavzrd/compare/v1.18.0...v1.18.1) (2022-08-16)


### Bug Fixes

* Show empty values in separate category in histograms ([#166](https://www.github.com/koesterlab/datavzrd/issues/166)) ([6780625](https://www.github.com/koesterlab/datavzrd/commit/67806254f0c47bba556feac79e5f1a25e70f58ea))

## [1.18.0](https://www.github.com/koesterlab/datavzrd/compare/v1.17.1...v1.18.0) (2022-08-15)


### Features

* Add new render-html keyword and allow integration of aux-libraries ([#163](https://www.github.com/koesterlab/datavzrd/issues/163)) ([9e8dc4e](https://www.github.com/koesterlab/datavzrd/commit/9e8dc4ec808e639750bd1d043c680c47163eabeb))


### Bug Fixes

* Fix test case for html config deserialization ([7512fd4](https://www.github.com/koesterlab/datavzrd/commit/7512fd4f1e9334224c66832b9bd15b8b170fc400))
* Fix usage of page-size for single page views ([#162](https://www.github.com/koesterlab/datavzrd/issues/162)) ([648bcd3](https://www.github.com/koesterlab/datavzrd/commit/648bcd346d19ace7a8210fb6bea7e3512a102266))

### [1.17.1](https://www.github.com/koesterlab/datavzrd/compare/v1.17.0...v1.17.1) (2022-08-04)


### Bug Fixes

* Remove detail view when columns are hidden ([#158](https://www.github.com/koesterlab/datavzrd/issues/158)) ([ea06cae](https://www.github.com/koesterlab/datavzrd/commit/ea06caee1296b0b4b46b3c02d5fc0284afc5429b))

## [1.17.0](https://www.github.com/koesterlab/datavzrd/compare/v1.16.2...v1.17.0) (2022-06-27)


### Features

* Show tick plots and heatmaps in display-mode: detail ([#150](https://www.github.com/koesterlab/datavzrd/issues/150)) ([b7c1dd1](https://www.github.com/koesterlab/datavzrd/commit/b7c1dd140cbfeaa72d70853f3b80c8685b7a747b))
* Support multiple datasets for render-plot views ([#156](https://www.github.com/koesterlab/datavzrd/issues/156)) ([1e66ff5](https://www.github.com/koesterlab/datavzrd/commit/1e66ff5b6cb47a5fdfb5a39e22e17cc4cbd11454))


### Bug Fixes

* Fix custom plots in detail mode ([#154](https://www.github.com/koesterlab/datavzrd/issues/154)) ([776fc25](https://www.github.com/koesterlab/datavzrd/commit/776fc25e21c65d9ef9b3f356c9b6f6f365a2e48c))

### [1.16.2](https://www.github.com/koesterlab/datavzrd/compare/v1.16.1...v1.16.2) (2022-05-24)


### Bug Fixes

* Fix clear-filter button ([ab3e206](https://www.github.com/koesterlab/datavzrd/commit/ab3e206f749554ddaed586dc200859807080d712))
* Fix cut off dropdown linkouts ([5d785cd](https://www.github.com/koesterlab/datavzrd/commit/5d785cdeeb307aa94f0f632226661d9795399590))

### [1.16.1](https://www.github.com/koesterlab/datavzrd/compare/v1.16.0...v1.16.1) (2022-05-23)


### Bug Fixes

* Fix column highlighting for firefox ([#145](https://www.github.com/koesterlab/datavzrd/issues/145)) ([dfdfb58](https://www.github.com/koesterlab/datavzrd/commit/dfdfb589901c3935c3176e6880f3b368abeab6c2))

## [1.16.0](https://www.github.com/koesterlab/datavzrd/compare/v1.15.0...v1.16.0) (2022-05-23)


### Features

* Allow aux-domain-columns for non-numeric column heatmaps ([#141](https://www.github.com/koesterlab/datavzrd/issues/141)) ([a4f0c74](https://www.github.com/koesterlab/datavzrd/commit/a4f0c745aa5382cb63a8e8bfd72d64ea7cb32128))
* Always display empty heatmap values in white ([5863fe0](https://www.github.com/koesterlab/datavzrd/commit/5863fe0861e749ec648f3433b6fd687ef8cb1a34))
* Improve view navigation ([#135](https://www.github.com/koesterlab/datavzrd/issues/135)) ([2d54e8f](https://www.github.com/koesterlab/datavzrd/commit/2d54e8f618ec8f30ce711e2a44983c36a49ad829))

## [1.15.0](https://www.github.com/koesterlab/datavzrd/compare/v1.14.4...v1.15.0) (2022-05-19)


### Features

* Add new display-mode: hidden ([#140](https://www.github.com/koesterlab/datavzrd/issues/140)) ([67e895d](https://www.github.com/koesterlab/datavzrd/commit/67e895d36ee2fb3613dae0a31b34417c7f696a53))
* Improve brush-filters ([#134](https://www.github.com/koesterlab/datavzrd/issues/134)) ([b577fe1](https://www.github.com/koesterlab/datavzrd/commit/b577fe1c66a47c1c738ce4f2c295db05846ac4b2))
* Improve detail formatter ([#137](https://www.github.com/koesterlab/datavzrd/issues/137)) ([4a30886](https://www.github.com/koesterlab/datavzrd/commit/4a308866390c76decf1986fc62a404e94435dfb3))

### [1.14.4](https://www.github.com/koesterlab/datavzrd/compare/v1.14.3...v1.14.4) (2022-05-18)


### Bug Fixes

* Prevent panic in case of render-table definitions for non-existent columns ([#128](https://www.github.com/koesterlab/datavzrd/issues/128)) ([4f40d41](https://www.github.com/koesterlab/datavzrd/commit/4f40d413fb031d413efd5b9845baeed3db5aa6e1))

### [1.14.3](https://www.github.com/koesterlab/datavzrd/compare/v1.14.2...v1.14.3) (2022-05-18)


### Bug Fixes

* Modify table header height to new brush filters ([25a98f4](https://www.github.com/koesterlab/datavzrd/commit/25a98f47be036451e337ac79dd9c8981dce3b52b))

### [1.14.2](https://www.github.com/koesterlab/datavzrd/compare/v1.14.1...v1.14.2) (2022-05-16)


### Bug Fixes

* Include aux domains in filter brush domain ([#126](https://www.github.com/koesterlab/datavzrd/issues/126)) ([4157457](https://www.github.com/koesterlab/datavzrd/commit/4157457143a593a224761320c01058a76797d280))
* Include heatmap domains for filter brushes ([#124](https://www.github.com/koesterlab/datavzrd/issues/124)) ([2503b30](https://www.github.com/koesterlab/datavzrd/commit/2503b30855dbef6cf9244d3687bcd3f8b5c2e5e4))

### [1.14.1](https://www.github.com/koesterlab/datavzrd/compare/v1.14.0...v1.14.1) (2022-05-11)


### Bug Fixes

* Fix clear filter button ([91d3ab2](https://www.github.com/koesterlab/datavzrd/commit/91d3ab2607dbd4dab9fb1f02080b3fc355b6fcda))

## [1.14.0](https://www.github.com/koesterlab/datavzrd/compare/v1.13.3...v1.14.0) (2022-05-11)


### Features

* Add clear filter button ([4c1d977](https://www.github.com/koesterlab/datavzrd/commit/4c1d9772e38ee706d6f1f4dc3caac81cbf5fd2ca))


### Bug Fixes

* Align headers and filter brushes ([45ecb72](https://www.github.com/koesterlab/datavzrd/commit/45ecb722b7eb53303340286a45057020e61ac575))
* Use derive for default implementation of AuxDomainColumns ([#120](https://www.github.com/koesterlab/datavzrd/issues/120)) ([3c546e0](https://www.github.com/koesterlab/datavzrd/commit/3c546e0a54e932aacf8f323c84b6ae3848fd8730))
* Use integers for filter brushes if possible ([24fe4b5](https://www.github.com/koesterlab/datavzrd/commit/24fe4b529fc38ad4321c9c0b9436a819ec94ea1c))
* Use tick domain for filter brush if present ([#119](https://www.github.com/koesterlab/datavzrd/issues/119)) ([b4c743e](https://www.github.com/koesterlab/datavzrd/commit/b4c743e37115c6ece694b7b1e475b69ebb41a26c))

### [1.13.3](https://www.github.com/koesterlab/datavzrd/compare/v1.13.2...v1.13.3) (2022-05-11)


### Bug Fixes

* Limit maximum characters in axis labels for brush filters ([#117](https://www.github.com/koesterlab/datavzrd/issues/117)) ([504fc75](https://www.github.com/koesterlab/datavzrd/commit/504fc75ea992404f64ee286818dca6993684ca7b))

### [1.13.2](https://www.github.com/koesterlab/datavzrd/compare/v1.13.1...v1.13.2) (2022-05-10)


### Bug Fixes

* Fix brush filter for columns including whitespaces ([#115](https://www.github.com/koesterlab/datavzrd/issues/115)) ([3cb2d23](https://www.github.com/koesterlab/datavzrd/commit/3cb2d23bed58b3cff21b088ffb4b092bfcbd4f97))

### [1.13.1](https://www.github.com/koesterlab/datavzrd/compare/v1.13.0...v1.13.1) (2022-05-10)


### Bug Fixes

* Remove debug statement ([9e3790b](https://www.github.com/koesterlab/datavzrd/commit/9e3790ba9f509c71f6e752097b66919d8f47126f))
* Show error messages from config validation properly ([#113](https://www.github.com/koesterlab/datavzrd/issues/113)) ([11ca681](https://www.github.com/koesterlab/datavzrd/commit/11ca681d33621c76eafc675d933d6729e91a69d5))

## [1.13.0](https://www.github.com/koesterlab/datavzrd/compare/v1.12.0...v1.13.0) (2022-05-09)


### Features

* Allow usage of regexes for aux-domain-columns ([#111](https://www.github.com/koesterlab/datavzrd/issues/111)) ([dc54c85](https://www.github.com/koesterlab/datavzrd/commit/dc54c850fadd09f25295be504b83852b7e74b173))
* Validate given default-view ([#110](https://www.github.com/koesterlab/datavzrd/issues/110)) ([fc52714](https://www.github.com/koesterlab/datavzrd/commit/fc5271402d887b3b66635ccb8c0fe7d33fbb491c))

## [1.12.0](https://www.github.com/koesterlab/datavzrd/compare/v1.11.1...v1.12.0) (2022-05-09)


### Features

* New keyword aux-domain-columns ([#108](https://www.github.com/koesterlab/datavzrd/issues/108)) ([086f91b](https://www.github.com/koesterlab/datavzrd/commit/086f91b54b454c9899c7e113a23ba4fa1b6e5ef4))

### [1.11.1](https://www.github.com/koesterlab/datavzrd/compare/v1.11.0...v1.11.1) (2022-05-05)


### Bug Fixes

* Remove linkouts from table if non-existent ([#106](https://www.github.com/koesterlab/datavzrd/issues/106)) ([9430a78](https://www.github.com/koesterlab/datavzrd/commit/9430a786e7114bda0f997fca8ede42896dee0eaa))

## [1.11.0](https://www.github.com/koesterlab/datavzrd/compare/v1.10.3...v1.11.0) (2022-05-05)


### Features

* Add brush filter for numeric columns ([#103](https://www.github.com/koesterlab/datavzrd/issues/103)) ([6f97429](https://www.github.com/koesterlab/datavzrd/commit/6f9742961cc9123e5ee26ab32d85cee02055f24a))

### [1.10.3](https://www.github.com/koesterlab/datavzrd/compare/v1.10.2...v1.10.3) (2022-04-29)


### Bug Fixes

* Activate popovers after page change ([6319230](https://www.github.com/koesterlab/datavzrd/commit/6319230655b8462e897bb0226724868fbfa3cf6c))

### [1.10.2](https://www.github.com/koesterlab/datavzrd/compare/v1.10.1...v1.10.2) (2022-04-29)


### Bug Fixes

* Fix breaking interaction between formatting urls and filtering data ([02e3e5e](https://www.github.com/koesterlab/datavzrd/commit/02e3e5eb628c3e199a79ea5d2f64b12ef3f1fe1d))

### [1.10.1](https://www.github.com/koesterlab/datavzrd/compare/v1.10.0...v1.10.1) (2022-04-29)


### Bug Fixes

* Fix wrong url linking arguments for single page views ([4f14492](https://www.github.com/koesterlab/datavzrd/commit/4f144926c780ca417e875f55fc6bf0ad89b5446b))

## [1.10.0](https://www.github.com/koesterlab/datavzrd/compare/v1.9.0...v1.10.0) (2022-04-29)


### Features

* Allow missing values in other tables with keyword optional ([#98](https://www.github.com/koesterlab/datavzrd/issues/98)) ([b0c7920](https://www.github.com/koesterlab/datavzrd/commit/b0c79200dff3eeff92bd60c6b2f1b2becc971d39))
* Single page views for small tables ([#95](https://www.github.com/koesterlab/datavzrd/issues/95)) ([ecd7019](https://www.github.com/koesterlab/datavzrd/commit/ecd70198380e0b837632332fb75667b395f76f6c))

## [1.9.0](https://www.github.com/koesterlab/datavzrd/compare/v1.8.0...v1.9.0) (2022-04-13)


### Features

* Allow combining ellipsis with heatmap ([#93](https://www.github.com/koesterlab/datavzrd/issues/93)) ([6a7d8a1](https://www.github.com/koesterlab/datavzrd/commit/6a7d8a1f2ecdcbd27bd4a7f3959a611d445c0142))

## [1.8.0](https://www.github.com/koesterlab/datavzrd/compare/v1.7.0...v1.8.0) (2022-04-06)


### Features

* Remove pin-columns keyword ([#91](https://www.github.com/koesterlab/datavzrd/issues/91)) ([55aa0f5](https://www.github.com/koesterlab/datavzrd/commit/55aa0f5a0e860874c9281b13f8417da255777e4e))


### Bug Fixes

* fixed linkout button rendering bug ([933dd34](https://www.github.com/koesterlab/datavzrd/commit/933dd34fc2572ade9536b327a121de8b2063be0e))
* tune link button visuals ([becea59](https://www.github.com/koesterlab/datavzrd/commit/becea59de5f915de570daff68aaf47f3212610fc))

## [1.7.0](https://www.github.com/koesterlab/datavzrd/compare/v1.6.0...v1.7.0) (2022-04-06)


### Features

* Style table ([#88](https://www.github.com/koesterlab/datavzrd/issues/88)) ([bffa4a3](https://www.github.com/koesterlab/datavzrd/commit/bffa4a36b4387fa023d00f4d4b952dfc6d5f8f8d))
* Validate linkouts ([#87](https://www.github.com/koesterlab/datavzrd/issues/87)) ([63a8494](https://www.github.com/koesterlab/datavzrd/commit/63a84945a84a724e3d8bd6cb46a52873c78cffb2))

## [1.6.0](https://www.github.com/koesterlab/datavzrd/compare/v1.5.0...v1.6.0) (2022-04-06)


### Features

* Add config validation ([#80](https://www.github.com/koesterlab/datavzrd/issues/80)) ([fd094a3](https://www.github.com/koesterlab/datavzrd/commit/fd094a366d31f55327de6a5a7d8e7cc4c020c5d3))
* Add new keyword hidden ([#83](https://www.github.com/koesterlab/datavzrd/issues/83)) ([1e93444](https://www.github.com/koesterlab/datavzrd/commit/1e934442fb8de432e742d6b8bd5185b4daaab3c5))
* Resize linkout buttons ([#85](https://www.github.com/koesterlab/datavzrd/issues/85)) ([db89115](https://www.github.com/koesterlab/datavzrd/commit/db89115597d94299f5048f6d68a8c05bd06dc637))
* Resize tick plots ([#84](https://www.github.com/koesterlab/datavzrd/issues/84)) ([700c0b7](https://www.github.com/koesterlab/datavzrd/commit/700c0b7b5fb0c3985fa0ba781850fe271044d89c))
* Validate plot scale types ([#86](https://www.github.com/koesterlab/datavzrd/issues/86)) ([4d79364](https://www.github.com/koesterlab/datavzrd/commit/4d79364b186080af6d8c4de30532a1055ff2ce03))

## [1.5.0](https://www.github.com/koesterlab/datavzrd/compare/v1.4.1...v1.5.0) (2022-04-04)


### Features

* Add ellipsis keyword ([#78](https://www.github.com/koesterlab/datavzrd/issues/78)) ([1b5757e](https://www.github.com/koesterlab/datavzrd/commit/1b5757ec9726608b08c4496084136a3d482da258))

### [1.4.1](https://www.github.com/koesterlab/datavzrd/compare/v1.4.0...v1.4.1) (2022-03-29)


### Bug Fixes

* Do not show empty tick plots ([#76](https://www.github.com/koesterlab/datavzrd/issues/76)) ([85d2721](https://www.github.com/koesterlab/datavzrd/commit/85d27219986741575f02b01ad8f998977a4455a2))

## [1.4.0](https://www.github.com/koesterlab/datavzrd/compare/v1.3.1...v1.4.0) (2022-03-29)


### Features

* Add default-view keyword ([#73](https://www.github.com/koesterlab/datavzrd/issues/73)) ([8ae2bc6](https://www.github.com/koesterlab/datavzrd/commit/8ae2bc6dc1fbc9aab372a69256ae6e80a4dce8b9))
* Remove hovering from table ([#75](https://www.github.com/koesterlab/datavzrd/issues/75)) ([224cfd0](https://www.github.com/koesterlab/datavzrd/commit/224cfd067ee3f1844069798ed2e3fc099c883a0d))

### [1.3.1](https://www.github.com/koesterlab/datavzrd/compare/v1.3.0...v1.3.1) (2022-03-26)


### Bug Fixes

* Missing columns when in detail mode for link-url ([#71](https://www.github.com/koesterlab/datavzrd/issues/71)) ([24223c5](https://www.github.com/koesterlab/datavzrd/commit/24223c553a5346b2caa7ab84c04662478e1e9df8))
* Show custom plots in detail view ([#70](https://www.github.com/koesterlab/datavzrd/issues/70)) ([e8c5075](https://www.github.com/koesterlab/datavzrd/commit/e8c50750c0aae6160a31fdc59a0a5e65d286588a))

## [1.3.0](https://www.github.com/koesterlab/datavzrd/compare/v1.2.2...v1.3.0) (2022-03-25)


### Features

* support for regular expressions to match column names ([#65](https://www.github.com/koesterlab/datavzrd/issues/65)) ([542fe4a](https://www.github.com/koesterlab/datavzrd/commit/542fe4a7dcf48a33496abf970eda72d11641febe))


### Bug Fixes

* Adjust header height to content ([8f7f5ba](https://www.github.com/koesterlab/datavzrd/commit/8f7f5ba20678e9183959defe891f6249af80e5c6))
* Highlight rows with border so it doesn't interfere with heatmaps ([#67](https://www.github.com/koesterlab/datavzrd/issues/67)) ([29e310c](https://www.github.com/koesterlab/datavzrd/commit/29e310ca3ae250ab628aea30313637beb9bd8fa4))
* Improve error message for missing columns without optional: true ([#63](https://www.github.com/koesterlab/datavzrd/issues/63)) ([3517b3e](https://www.github.com/koesterlab/datavzrd/commit/3517b3e3fde18f4418c8d3ab3ad5c3ef8bd92a1a))
* No linebreaks in numeric cells ([#62](https://www.github.com/koesterlab/datavzrd/issues/62)) ([3d59973](https://www.github.com/koesterlab/datavzrd/commit/3d59973f049f23c28353da05fa98ee0c67b072c9))
* Remove ellipsis from datavzrd ([#64](https://www.github.com/koesterlab/datavzrd/issues/64)) ([89916d1](https://www.github.com/koesterlab/datavzrd/commit/89916d128301b47bcc3fecbab47ce48c384c1329))

### [1.2.2](https://www.github.com/koesterlab/datavzrd/compare/v1.2.1...v1.2.2) (2022-03-23)


### Bug Fixes

* Adjust header height to content ([#59](https://www.github.com/koesterlab/datavzrd/issues/59)) ([d5307c1](https://www.github.com/koesterlab/datavzrd/commit/d5307c17d988cbc4839c0aefff0bf538f75612f4))

### [1.2.1](https://www.github.com/koesterlab/datavzrd/compare/v1.2.0...v1.2.1) (2022-03-22)


### Bug Fixes

* Do not require empty data for plots ([#56](https://www.github.com/koesterlab/datavzrd/issues/56)) ([e420a8a](https://www.github.com/koesterlab/datavzrd/commit/e420a8a96dd35a463064ce9067e575f665deb727))
* Fix empty files with linkouts ([#54](https://www.github.com/koesterlab/datavzrd/issues/54)) ([63b527a](https://www.github.com/koesterlab/datavzrd/commit/63b527ad4b6fed84293c028d9c77cf85f8e87580))
* Fix example config ([#55](https://www.github.com/koesterlab/datavzrd/issues/55)) ([2da1706](https://www.github.com/koesterlab/datavzrd/commit/2da1706738864b386fe07ffe93f0d024d8679d45))

## [1.2.0](https://www.github.com/koesterlab/datavzrd/compare/v1.1.0...v1.2.0) (2022-03-22)


### Features

* New keyword display-mode ([#51](https://www.github.com/koesterlab/datavzrd/issues/51)) ([cabba0e](https://www.github.com/koesterlab/datavzrd/commit/cabba0e1ff68e9b9cdef92b6ad85d73824fa90a6))


### Performance Improvements

* Render plots via javascript ([#53](https://www.github.com/koesterlab/datavzrd/issues/53)) ([e87fe98](https://www.github.com/koesterlab/datavzrd/commit/e87fe9829b7bd8342f9006e9e9bdc19d0d03df8d))

## [1.1.0](https://www.github.com/koesterlab/datavzrd/compare/v1.0.2...v1.1.0) (2022-03-16)


### ⚠ BREAKING CHANGES

* Refactor item to view (#46)

### Features

* Add domain keyword for ticks and heatmap ([#41](https://www.github.com/koesterlab/datavzrd/issues/41)) ([843b7b5](https://www.github.com/koesterlab/datavzrd/commit/843b7b5b7b43c625341d826688c51856372438fa))
* Add optional keyword for render-table ([#43](https://www.github.com/koesterlab/datavzrd/issues/43)) ([6d245d1](https://www.github.com/koesterlab/datavzrd/commit/6d245d1436423f7e877e62d3140084cbe3906835))
* Make entire row available to link-to-url ([#44](https://www.github.com/koesterlab/datavzrd/issues/44)) ([2f1e87f](https://www.github.com/koesterlab/datavzrd/commit/2f1e87fcac736c5ee9af0af38947473497adc632))
* New keyword spec-path ([#48](https://www.github.com/koesterlab/datavzrd/issues/48)) ([726868d](https://www.github.com/koesterlab/datavzrd/commit/726868df47fc279f07bc4b0bd2b6cdec532b95ce))


### Bug Fixes

* Fix broken plots for headers with whitespaces ([#40](https://www.github.com/koesterlab/datavzrd/issues/40)) ([7bb9b59](https://www.github.com/koesterlab/datavzrd/commit/7bb9b596e49a671071bb2460d80bd3815c049585))


### Code Refactoring

* Refactor item to view ([#46](https://www.github.com/koesterlab/datavzrd/issues/46)) ([1d86341](https://www.github.com/koesterlab/datavzrd/commit/1d86341f0564e5350b05cfd9f30c6eff70524aed))


### Miscellaneous Chores

* release 1.1.0 ([9c111f3](https://www.github.com/koesterlab/datavzrd/commit/9c111f369da24073c47466020e38e18f5bda8b83))

### [1.0.2](https://www.github.com/koesterlab/datavzrd/compare/v1.0.1...v1.0.2) (2022-03-10)


### Bug Fixes

* Fix custom plots ([075688a](https://www.github.com/koesterlab/datavzrd/commit/075688a4db07a929fc88928e422be2d34e8b33bc))

### [1.0.1](https://www.github.com/koesterlab/datavzrd/compare/v1.0.0...v1.0.1) (2022-03-09)


### Bug Fixes

* Fix example config ([d280358](https://www.github.com/koesterlab/datavzrd/commit/d280358dc94d0048a2f5ea216007da9695d99bad))
* No error for empty csv files ([#37](https://www.github.com/koesterlab/datavzrd/issues/37)) ([ce6ea18](https://www.github.com/koesterlab/datavzrd/commit/ce6ea187a6be70634c20ffb3a9d27761153b2054))
* use smaller font sizes and less padding ([#34](https://www.github.com/koesterlab/datavzrd/issues/34)) ([7f17009](https://www.github.com/koesterlab/datavzrd/commit/7f170099f3a50b230e21d44d991ecc341559acf7))

## [1.0.0](https://www.github.com/koesterlab/datavzrd/compare/v0.3.0...v1.0.0) (2022-02-21)


### ⚠ BREAKING CHANGES

* Rename schema to spec and scheme to color-scheme (#31)

### Code Refactoring

* Rename schema to spec and scheme to color-scheme ([#31](https://www.github.com/koesterlab/datavzrd/issues/31)) ([b9fca5f](https://www.github.com/koesterlab/datavzrd/commit/b9fca5f2cb6b145b55527bef2eed95c1359ef467))

## [0.3.0](https://www.github.com/koesterlab/datavzrd/compare/v0.2.0...v0.3.0) (2022-02-18)


### Features

* Allow user to use width: container in vega-lite specs ([#30](https://www.github.com/koesterlab/datavzrd/issues/30)) ([c65693b](https://www.github.com/koesterlab/datavzrd/commit/c65693b12c51dcb9d63466172776d2348c4ecabd))
* Create output directory if it does not exist ([#27](https://www.github.com/koesterlab/datavzrd/issues/27)) ([08eafbe](https://www.github.com/koesterlab/datavzrd/commit/08eafbe671c78ee7b88413194b2f8e2982b696d9))


### Bug Fixes

* Minor cosmetic changes ([#29](https://www.github.com/koesterlab/datavzrd/issues/29)) ([e813018](https://www.github.com/koesterlab/datavzrd/commit/e813018a09cc45375109ce78f1fbe6b54879c435))

## [0.2.0](https://www.github.com/koesterlab/datavzrd/compare/v0.1.2...v0.2.0) (2022-02-16)


### Features

* Add example report ([#21](https://www.github.com/koesterlab/datavzrd/issues/21)) ([4e266a0](https://www.github.com/koesterlab/datavzrd/commit/4e266a09f3bfa0250604ca67e8531022a8ac8ced))
* Show proper error message for non existing output directory ([#26](https://www.github.com/koesterlab/datavzrd/issues/26)) ([008524f](https://www.github.com/koesterlab/datavzrd/commit/008524f2748fe37cece68fe65700e2deda13bcb2))
* Show proper error message for wrong file paths ([#25](https://www.github.com/koesterlab/datavzrd/issues/25)) ([c0e7539](https://www.github.com/koesterlab/datavzrd/commit/c0e75396cfa08e9c9745b79acdaf5a618632d318))


### Bug Fixes

* Complete error message for wrong config file path ([#24](https://www.github.com/koesterlab/datavzrd/issues/24)) ([b0dc4aa](https://www.github.com/koesterlab/datavzrd/commit/b0dc4aa8b568a555a70e2b48e9bf57da4c1149c8))

### [0.1.2](https://www.github.com/koesterlab/datavzrd/compare/v0.1.1...v0.1.2) (2022-02-15)


### Bug Fixes

* add missing license ([a0a3473](https://www.github.com/koesterlab/datavzrd/commit/a0a34735ca044033f42b72b7cbe975ea9e1357e9))
* Display correct column on missing value ([#19](https://www.github.com/koesterlab/datavzrd/issues/19)) ([bacbe5b](https://www.github.com/koesterlab/datavzrd/commit/bacbe5b8819b54990a4243fe3b24342ee581f870))

### [0.1.1](https://www.github.com/koesterlab/datavzrd/compare/v0.1.0...v0.1.1) (2022-02-15)


### Bug Fixes

* updated release process ([e8463f7](https://www.github.com/koesterlab/datavzrd/commit/e8463f7db8d946898a36f5d7001984515322ad1c))

## 0.1.0 (2022-02-15)


### Features

* Add heatmap keyword ([#12](https://www.github.com/koesterlab/datavzrd/issues/12)) ([d8e3582](https://www.github.com/koesterlab/datavzrd/commit/d8e35822b4d63a78b81a5e1e8344d0259006fcf6))
* add infrastructure for column index and row address ([#1](https://www.github.com/koesterlab/datavzrd/issues/1)) ([7df380c](https://www.github.com/koesterlab/datavzrd/commit/7df380c11f07bf48b199de5c67448ae053435d54))
* Add optional description for tables ([#8](https://www.github.com/koesterlab/datavzrd/issues/8)) ([3a6dcf6](https://www.github.com/koesterlab/datavzrd/commit/3a6dcf6f00979bdd771cb11b68ef450b7bd169c9))
* Add optional report name ([#15](https://www.github.com/koesterlab/datavzrd/issues/15)) ([aa2713a](https://www.github.com/koesterlab/datavzrd/commit/aa2713a7c9266dadd91ced8f8e8346990ad57cb1))
* Add pin-columns keyword ([#16](https://www.github.com/koesterlab/datavzrd/issues/16)) ([8869e57](https://www.github.com/koesterlab/datavzrd/commit/8869e57625df8bcc4c64504568a545da69dee155))
* Add tick plots ([#10](https://www.github.com/koesterlab/datavzrd/issues/10)) ([4b87407](https://www.github.com/koesterlab/datavzrd/commit/4b874079045919379175b36a489093d4fa2ec6e1))
* Add vega-controls option ([#11](https://www.github.com/koesterlab/datavzrd/issues/11)) ([9adeebb](https://www.github.com/koesterlab/datavzrd/commit/9adeebb108060cc1c876cae3f1b59f174ef605c9))
* Allow multiple header rows ([#6](https://www.github.com/koesterlab/datavzrd/issues/6)) ([79b7e38](https://www.github.com/koesterlab/datavzrd/commit/79b7e38a8b1d8e2871674947d0e45bd20b3791e2))
* Autofocus input in search dialog ([#14](https://www.github.com/koesterlab/datavzrd/issues/14)) ([9cf8a66](https://www.github.com/koesterlab/datavzrd/commit/9cf8a661057a667b4f3e235b4fd264ea2164e818))
* Don't show unreasonable plots ([#7](https://www.github.com/koesterlab/datavzrd/issues/7)) ([983d333](https://www.github.com/koesterlab/datavzrd/commit/983d3332cd751316b9828ef36bbce87b19e62a29))
* Let user access columns in config via index ([c9885b5](https://www.github.com/koesterlab/datavzrd/commit/c9885b5572e1c56a00086837f2b2106134907c93))
* Restructure config and add plot items ([#13](https://www.github.com/koesterlab/datavzrd/issues/13)) ([a3fe4c5](https://www.github.com/koesterlab/datavzrd/commit/a3fe4c557e0c536db282f4516956b5c573eb9e91))
* Support custom plots ([#9](https://www.github.com/koesterlab/datavzrd/issues/9)) ([7a57824](https://www.github.com/koesterlab/datavzrd/commit/7a5782484cd470b78ced9529bfac959db7252c21))
