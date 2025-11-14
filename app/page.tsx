"use client";
import React, { useEffect } from 'react';
import { startSimulation } from '../src/sim/main';
import { Dice6, Grid3X3, RotateCcw, HelpCircle, Smartphone, Clock, ArrowDown, Circle, Settings, Wind, RotateCw, Mouse, Palette, Square } from 'lucide-react';

export default function Page(){
  useEffect(()=>{ startSimulation(); },[]);
  return (
    <>
      <canvas id="c"></canvas>
      <div id="hud">
        <div className="row">
          <span className="tag"><Clock size={12} /> <b id="fps">0</b></span>
          <span className="tag"><ArrowDown size={12} /> <b id="gravityVal" className="clickable">40</b></span>
          <span className="tag"><Circle size={12} /> <b id="countVal" className="clickable">1200</b></span>
          <span className="tag"><Settings size={12} /> <b id="collMode" className="clickable">elastic</b></span>
          <span className="tag"><Wind size={12} /> <b id="turbMode" className="clickable">none</b></span>
          <span className="tag"><RotateCw size={12} /> <b id="tiltState" className="clickable">off</b></span>
          <span className="tag"><Mouse size={12} /> <b id="mouseG" className="clickable">on</b></span>
          <span className="tag"><b id="shapeMode" className="clickable">circle</b></span>
          <span className="tag"><Palette size={12} /> <b id="colorMode" className="clickable">velocity</b></span>
          <span className="tag"><Square size={12} /> <b id="boundMode" className="clickable">screen-bounce</b></span>
        </div>
        
      </div>

      <button id="togglePanel">☰ Controls <small>(C)</small></button>

      <div id="panel">
        <div id="panelHeader">
          <div className="title">Settings</div>
          <div className="actions">
            <button id="enableTiltTop" className="icon-btn primary" title="Enable Tilt">
              <Smartphone size={20} />
            </button>
            <button id="randomize" className="icon-btn" title="Randomize">
              <Dice6 size={20} />
            </button>
            <button id="presetMenu" className="icon-btn" title="Presets">
              <Grid3X3 size={20} />
            </button>
            <button id="resetBtn" className="icon-btn" title="Reset particles">
              <RotateCcw size={20} />
            </button>
            <button id="fullscreenBtn" className="icon-btn" title="Fullscreen">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
            </button>
            <button id="aboutBtn" className="icon-btn" title="About">
              <HelpCircle size={20} />
            </button>
          </div>
        </div>
        <div id="tabs"></div>
        <div id="content"></div>
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
