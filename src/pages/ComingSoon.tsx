import LightRays from '@/components/LightRays';
import { useEffect, useRef, useState } from 'react';

const ComingSoon = () => {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.2 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate light direction for shadows
  const lightAngleX = (mousePos.x - 0.5) * 100;
  const lightAngleY = (mousePos.y - 0.2) * 50;

  return (
    <>
      <style>
        {`
          @keyframes portalFlicker {
            0%, 33.33% {
              content: url('/comingsoon/on.png');
            }
            33.34%, 100% {
              content: url('/comingsoon/off.png');
            }
          }
          
          .coming-soon {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #000000;
            gap: 2rem;
            position: relative;
            overflow: hidden;
          }
          
          .light-rays-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
          }
          
          .content-layer {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            gap: 2rem;
          }
          
          .flicker-portal {
            animation: portalFlicker 3s infinite;
            width: 600px;
            height: auto;
            position: relative;
            transition: filter 0.1s ease-out, drop-shadow 0.1s ease-out;
          }
          
          .content {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            position: relative;
            transition: filter 0.1s ease-out, text-shadow 0.1s ease-out;
          }
          
          .coming-soon h1 {
            color: white;
            font-size: 2rem;
            margin: 0;
            transition: text-shadow 0.1s ease-out;
          }
          
          .coming-soon p {
            color: #ccc;
            font-size: 0.9rem;
            margin: 0.5rem 0 0 0;
          }
        `}
      </style>
      <div className="coming-soon" ref={containerRef}>
        {/* Light rays in the background */}
        <div className="light-rays-background">
          <LightRays
            raysOrigin="top-center"
            raysColor="#c77dff"
            raysSpeed={1.2}
            lightSpread={0.15}
            rayLength={8}
            followMouse={true}
            mouseInfluence={0.4}
            fadeDistance={2.2}
            saturation={1.5}
            pulsating={true}
          />
        </div>

        {/* Content layer with dynamic lighting */}
        <div className="content-layer">
          <img
            src="/comingsoon/on.png"
            alt="Flickering Portal"
            className="flicker-portal"
            style={{
              filter: `
                brightness(${1 + (0.5 - mousePos.y) * 0.4})
                contrast(1.1)
                drop-shadow(${-lightAngleX * 0.3}px ${-lightAngleY * 0.5}px 40px rgba(199, 125, 255, ${0.6 - mousePos.y * 0.3}))
                drop-shadow(${-lightAngleX * 0.5}px ${-lightAngleY * 0.8}px 80px rgba(157, 78, 221, ${0.4 - mousePos.y * 0.2}))
              `
            }}
          />
          <div
            className="content"
            style={{
              filter: `brightness(${1 + (0.5 - mousePos.y) * 0.3})`
            }}
          >
            <h1
              style={{
                textShadow: `
                  ${-lightAngleX * 0.2}px ${-lightAngleY * 0.3}px 30px rgba(199, 125, 255, ${0.8 - mousePos.y * 0.4}),
                  ${-lightAngleX * 0.3}px ${-lightAngleY * 0.5}px 60px rgba(157, 78, 221, ${0.5 - mousePos.y * 0.3}),
                  0 0 100px rgba(199, 125, 255, ${0.3 - mousePos.y * 0.2})
                `
              }}
            >
              COMING SOON
            </h1>
            <p>This module is still being worked across classes.</p>
            <p>Check back once she's safe to cross.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComingSoon;
