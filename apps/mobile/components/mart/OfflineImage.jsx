/**
 * Market remote/local image — bundled offline map + RN Image.
 * Ağ yoksa: require() seed → soft mist placeholder (ExpoImage kullanılmaz).
 */
import { useEffect, useMemo, useState } from 'react'
import { Image, View } from 'react-native'
import { resolveOfflineSource } from '../../lib/offline-image-map'
import { colors } from './mart-theme'

const LOAD_MS = 2500

export default function OfflineImage({ source, style, resizeMode = 'cover', ...rest }) {
  const resolved = useMemo(() => {
    if (source == null) return null
    if (typeof source === 'number') return source
    return resolveOfflineSource(source) ?? source
  }, [source])

  const isLocal = typeof resolved === 'number'
  const remoteUri =
    resolved && typeof resolved === 'object' && resolved.uri ? resolved.uri : null

  const [status, setStatus] = useState(!resolved ? 'fail' : isLocal ? 'ok' : 'loading')

  useEffect(() => {
    if (!resolved) {
      setStatus('fail')
      return undefined
    }
    if (isLocal) {
      setStatus('ok')
      return undefined
    }
    setStatus('loading')
    const t = setTimeout(() => {
      setStatus((s) => (s === 'loading' ? 'fail' : s))
    }, LOAD_MS)
    return () => clearTimeout(t)
  }, [isLocal, remoteUri, resolved])

  if (!resolved || status === 'fail') {
    return <View style={[{ backgroundColor: colors.mist }, style]} accessibilityRole="image" />
  }

  return (
    <Image
      source={resolved}
      style={style}
      resizeMode={resizeMode}
      onError={() => setStatus('fail')}
      onLoad={() => setStatus('ok')}
      {...rest}
    />
  )
}
