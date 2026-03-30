import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Text, 
  Stars,
  Sky,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { MemoriNode, AgentRecord, ResearchTask } from '../types';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Settings2, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../contexts/SettingsContext';

const getThemeColors = (theme: string = 'cyberpunk') => {
  switch (theme) {
    case 'retro-futurism':
      return {
        cyan: '#00A896',
        pink: '#FF6B35',
        green: '#F7B733',
        purple: '#454D66',
        yellow: '#EFE9D5',
        void: '#2D3047',
        fogDay: '#454D66',
        fogNight: '#2D3047',
        fogAlert: '#550000',
        fogLoad: '#331100'
      };
    case 'organic-growth':
      return {
        cyan: '#A3B18A',
        pink: '#D4A373',
        green: '#588157',
        purple: '#3A5A40',
        yellow: '#DAD7CD',
        void: '#1B1F17',
        fogDay: '#3A5A40',
        fogNight: '#1B1F17',
        fogAlert: '#331111',
        fogLoad: '#222222'
      };
    case 'deep-sea':
      return {
        cyan: '#4CC9F0',
        pink: '#480CA8',
        green: '#4361EE',
        purple: '#3F37C9',
        yellow: '#B5E48C',
        void: '#03045E',
        fogDay: '#023E8A',
        fogNight: '#03045E',
        fogAlert: '#000033',
        fogLoad: '#001122'
      };
    case 'scifi':
      return {
        cyan: '#00E5FF',
        pink: '#2979FF',
        green: '#1DE9B6',
        purple: '#00B0FF',
        yellow: '#B2EBF2',
        void: '#0A192F',
        fogDay: '#002244',
        fogNight: '#0A192F',
        fogAlert: '#550000',
        fogLoad: '#331100'
      };
    case 'minimalist':
      return {
        cyan: '#E0E0E0',
        pink: '#A0A0A0',
        green: '#C0C0C0',
        purple: '#808080',
        yellow: '#D0D0D0',
        void: '#121212',
        fogDay: '#1E1E1E',
        fogNight: '#121212',
        fogAlert: '#331111',
        fogLoad: '#222222'
      };
    case 'cyberpunk':
    default:
      return {
        cyan: '#01CDFE',
        pink: '#FF71CE',
        green: '#05FFA1',
        purple: '#B967FF',
        yellow: '#FFFB96',
        void: '#0A0015',
        fogDay: '#002244',
        fogNight: '#0A0015',
        fogAlert: '#550000',
        fogLoad: '#331100'
      };
  }
};

// --- Dynamic Environment ---
const DynamicEnvironment = ({ status, hour, fogDensity, starCount, themeColors, theme }: { status: string, hour: number, fogDensity: number, starCount: number, themeColors: any, theme: string }) => {
  const timeProgress = hour / 24;
  const angle = (timeProgress - 0.25) * Math.PI * 2;
  
  const sunX = Math.cos(angle) * 100;
  const sunY = Math.sin(angle) * 100;
  const sunZ = -50;

  let fogColor = themeColors.void;
  let turbidity = 0.1;
  let rayleigh = 0.1;
  let mieCoefficient = 0.005;
  
  let effectiveStarCount = starCount;
  let effectiveFogDensity = fogDensity;

  if (theme === 'deep-sea') {
    effectiveStarCount = 0;
    effectiveFogDensity = fogDensity * 0.2;
    turbidity = 50;
    rayleigh = 10;
    mieCoefficient = 0.1;
  } else if (theme === 'organic-growth') {
    effectiveStarCount = starCount * 0.3;
    turbidity = 5;
    rayleigh = 2;
  } else if (theme === 'retro-futurism') {
    turbidity = 10;
    rayleigh = 4;
  }

  if (status === 'alert') {
    fogColor = themeColors.fogAlert;
    turbidity = 20;
    rayleigh = 5;
    mieCoefficient = 0.1;
    effectiveStarCount = Math.floor(starCount * 0.2);
    effectiveFogDensity = fogDensity * 0.5;
  } else if (status === 'high_load') {
    fogColor = themeColors.fogLoad;
    turbidity = 10;
    rayleigh = 2;
    mieCoefficient = 0.05;
    effectiveStarCount = Math.floor(starCount * 0.5);
    effectiveFogDensity = fogDensity * 0.8;
  } else {
    if (hour >= 6 && hour < 18) {
      fogColor = themeColors.fogDay;
      turbidity = 2;
      rayleigh = 1;
      mieCoefficient = 0.005;
    } else {
      fogColor = themeColors.fogNight;
      turbidity = 0.1;
      rayleigh = 0.1;
      mieCoefficient = 0.005;
    }
  }

  return (
    <>
      <fog attach="fog" args={[fogColor, 10, effectiveFogDensity]} />
      <Sky 
        sunPosition={[sunX, sunY, sunZ]} 
        turbidity={turbidity}
        rayleigh={rayleigh}
        mieCoefficient={mieCoefficient}
        mieDirectionalG={0.8}
      />
      {(hour < 6 || hour >= 18 || status !== 'normal') && (
        <Stars radius={100} depth={50} count={effectiveStarCount} factor={4} saturation={status === 'alert' ? 1 : 0} fade speed={status === 'alert' ? 3 : 1} />
      )}
    </>
  );
};

