'use client'

import { useEffect, useState } from 'react'
import StockLogo from './StockLogo'

interface FlyingLogosProps {
  symbol: string
  duration?: number
}

export default function FlyingLogos({ symbol, duration = 3000 }: FlyingLogosProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [showSecondBurst, setShowSecondBurst] = useState(false)

  useEffect(() => {
    // Show second burst after first one starts
    const secondBurstTimer = setTimeout(() => {
      setShowSecondBurst(true)
    }, 400) // Start second burst 400ms after first

    const hideTimer = setTimeout(() => {
      setIsVisible(false)
    }, duration * 2) // Double the duration to accommodate both bursts

    return () => {
      clearTimeout(secondBurstTimer)
      clearTimeout(hideTimer)
    }
  }, [duration])

  if (!isVisible) return null

  // Generate confetti burst effect - logos explode from center
  const logos = Array.from({ length: 40 }, (_, i) => {
    const delay = Math.random() * 0.3 // Quick burst, all start around the same time
    const animDuration = 2 + Math.random() * 1.5 // 2-3.5 seconds
    
    // Start from center (or slightly random around center for more natural burst)
    const centerX = 50 + (Math.random() - 0.5) * 10 // Center with slight variation
    const centerY = 50 + (Math.random() - 0.5) * 10
    
    // Explode outward in all directions (like confetti)
    const angle = Math.random() * Math.PI * 2 // Random angle in all directions
    const distance = 80 + Math.random() * 100 // Distance to travel (80-180vw/vh)
    const moveX = Math.cos(angle) * distance
    const moveY = Math.sin(angle) * distance
    
    // Add some upward bias (like confetti being shot up)
    const upwardBias = -30 - Math.random() * 40 // More upward movement
    const finalMoveY = moveY + upwardBias
    
    const rotation = (Math.random() - 0.5) * 1080 // Random rotation up to 540 degrees (1.5 full rotations)
    const scale = 0.4 + Math.random() * 0.6 // Bigger logos: 0.4-1.0
    const opacity = 0.5 + Math.random() * 0.5 // Random opacity between 0.5-1.0
    
    // Random color variations - different shades
    const colorFilters = [
      'brightness(0) saturate(100%) invert(77%) sepia(67%) saturate(1234%) hue-rotate(135deg) brightness(101%) contrast(101%)', // Mint (original)
      'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)', // Bright Green
      'brightness(0) saturate(100%) invert(69%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%)', // Yellow-green
      'brightness(0) saturate(100%) invert(100%) sepia(100%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)', // White
      'brightness(0) saturate(100%) invert(48%) sepia(100%) saturate(2476%) hue-rotate(200deg) brightness(118%) contrast(119%)', // Cyan
      'brightness(0) saturate(100%) invert(77%) sepia(67%) saturate(1234%) hue-rotate(100deg) brightness(120%) contrast(101%)', // Light mint
      'brightness(0) saturate(100%) invert(77%) sepia(67%) saturate(1234%) hue-rotate(170deg) brightness(101%) contrast(101%)', // Blue-mint
      'brightness(0) saturate(100%) invert(90%) sepia(100%) saturate(2000%) hue-rotate(300deg) brightness(120%) contrast(120%)', // Pink
      'brightness(0) saturate(100%) invert(60%) sepia(100%) saturate(2000%) hue-rotate(200deg) brightness(120%) contrast(120%)', // Purple
    ]
    const colorFilter = colorFilters[Math.floor(Math.random() * colorFilters.length)]

    return {
      id: i,
      delay,
      animDuration,
      centerX,
      centerY,
      moveX,
      moveY: finalMoveY,
      rotation,
      scale,
      opacity,
      colorFilter,
    }
  })

  // Generate second burst with different parameters
  const secondBurstLogos = Array.from({ length: 40 }, (_, i) => {
    const delay = Math.random() * 0.3
    const animDuration = 2 + Math.random() * 1.5
    
    const centerX = 50 + (Math.random() - 0.5) * 10
    const centerY = 50 + (Math.random() - 0.5) * 10
    
    const angle = Math.random() * Math.PI * 2
    const distance = 80 + Math.random() * 100
    const moveX = Math.cos(angle) * distance
    const moveY = Math.sin(angle) * distance
    
    const upwardBias = -30 - Math.random() * 40
    const finalMoveY = moveY + upwardBias
    
    const rotation = (Math.random() - 0.5) * 1080
    const scale = 0.4 + Math.random() * 0.6
    const opacity = 0.5 + Math.random() * 0.5
    
    const colorFilters = [
      'brightness(0) saturate(100%) invert(77%) sepia(67%) saturate(1234%) hue-rotate(135deg) brightness(101%) contrast(101%)',
      'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)',
      'brightness(0) saturate(100%) invert(69%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%)',
      'brightness(0) saturate(100%) invert(100%) sepia(100%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)',
      'brightness(0) saturate(100%) invert(48%) sepia(100%) saturate(2476%) hue-rotate(200deg) brightness(118%) contrast(119%)',
      'brightness(0) saturate(100%) invert(77%) sepia(67%) saturate(1234%) hue-rotate(100deg) brightness(120%) contrast(101%)',
      'brightness(0) saturate(100%) invert(77%) sepia(67%) saturate(1234%) hue-rotate(170deg) brightness(101%) contrast(101%)',
      'brightness(0) saturate(100%) invert(90%) sepia(100%) saturate(2000%) hue-rotate(300deg) brightness(120%) contrast(120%)',
      'brightness(0) saturate(100%) invert(60%) sepia(100%) saturate(2000%) hue-rotate(200deg) brightness(120%) contrast(120%)',
    ]
    const colorFilter = colorFilters[Math.floor(Math.random() * colorFilters.length)]

    return {
      id: i + 1000, // Different IDs for second burst
      delay,
      animDuration,
      centerX,
      centerY,
      moveX,
      moveY: finalMoveY,
      rotation,
      scale,
      opacity,
      colorFilter,
    }
  })

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* First burst */}
      {logos.map((logo) => (
        <div
          key={logo.id}
          className="absolute"
          style={{
            left: `${logo.centerX}%`,
            top: `${logo.centerY}%`,
            opacity: logo.opacity,
            transform: `scale(${logo.scale}) rotate(${logo.rotation}deg)`,
            animation: `confettiBurst${logo.id} ${logo.animDuration}s ease-out ${logo.delay}s forwards`,
          }}
        >
          <style jsx>{`
            @keyframes confettiBurst${logo.id} {
              0% {
                transform: translate(-50%, -50%) scale(${logo.scale}) rotate(${logo.rotation}deg);
                opacity: ${logo.opacity};
              }
              30% {
                opacity: ${logo.opacity};
              }
              100% {
                transform: translate(calc(-50% + ${logo.moveX}vw), calc(-50% + ${logo.moveY}vh)) 
                          scale(${logo.scale * 0.4}) rotate(${logo.rotation + 720}deg);
                opacity: 0;
              }
            }
          `}</style>
          <div
            style={{
              filter: logo.colorFilter,
            }}
          >
            <StockLogo symbol={symbol} size="lg" />
          </div>
        </div>
      ))}
      
      {/* Second burst */}
      {showSecondBurst && secondBurstLogos.map((logo) => (
        <div
          key={logo.id}
          className="absolute"
          style={{
            left: `${logo.centerX}%`,
            top: `${logo.centerY}%`,
            opacity: logo.opacity,
            transform: `scale(${logo.scale}) rotate(${logo.rotation}deg)`,
            animation: `confettiBurst${logo.id} ${logo.animDuration}s ease-out ${logo.delay}s forwards`,
          }}
        >
          <style jsx>{`
            @keyframes confettiBurst${logo.id} {
              0% {
                transform: translate(-50%, -50%) scale(${logo.scale}) rotate(${logo.rotation}deg);
                opacity: ${logo.opacity};
              }
              30% {
                opacity: ${logo.opacity};
              }
              100% {
                transform: translate(calc(-50% + ${logo.moveX}vw), calc(-50% + ${logo.moveY}vh)) 
                          scale(${logo.scale * 0.4}) rotate(${logo.rotation + 720}deg);
                opacity: 0;
              }
            }
          `}</style>
          <div
            style={{
              filter: logo.colorFilter,
            }}
          >
            <StockLogo symbol={symbol} size="lg" />
          </div>
        </div>
      ))}
    </div>
  )
}
