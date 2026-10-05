import { useEffect } from 'react'
import { navigate, useRoute } from './router'
import { Icon } from '../ui/Icon'
import { Toaster } from '../ui/primitives'
import { HomeScreen } from '../features/home/HomeScreen'
import { MoreScreen, PlaceholderScreen } from '../features/home/MoreScreen'
import { AdsRouter, isFullScreenAdsRoute, useAdsState } from '../features/advertising'

const tabs = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/orders', label: 'Orders', icon: 'orders' },
  { path: '/products', label: 'Products', icon: 'products' },
  { path: '/ads', label: 'Ads', icon: 'ads' },
  { path: '/more', label: 'More', icon: 'more' },
]

function activeTab(path: string) {
  if (path.startsWith('/ads')) return '/ads'
  return tabs.find((t) => t.path !== '/' && path.startsWith(t.path))?.path ?? '/'
}

export function QartApp() {
  const path = useRoute()
  const { campaigns } = useAdsState()
  const needsAttention = campaigns.some((c) => c.status === 'rejected' || c.status === 'failed')
  const full = isFullScreenAdsRoute(path)
  const tab = activeTab(path)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [path])

  let screen
  if (path.startsWith('/ads')) screen = <AdsRouter path={path} />
  else if (path.startsWith('/orders')) screen = <PlaceholderScreen title="Orders" icon="orders" />
  else if (path.startsWith('/products')) screen = <PlaceholderScreen title="Products" icon="products" />
  else if (path.startsWith('/more')) screen = <MoreScreen />
  else screen = <HomeScreen />

  return (
    <div className="q-device">
      <main key={path.split('?')[0]}>{screen}</main>
      {!full && (
        <nav className="q-tabbar" aria-label="Main">
          {tabs.map((t) => (
            <button
              key={t.path}
              type="button"
              className={`q-tab ${tab === t.path ? 'is-on' : ''}`}
              aria-current={tab === t.path ? 'page' : undefined}
              onClick={() => navigate(t.path)}
            >
              <Icon name={t.icon} size={26} strokeWidth={tab === t.path ? 2.1 : 1.8} />
              {t.label}
              {t.path === '/ads' && needsAttention && <span className="q-tab__dot" aria-label="needs attention" />}
            </button>
          ))}
        </nav>
      )}
      <div id="q-overlay" />
      <Toaster />
    </div>
  )
}