// --- Research Swarm Visuals ---
const ResearchSwarmVisuals = ({ activeTasks, themeColors }: { activeTasks: any[], themeColors: any }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current || activeTasks.length === 0) return;
    groupRef.current.rotation.y += 0.02;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 2 + 5;
  });

  if (activeTasks.length === 0) return null;

  return (
    <group ref={groupRef} position={[0, 5, 0]}>
      {/* Central Core */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={themeColors.cyan} 
          emissive={themeColors.cyan} 
          emissiveIntensity={10} 
          transparent 
          opacity={0.5} 
        />
      </mesh>
      
      {/* Orbiting Particles (Picoclaws) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[
          Math.cos(i * Math.PI / 6) * 4,
          Math.sin(i * Math.PI / 3) * 2,
          Math.sin(i * Math.PI / 6) * 4
        ]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color={themeColors.pink} emissive={themeColors.pink} emissiveIntensity={5} />
        </mesh>
      ))}

      {/* Connection Lines */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4, 0.02, 16, 100]} />
        <meshStandardMaterial color={themeColors.cyan} emissive={themeColors.cyan} emissiveIntensity={2} />
      </mesh>
    </group>
  );
};

const Floor = ({ node, index, color, themeColors }: { node: MemoriNode, index: number, color: string, themeColors: any }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetY = index * 1.5 + 0.75;
  const [currentScale, setCurrentScale] = useState(0);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const diff = 1 - currentScale;
      if (diff > 0.01) {
        const newScale = currentScale + diff * delta * 5;
        setCurrentScale(newScale);
        meshRef.current.scale.set(newScale, newScale, newScale);
      }
    }
  });

  return (
    <group position={[0, targetY, 0]}>
      <mesh ref={meshRef} scale={[0, 0, 0]}>
        <boxGeometry args={[3.2, 0.05, 3.2]} />
        <meshStandardMaterial 
          color={node.summary ? themeColors.green : color} 
          emissive={node.summary ? themeColors.green : color}
          emissiveIntensity={node.summary ? 5 : 2}
        />
      </mesh>
    </group>
  );
};

// --- Building Component ---
const Building = ({ 
  nodes, 
  position, 
  district,
  themeColors
}: { 
  nodes: MemoriNode[], 
  position: [number, number, number],
  district: string,
  themeColors: any
}) => {
  const targetHeight = Math.max(nodes.length * 1.5, 2);
  const color = useMemo(() => {
    const hash = district.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [themeColors.pink, themeColors.cyan, themeColors.green, themeColors.purple, themeColors.yellow];
    return colors[hash % colors.length];
  }, [district, themeColors]);

  const structureRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const [currentHeight, setCurrentHeight] = useState(0.1);

  useFrame((state, delta) => {
    const diff = targetHeight - currentHeight;
    if (Math.abs(diff) > 0.01) {
      const newHeight = currentHeight + diff * delta * 3;
      setCurrentHeight(newHeight);
      if (structureRef.current) {
        structureRef.current.scale.y = newHeight;
        structureRef.current.position.y = newHeight / 2;
      }
      if (coreRef.current) {
        coreRef.current.scale.y = newHeight;
        coreRef.current.position.y = newHeight / 2;
      }
    }
  });

  return (
    <group position={position}>
      {/* Ground Glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.1} 
          emissive={color} 
          emissiveIntensity={1} 
        />
      </mesh>

      {/* Main Building Structure */}
      <mesh ref={structureRef} position={[0, currentHeight / 2, 0]} scale={[1, currentHeight, 1]}>
        <boxGeometry args={[3, 1, 3]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.2} 
          emissive={color}
          emissiveIntensity={0.3}
          wireframe
        />
      </mesh>

      {/* Solid Core */}
      <mesh ref={coreRef} position={[0, currentHeight / 2, 0]} scale={[1, currentHeight, 1]}>
        <boxGeometry args={[2.8, 1, 2.8]} />
        <meshStandardMaterial 
          color={themeColors.void} 
          transparent 
          opacity={0.9} 
        />
      </mesh>

      {/* Windows / Data Lights */}
      {Array.from({ length: Math.ceil(targetHeight * 2) }).map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 2.9, 
          Math.random() * targetHeight, 
          1.41
        ]}>
          <planeGeometry args={[0.2, 0.1]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={5} 
            transparent 
            opacity={Math.random() > 0.5 ? 1 : 0.2} 
          />
        </mesh>
      ))}

      {/* Floors (Nodes) */}
      {nodes.map((node, i) => (
        <Floor key={node.id} node={node} index={i} color={color} themeColors={themeColors} />
      ))}

      {/* District Label */}
      <Text
        position={[0, currentHeight + 1.5, 0]}
        fontSize={0.6}
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {district.toUpperCase()}
      </Text>
    </group>
  );
};

