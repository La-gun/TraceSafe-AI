import React from 'react'
import ReactDOM from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import App from '@/App.jsx'
import '@/index.css'

async function initNativeShell() {
  if (!Capacitor.isNativePlatform()) return
  try {
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#060B18' })
  } catch {
    // Some WebViews or configurations omit status bar APIs
  }
}

void initNativeShell()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
