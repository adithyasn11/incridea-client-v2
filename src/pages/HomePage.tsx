
import { type CSSProperties } from 'react'
import Sky1 from '../assets/Landing/Sky.png'
import Background from '../assets/Landing/Background.png'
import Mid from '../assets/Landing/Mid.png'
import Foreground from '../assets/Landing/Foreground.png'

type ParallaxStyle = CSSProperties & { '--parallax-duration'?: string }

function HomePage() {
  const skyStyle: ParallaxStyle = {
    backgroundImage: `url(${Sky1})`,
    backgroundSize: '1920px auto',
    '--parallax-duration': '200s',
  }

  const backgroundStyle: ParallaxStyle = {
    backgroundImage: `url(${Background})`,
    backgroundSize: '1920px auto',
    '--parallax-duration': '120s',
  }

  const midStyle: ParallaxStyle = {
    backgroundImage: `url(${Mid})`,
    backgroundSize: '1920px auto',
    '--parallax-duration': '50s',
  }

  const foregroundStyle: ParallaxStyle = {
    backgroundImage: `url(${Foreground})`,
    backgroundSize: '1920px auto',
    '--parallax-duration': '20s',
  }

  return (
    <main>
    <div 
        style={skyStyle}
        className="fixed top-[-1%] md:top-[-2%]  w-full h-full inset-0 -z-40 bg-repeat-x animate-parallax-slow" 
    />
    <div 
        style={backgroundStyle}
        className="fixed top-[5%] md:top-[21%]  w-full h-full inset-0 -z-40 bg-repeat-x animate-parallax-slow"
    />

    <div 
        style={midStyle}
        className="fixed top-[50%] md:top-[65%]  w-full h-full inset-0 -z-40 bg-repeat-x animate-parallax-mid"
    />

    <div 
        style={foregroundStyle}
        className="fixed top-[70%] md:top-[75%]  w-full h-full inset-0 -z-40 bg-repeat-x animate-parallax-fast"
    />
    </main>
  )
}

export default HomePage