// --- Agent Bot Component ---
const AgentBot = ({ agent, themeColors }: { agent: AgentRecord, themeColors: any }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [targetPos, setTargetPos] = React.useState(new THREE.Vector3(0, 0, 0));
  const isThinking = !!agent.thinking_log?.length;
  const hasTask = !!agent.current_task;
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Simple random movement if no target
    if (state.clock.elapsedTime % 5 < 0.1) {
      setTargetPos(new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        Math.random() * 10 + 2,
        (Math.random() - 0.5) * 40
      ));
    }

    meshRef.current.position.lerp(targetPos, 0.02);
    meshRef.current.rotation.y += isThinking ? 0.2 : 0.05;
    
    if (isThinking || hasTask) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 10) * 0.05;
    }
  });

  const color = agent.agent_type === 'builder' ? themeColors.green : themeColors.cyan;
  const thinkingColor = themeColors.pink;
  const taskColor = themeColors.yellow;

  return (
    <group>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial 
          color={isThinking ? thinkingColor : hasTask ? taskColor : color} 
          emissive={isThinking ? thinkingColor : hasTask ? taskColor : color} 
          emissiveIntensity={isThinking ? 15 : hasTask ? 8 : 5} 
        />
        <pointLight color={isThinking ? thinkingColor : hasTask ? taskColor : color} intensity={isThinking ? 5 : 2} distance={5} />
        
        {/* Thinking Halo */}
        {isThinking && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.02, 16, 32]} />
            <meshStandardMaterial color={thinkingColor} emissive={thinkingColor} emissiveIntensity={2} transparent opacity={0.5} />
          </mesh>
        )}

        {/* Task Aura (Anime Style) */}
        {hasTask && (
          <group>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.4, 0.45, 32]} />
              <meshStandardMaterial color={taskColor} emissive={taskColor} emissiveIntensity={5} transparent opacity={0.3} />
            </mesh>
            {/* Floating Particles */}
            {Array.from({ length: 4 }).map((_, i) => (
              <mesh key={i} position={[
                Math.cos(i * Math.PI / 2) * 0.6,
                Math.sin(i * Math.PI / 2) * 0.6,
                0
              ]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color={taskColor} emissive={taskColor} emissiveIntensity={10} />
              </mesh>
            ))}
          </group>
        )}

        {/* Floating Task Text */}
        <Html position={[0, 1.2, 0]} center distanceFactor={10}>
          <AnimatePresence>
            {hasTask && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.8 }}
                className="whitespace-nowrap flex flex-col items-center"
              >
                <div className="px-2 py-0.5 bg-void/80 border border-neon-yellow/50 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-neon-yellow/30 animate-pulse" />
                  <div className="flex items-center gap-1.5">
                    <Zap size={8} className="text-neon-yellow animate-pulse" />
                    <span className="text-[8px] font-mono text-neon-yellow uppercase tracking-widest font-bold">
                      {agent.agent_type} // {agent.status}
                    </span>
                  </div>
                  <div className="text-[10px] font-display font-black text-white mt-0.5 tracking-tight border-t border-white/10 pt-0.5">
                    {agent.current_task}
                  </div>
                  {/* Anime-style decorative corners */}
                  <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-neon-yellow" />
                  <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-neon-yellow" />
                </div>
                {/* Connector Line */}
                <div className="w-px h-4 bg-gradient-to-b from-neon-yellow/50 to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>
        </Html>
      </mesh>
    </group>
  );
};

