# vue-router-dom [![CircleCI](https://circleci.com/gh/PatrykWalach/vue-router-dom.svg?style=svg)](https://circleci.com/gh/PatrykWalach/vue-router-dom) [![codecov](https://codecov.io/gh/PatrykWalach/vue-router-dom/branch/master/graph/badge.svg)](https://codecov.io/gh/PatrykWalach/vue-router-dom) ![](https://img.shields.io/npm/v/vue-router-dom)

`vue-router-dom` is an implementation of [react-router](https://reacttraining.com/react-router/web/guides/philosophy) for vue 3, providing components and hooks for routing.

## Table of contents

- [Install](#install)
- [API](#api)
- [Non-standard APIs](#Non-standard-APIs)
  - [Install](#install)
  - [Components](#Components)
    - [Route](#Route)
      - [v-slot:element](#v-slot:element)
    - [HashRouter](#HashRouter)
    - [StaticRouter](#StaticRouter)
  - [Hooks](#Hooks)
    - [useInRouterContext](#useInRouterContext)

## Install

```sh
npm i vue-router-dom
```

## API

For API documentaiton, please visit
[React Router API](https://github.com/ReactTraining/react-router/blob/dev/docs/api-reference.md).

## Non-standard APIs

### install

The install export is a function that registers all the components globally

```typescript
import { install } from 'vue-router-dom'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App).use(install)

app.mount('#app')
```

### Components

#### Route

##### v-slot:element

`Element slot` can be used over `element prop`.

If both are present `element slot` will overwrite `element prop`.

```html
<!-- App.vue -->
<template>
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Home />
        </Route>
        <Route path="users">
          <template #element>
            <Users />
          </template>
          <template #default>
            <Route path="/">
              <UsersIndex />
            </Route>
            <Route path=":id">
              <UserProfile />
            </Route>
            <Route path="me">
              <OwnUserProfile />
            </Route>
          </template>
        </Route>
      </Routes>
    </BrowserRouter>
</template>

<!-- Users.vue -->
<template>
  <div>
    <nav>
      <Link to="me">My Profile</Link>
    </nav>

    <Outlet />
  </div>
</template>
```

#### HashRouter

#### StaticRouter

`StaticRouter`, `HashRouter` are not implemented yet

### Hooks

#### useInRouterContext

is not implemented since it is easy to check in Vue

```ts
export default {
  setup() {
    const locationContext = inject(LOCATION_CONTEXT, null)
    if (locationContext === null) {
      throw new Error('not in router context')
    }
    // ...
  },
}
```
