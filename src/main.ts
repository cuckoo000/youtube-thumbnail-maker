import './style.css'
import { startEditor } from './editor/app.ts'
import { redirectToHostPageIfStandalone } from './embedGuard.ts'

if (!redirectToHostPageIfStandalone()) {
  startEditor()
}