// --- City Scene ---
export const MemoriCity: React.FC<{ nodes: MemoriNode[], agents: AgentRecord[] }> = ({ nodes, agents }) => {
  const activeTasks = useLiveQuery(() => db.research.where('status').notEqual('completed').toArray()) || [];
  const { settings } = useSettings();
  const themeColors = useMemo(() => getThemeColors(settings.visualTheme), [settings.visualTheme]);

  // Visual Controls State
  const [showControls, setShowControls] = useState(false);
  const [fogDensity, setFogDensity] = useState(100); // Maps to fog far distance (lower is denser)
  const [starCount, setStarCount] = useState(5000);
  const [showGrid, setShowGrid] = useState(true);
  const [systemStatus, setSystemStatus] = useState<'auto' | 'normal' | 'high_load' | 'alert'>('auto');
  const [timeOverride, setTimeOverride] = useState<number | 'auto'>('auto');

  // Group nodes into buildings by their primary tag (district)
  const buildings = useMemo(() => {
    const bMap: Record<string, MemoriNode[]> = {};
    nodes.forEach(node => {
      const district = node.tags?.[0] || 'uncategorized';
      if (!bMap[district]) bMap[district] = [];
      bMap[district].push(node);
    });
    return Object.entries(bMap);
  }, [nodes]);

  const thinkingAgents = agents.filter(a => a.thinking_log?.length).length;
  
  const derivedStatus = systemStatus !== 'auto' ? systemStatus : 
    (activeTasks.length > 5) ? 'alert' : 
    (activeTasks.length > 2 || thinkingAgents > 2) ? 'high_load' : 'normal';

  const currentHour = timeOverride !== 'auto' ? timeOverride : new Date().getHours();

  return (
    <div className="w-full h-full bg-void relative">
      <Canvas shadows dpr={[1, 2]}>
        <DynamicEnvironment 
          status={derivedStatus} 
          hour={currentHour} 
          fogDensity={fogDensity} 
          starCount={starCount} 
          themeColors={themeColors}
          theme={settings.visualTheme || 'cyberpunk'}
        />
        
        <PerspectiveCamera makeDefault position={[25, 25, 25]} fov={55} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.1} 
          minDistance={5}
          maxDistance={100}
        />

        {/* Lighting */}
        <ambientLight intensity={derivedStatus === 'alert' ? 0.5 : 0.2} color={derivedStatus === 'alert' ? '#ff0000' : '#ffffff'} />
        <pointLight position={[10, 10, 10]} intensity={derivedStatus === 'alert' ? 2 : 1} color={derivedStatus === 'alert' ? '#ff0000' : themeColors.pink} />
        <pointLight position={[-10, 10, -10]} intensity={1} color={themeColors.cyan} />
        
        {/* Ground Grid */}
        {showGrid && (
          <gridHelper 
            args={[200, 50, derivedStatus === 'alert' ? '#ff0000' : themeColors.cyan, derivedStatus === 'alert' ? '#550000' : themeColors.cyan]} 
            position={[0, -0.1, 0]} 
          />
        )}

        {/* Research Swarm */}
        <ResearchSwarmVisuals activeTasks={activeTasks} themeColors={themeColors} />

        {/* Buildings */}
        {buildings.map(([district, bNodes], i) => {
          const x = (i % 5 - 2) * 10;
          const z = (Math.floor(i / 5) - 2) * 10;
          return (
            <Building 
              key={district} 
              district={district} 
              nodes={bNodes} 
              position={[x, 0, z]} 
              themeColors={themeColors}
            />
          );
        })}

        {/* Agents */}
        {agents.map((agent, i) => (
          <AgentBot key={agent.id} agent={agent} themeColors={themeColors} />
        ))}
      </Canvas>

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none z-20 flex flex-col gap-3">
        <div className="bg-void/80 backdrop-blur-md p-3 border border-neon-blue/30 battle-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-neon-blue/50 animate-pulse" />
          <div className="text-[9px] font-mono text-neon-blue uppercase tracking-[0.3em] hud-label mb-1.5">
            System_Kernel // メモリ都市
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-6">
              <span className="text-[8px] font-mono text-gray-500 uppercase">Districts // 地区</span>
              <span className="text-[9px] font-mono text-white">{buildings.length}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-[8px] font-mono text-gray-500 uppercase">Memory_Blocks // メモリ</span>
              <span className="text-[9px] font-mono text-white">{nodes.length}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-[8px] font-mono text-gray-500 uppercase">Active_Agents // エージェント</span>
              <span className="text-[9px] font-mono text-neon-green">{agents.length}</span>
            </div>
          </div>
          <div className="mt-3 pt-1.5 border-t border-white/10 flex items-center justify-between">
            <span className="text-[7px] font-mono text-neon-pink animate-pulse">LIVE_FEED_V4.20</span>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-0.5 h-0.5 bg-neon-blue/40 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Tactical Compass Overlay */}
        <div className="w-16 h-16 border border-white/5 rounded-full relative flex items-center justify-center opacity-40">
          <div className="absolute inset-0 border border-neon-blue/20 rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-2 border border-neon-pink/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
          <div className="text-[7px] font-mono text-neon-blue">N</div>
        </div>
      </div>

      {/* Visual Controls Panel */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <button 
          onClick={() => setShowControls(!showControls)}
          className="p-2 bg-void/80 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all backdrop-blur-md"
          title="Visual Settings"
        >
          <Settings2 size={16} />
        </button>

        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-void/90 border border-neon-cyan/30 p-4 backdrop-blur-xl w-64 space-y-4"
            >
              <div className="text-[10px] font-mono text-neon-cyan uppercase tracking-widest border-b border-neon-cyan/20 pb-2 mb-4">
                Visual_Parameters
              </div>

              {/* System Status Control */}
              <div className="space-y-2">
                <div className="flex justify-between text-[8px] font-mono text-white/60 uppercase">
                  <span>System_Status</span>
                  <span className={derivedStatus === 'alert' ? 'text-neon-pink' : derivedStatus === 'high_load' ? 'text-neon-purple' : 'text-neon-green'}>
                    {derivedStatus.toUpperCase()}
                  </span>
                </div>
                <select 
                  value={systemStatus}
                  onChange={(e) => setSystemStatus(e.target.value as any)}
                  className="w-full bg-void border border-neon-cyan/30 p-1 text-[10px] font-mono text-white outline-none focus:border-neon-cyan"
                >
                  <option value="auto">AUTO (Based on Load)</option>
                  <option value="normal">NORMAL</option>
                  <option value="high_load">HIGH LOAD</option>
                  <option value="alert">ALERT</option>
                </select>
              </div>

              {/* Time of Day Control */}
              <div className="space-y-2">
                <div className="flex justify-between text-[8px] font-mono text-white/60 uppercase">
                  <span>Time_Of_Day</span>
                  <span className="text-neon-cyan">{timeOverride === 'auto' ? 'AUTO' : `${timeOverride}:00`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="23" 
                    step="1"
                    value={timeOverride === 'auto' ? new Date().getHours() : timeOverride} 
                    onChange={(e) => setTimeOverride(parseInt(e.target.value))}
                    className="flex-1 accent-neon-cyan h-1 bg-white/10 appearance-none outline-none"
                  />
                  <button 
                    onClick={() => setTimeOverride('auto')}
                    className={`px-2 py-0.5 text-[8px] font-mono border ${timeOverride === 'auto' ? 'bg-neon-cyan text-void border-neon-cyan' : 'border-white/20 text-white/40'}`}
                  >
                    AUTO
                  </button>
                </div>
              </div>

              {/* Fog Density Control */}
              <div className="space-y-2">
                <div className="flex justify-between text-[8px] font-mono text-white/60 uppercase">
                  <span>Fog_Density</span>
                  <span className="text-neon-pink">{Math.round((1 - (fogDensity - 20) / 180) * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="200" 
                  step="10"
                  // Invert the slider so right = denser fog (lower far value)
                  value={220 - fogDensity} 
                  onChange={(e) => setFogDensity(220 - parseInt(e.target.value))}
                  className="w-full accent-neon-pink h-1 bg-white/10 appearance-none outline-none"
                />
              </div>

              {/* Star Count Control */}
              <div className="space-y-2">
                <div className="flex justify-between text-[8px] font-mono text-white/60 uppercase">
                  <span>Star_Density</span>
                  <span className="text-neon-blue">{starCount}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10000" 
                  step="500"
                  value={starCount} 
                  onChange={(e) => setStarCount(parseInt(e.target.value))}
                  className="w-full accent-neon-blue h-1 bg-white/10 appearance-none outline-none"
                />
              </div>

              {/* Grid Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[8px] font-mono text-white/60 uppercase">Ground_Grid</span>
                <button 
                  onClick={() => setShowGrid(!showGrid)}
                  className={`w-8 h-4 rounded-full relative transition-colors ${showGrid ? 'bg-neon-green/40' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${showGrid ? 'left-4.5 bg-neon-green' : 'left-0.5'}`} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Right Status */}
      <div className="absolute bottom-6 right-6 pointer-events-none z-20">
        <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] rotate-90 origin-right translate-y-[-100%]">
          MEMORI-CITY_VISUALIZER
        </div>
      </div>
    </div>
  );
};
