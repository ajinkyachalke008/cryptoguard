// src/hub/shared/ThreatGlobe.tsx
'use client'
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { WhaleAlertService, WhalePing } from '../osint/services/intelligence/whalealert.service';
import { ChainabuseService, ChainabuseReport } from '../osint/services/intelligence/chainabuse.service';
import { COUNTRIES } from '@/hooks/useTransactions';

export const ThreatGlobe: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [whalePings, setWhalePings] = useState<WhalePing[]>([]);
  const [scamReports, setScamReports] = useState<ChainabuseReport[]>([]);
  const globeRef = useRef<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [pings, reports] = await Promise.all([
        WhaleAlertService.getRecentPings(),
        ChainabuseService.getReports('0x')
      ]);
      setWhalePings(pings);
      setScamReports(reports);
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !mountRef.current) return;

    let isCleanedUp = false;
    let animationId = 0;
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let globe: any;

    const init = async () => {
      const ThreeGlobe = (await import('three-globe')).default;
      if (isCleanedUp) return;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(mountRef.current!.clientWidth, mountRef.current!.clientHeight);
      mountRef.current!.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, mountRef.current!.clientWidth / mountRef.current!.clientHeight, 0.1, 2000);
      camera.position.z = 280;

      // Add a starfield
      const stars = new THREE.BufferGeometry();
      const starPos = new Float32Array(5000 * 3);
      for(let i=0; i<5000*3; i++) starPos[i] = (Math.random() - 0.5) * 3000;
      stars.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xFFD700, size: 0.7, transparent: true, opacity: 0.3 });
      scene.add(new THREE.Points(stars, starMat));

      globe = new ThreeGlobe()
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .atmosphereColor('#FFD700')
        .atmosphereAltitude(0.25)
        .showAtmosphere(true)
        .showGraticules(true);

      globeRef.current = globe;
      scene.add(globe);

      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      const dLight = new THREE.DirectionalLight(0xffd700, 2);
      dLight.position.set(200, 200, 200);
      scene.add(dLight);

      const animate = () => {
        if (isCleanedUp) return;
        animationId = requestAnimationFrame(animate);
        globe.rotation.y += 0.002;
        renderer.render(scene, camera);
      };
      animate();
    };

    init();

    return () => {
      isCleanedUp = true;
      cancelAnimationFrame(animationId);
      if (renderer) {
        renderer.dispose();
        if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;

    const arcData = whalePings.map(p => {
        const from = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        const to = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        return {
            startLat: from.lat, startLng: from.lng,
            endLat: to.lat, endLng: to.lng,
            color: p.amount_usd > 10000000 ? ['#FFD700', '#FF8C00'] : ['#00E5FF', '#007FFF'],
            label: `WHALE_${p.symbol}_${(p.amount_usd/1e6).toFixed(1)}M`
        };
    });

    const pointData = scamReports.map(r => {
        const loc = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        return { lat: loc.lat, lng: loc.lng, size: 0.8, color: '#FF2E2E', name: r.label || 'REPORTED_SCAM' };
    });

    const labelData = whalePings.slice(0, 5).map((p, i) => {
        const loc = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        return {
            lat: loc.lat, lng: loc.lng,
            text: `WHALE_PING: $${(p.amount_usd/1e6).toFixed(1)}M ${p.symbol}`,
            color: '#FFD700',
            size: 1
        };
    });

    const ringsData = scamReports.slice(0, 10).map(r => {
        const loc = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        return { lat: loc.lat, lng: loc.lng, maxR: 12, color: '#FF2E2E', propagationSpeed: 3, repeatAfter: 800 };
    });

    globeRef.current
      .arcsData(arcData)
      .arcColor('color')
      .arcDashLength(0.6)
      .arcDashGap(2)
      .arcDashAnimateTime(1200)
      .arcStroke(0.5)
      .pointsData(pointData)
      .pointColor('color')
      .pointRadius('size')
      .labelsData(labelData)
      .labelText('text')
      .labelSize('size')
      .labelColor('color')
      .labelResolution(3)
      .ringsData(ringsData)
      .ringColor('color')
      .ringMaxRadius('maxR')
      .ringPropagationSpeed('propagationSpeed')
      .ringRepeatPeriod('repeatAfter');
  }, [whalePings, scamReports]);

  return (
    <div ref={mountRef} className="w-full h-full relative overflow-hidden bg-black">
       <div className="absolute inset-0 pointer-events-none z-20 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
       
       <div className="absolute top-12 left-12 z-30 space-y-4">
          <div className="flex items-center gap-3 px-6 py-2 bg-gold/10 border border-gold/30 rounded-full text-[10px] font-black text-gold uppercase tracking-[0.5em] animate-pulse">
             <div className="size-2 bg-gold rounded-full animate-ping" /> A.R.I.S. GEOSPATIAL UPLINK
          </div>
          <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
             THREAT<br/><span className="text-gold">GEOLOCATION</span>
          </h2>
          <div className="text-[9px] text-gray-500 font-mono font-bold tracking-[0.4em] uppercase">Sector: Global // Monitoring: ACTIVE</div>
       </div>

       <div className="absolute bottom-12 right-12 z-30 text-right space-y-2">
          <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-2 justify-end">
             SYBIL_TRACKING: LIVE <div className="size-1.5 bg-emerald-500 rounded-full" />
          </div>
          <div className="text-[8px] text-gray-600 font-black uppercase tracking-[0.5em]">Forensic Global Monitor v9.0</div>
       </div>

       {/* Interactive Backdrop Shadow */}
       <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
    </div>
  );
};
