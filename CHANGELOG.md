# [1.2.0](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/compare/v1.0.1...v1.2.0) (2023-03-31)

### Feature Breaking Change

#### Core Strategy
1. When using the development server,
   `unplugin-vue-cssvars` will analyze the referenced css file from the component,
   and inject styles in the transformation code of `@vitejs/plugin-vue`
2. When building, `unplugin-vue-cssvars` will analyze the referenced css file from the component and inject it into
   sfc, don't worry about generating redundant code, packaging tools (such as vite) will automatically handle it.

#### Option Change
1. remove `revoke`
2. adee `server`

### Bug Fixes

* fix builde error ([97024c0](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/commit/97024c001360fdeb00e49125faa552369368fb62))
* updated At Rule ([c11c4db](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/commit/c11c4db5da2dc67c5de373935c40ff06f179d2c8))



## [1.0.1](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/compare/v1.0.0...v1.0.1) (2023-03-29)


### Bug Fixes

* option's default value is empty object ([2c6c8a3](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/commit/2c6c8a32cf9c015b9a39a8d42f6a40b3a17286b0))


### Features

* Preprocessor dependency decoupling ([a2cc838](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/commit/a2cc838c5381aa2f12337ed71f755528ca7363f2))



# [1.0.0](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/compare/v1.0.0-beta.5...v1.0.0) (2023-03-29)


### Bug Fixes

* delete excess injection code ([#18](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/issues/18)) ([62285d6](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/commit/62285d6adb4d1fbfa269a7293ad5073da620801a))



# [1.0.0-beta.5](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/compare/v1.0.0-beta.2...v1.0.0-beta.5) (2023-03-28)


### Features

* support sass indented syntax ([#15](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/issues/15)) ([96bf044](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/commit/96bf04409e560705b812c6ec7657aee76aa41618))
* support styuls ([#13](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/issues/13)) ([970c867](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/commit/970c8677eb36f2442e4dc3b540dac970861aede5))



# [1.0.0-beta.2](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2023-03-23)


### Features

* support less ([#11](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/issues/11)) ([37092ab](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/commit/37092abaf31ced1b6b3860cf977023983e15bc78))



# [1.0.0-beta.1](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2023-03-21)


### Features

* support sass and scss ([#10](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/issues/10)) ([6abdff8](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/commit/6abdff825ade8f0ef637af128ad71e31740cc817))



# [1.0.0-beta.0](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/compare/129957415d4c29b3c50fec5eca43ef2eb0632d6e...v1.0.0-beta.0) (2023-03-17)


### Bug Fixes

* fix circular dependencies error ([2986952](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/commit/2986952713e05579f4f201a6e72b7a0b3b6a36e7))


### Features

* support composition api ([1299574](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/commit/129957415d4c29b3c50fec5eca43ef2eb0632d6e))
* support multiple script tag ([22dde24](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/commit/22dde2485de2fd4e6503ee5e703316157c5297c6))
* support option api ([00d75d3](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/commit/00d75d3b6f7a7959ced026c87d56e98d7d7deeeb))



