"use client";
import React, { useEffect } from 'react';
import { startSimulation } from '../src/sim/main';

export default function Page(){
  useEffect(()=>{ startSimulation(); },[]);
  return (
    <>
      <canvas id="c"></canvas>
      <div id="hud">
        <div className="row">
          <span className="tag">FPS: <b id="fps">0</b></span>
          <span className="tag">Gravity: <b id="gravityVal" className="clickable">40</b></span>
          <span className="tag">Particles: <b id="countVal" className="clickable">1200</b></span>
          <span className="tag">Collisions: <b id="collMode" className="clickable">elastic</b></span>
          <span className="tag">Turbulence: <b id="turbMode" className="clickable">none</b></span>
          <span className="tag">Tilt: <b id="tiltState" className="clickable">off</b></span>
          <span className="tag">Mouse Gravity: <b id="mouseG" className="clickable">on</b></span>
          <span className="tag">Shape: <b id="shapeMode" className="clickable">circle</b></span>
          <span className="tag">Color: <b id="colorMode" className="clickable">velocity</b></span>
          <span className="tag">Boundaries: <b id="boundMode" className="clickable">screen-bounce</b></span>
        </div>
        <div className="row" style={{marginTop:6}}>
          <button className="btn" id="pauseBtn">Pause</button>
          <button className="btn" id="stepBtn" title="Step one frame">Step</button>
          <button className="btn" id="resetBtn" title="Reset particles">Reset</button>
          <button className="btn" id="fullscreenBtn">Fullscreen</button>
        </div>
      </div>

      <button id="togglePanel">☰ Controls <small>(C)</small></button>

      <div id="panel">
        <div id="panelHeader">
          <div className="title">Settings</div>
          <div className="actions">
            <button id="enableTiltTop" className="icon-btn primary" title="Enable Tilt">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M3 12a9 9 0 0 1 9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
              </svg>
            </button>
            <button id="randomize" className="icon-btn" title="Randomize">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="12" cy="12" r="1.5"/>
              </svg>
            </button>
            <button id="presetMenu" className="icon-btn" title="Presets">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/>
                <polyline points="22,8.5 12,15.5 2,8.5"/>
                <polyline points="2,15.5 12,22 22,15.5"/>
                <polyline points="12,2 12,15.5"/>
              </svg>
            </button>
            <button id="aboutBtn" className="icon-btn" title="About">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <path d="M12 17h.01"/>
              </svg>
            </button>
          </div>
        </div>
        <div id="tabs"></div>
        <div id="content"></div>
        <div className="footerNote">Tip: On desktop, click anywhere to set gravity direction. On mobile, tap Enable Tilt.</div>
      </div>

      <div id="tiltPrompt" hidden>
        <div className="bubble">
          <div className="row">
            <div className="flex" style={{flex:1,gap:10}}>
              <span className="chip">📱 Device Tilt</span>
              <div>To roll marbles with your phone, grant motion permission.</div>
            </div>
            <button id="enableTilt" className="primary">Enable Tilt</button>
            <button id="dismissTilt">Dismiss</button>
          </div>
        </div>
      </div>
    </>
  );
}
