import { defineConfig } from 'vite'

// tools.vrceve.com/thumbnail/ 配下へ配置するため、アセット参照を相対化せず /thumbnail/ 固定にする。
export default defineConfig({
  base: '/thumbnail/',
})
