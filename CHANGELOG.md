# Changelog

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
