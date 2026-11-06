// Canvas Rigging & Procedural Animation for Ettore & Rex (Pixar 3D Aesthetic)

export interface AnimationRigState {
  x: number;
  y: number;
  scale: number;
  time: number;
  isWalking?: boolean;
  isSpeaking?: boolean;
  isJumping?: boolean;
  isDriving?: boolean;
  isSad?: boolean;
  isCelebrating?: boolean;
  facing?: 'left' | 'right';
  expression?: 'happy' | 'surprised' | 'focused' | 'laughing' | 'determined' | 'sad';
  customAction?: string;
}

// Draw Ettore (French Bulldog - Golden Brown, Red Collar, Round Gold Medal)
export function drawEttoreRig(ctx: CanvasRenderingContext2D, state: AnimationRigState) {
  const {
    x,
    y,
    scale,
    time,
    isWalking = false,
    isSpeaking = false,
    isJumping = false,
    isDriving = false,
    isSad = false,
    isCelebrating = false,
    facing = 'right',
    expression = 'happy'
  } = state;

  ctx.save();
  ctx.translate(x, y);
  const flip = facing === 'left' ? -1 : 1;
  ctx.scale(scale * flip, scale);

  // Bobbing / Walk cycle / Jump calculation
  const walkBob = isWalking ? Math.sin(time * 12) * 5 : 0;
  const walkWaddle = isWalking ? Math.sin(time * 6) * 0.08 : 0;
  const jumpOffset = isJumping ? -Math.abs(Math.sin(time * 6)) * 40 : 0;
  const cheerHop = isCelebrating ? -Math.abs(Math.sin(time * 8)) * 18 : 0;
  const totalY = walkBob + jumpOffset + cheerHop;

  ctx.translate(0, totalY);
  ctx.rotate(walkWaddle);

  // Shadow on ground (if not driving)
  if (!isDriving) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    const shadowScale = isJumping ? 0.7 : 1.0;
    ctx.ellipse(0, 50 - totalY, 40 * shadowScale, 14 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Wagging Tail
  ctx.save();
  const tailWag = Math.sin(time * 18) * 0.35;
  ctx.translate(-28, 10);
  ctx.rotate(-0.4 + tailWag);
  ctx.fillStyle = '#C87D38';
  ctx.beginPath();
  ctx.ellipse(-10, 0, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // White tip on tail
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-18, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Back legs / Paws (walking animation)
  const legCycle = isWalking ? Math.sin(time * 12) * 12 : 0;
  if (!isDriving) {
    ctx.fillStyle = '#A35D22';
    // Back left paw
    ctx.beginPath();
    ctx.ellipse(-18 + legCycle, 36, 9, 14, 0.1, 0, Math.PI * 2);
    ctx.fill();
    // Back right paw
    ctx.beginPath();
    ctx.ellipse(14 - legCycle, 36, 9, 14, -0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Chubby Body
  const bodyGrad = ctx.createLinearGradient(-30, -20, 30, 40);
  bodyGrad.addColorStop(0, '#E59850');
  bodyGrad.addColorStop(0.7, '#C87D38');
  bodyGrad.addColorStop(1, '#9C581E');
  ctx.fillStyle = bodyGrad;

  ctx.beginPath();
  ctx.ellipse(0, 15, 32, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  // White chest patch
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(6, 12, 16, 20, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Front paws
  if (!isDriving) {
    ctx.fillStyle = '#D4863E';
    const frontLegCycle = isWalking ? Math.sin(time * 12 + Math.PI) * 12 : 0;
    // Front paw left
    ctx.beginPath();
    ctx.ellipse(-10 - frontLegCycle, 40, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Front paw right
    ctx.beginPath();
    ctx.ellipse(20 + frontLegCycle, 40, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Red Shiny Collar with Golden Medal
  ctx.save();
  ctx.translate(6, -6);
  ctx.fillStyle = '#D32F2F';
  ctx.shadowColor = 'rgba(211, 47, 47, 0.5)';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.roundRect(-22, 0, 44, 9, 4);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Gold Round Medal
  const medalSwing = Math.sin(time * 10) * 0.2;
  ctx.save();
  ctx.translate(2, 6);
  ctx.rotate(medalSwing);
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(0, 8, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFA000';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Paw icon in medal
  ctx.fillStyle = '#9C581E';
  ctx.beginPath();
  ctx.arc(0, 8, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();

  // HEAD GROUP (with head tilt and breathing)
  const headBob = Math.sin(time * 4) * 0.05;
  ctx.save();
  ctx.translate(6, -26);
  ctx.rotate(headBob);

  // Big Bat / Rose Ears
  const earFlap = isWalking || isJumping ? Math.sin(time * 14) * 0.12 : 0;

  // Left Ear
  ctx.save();
  ctx.translate(-20, -18);
  ctx.rotate(-0.35 + earFlap);
  ctx.fillStyle = '#C87D38';
  ctx.beginPath();
  ctx.ellipse(0, -16, 11, 22, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Inner ear pink
  ctx.fillStyle = '#FFAB91';
  ctx.beginPath();
  ctx.ellipse(0, -15, 6, 16, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right Ear
  ctx.save();
  ctx.translate(20, -18);
  ctx.rotate(0.35 - earFlap);
  ctx.fillStyle = '#C87D38';
  ctx.beginPath();
  ctx.ellipse(0, -16, 11, 22, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Inner ear pink
  ctx.fillStyle = '#FFAB91';
  ctx.beginPath();
  ctx.ellipse(0, -15, 6, 16, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Head Base
  const headGrad = ctx.createRadialGradient(4, -4, 4, 0, 0, 32);
  headGrad.addColorStop(0, '#F5AA62');
  headGrad.addColorStop(0.8, '#C87D38');
  headGrad.addColorStop(1, '#9C581E');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 29, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wrinkles on forehead (Bulldog signature)
  ctx.strokeStyle = '#9C581E';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -12, 10, 0.8, 2.3);
  ctx.stroke();

  // Dark Muzzle / Jowls
  ctx.fillStyle = '#4A2A12';
  ctx.beginPath();
  ctx.ellipse(0, 10, 18, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Black Nose / Snout
  ctx.fillStyle = '#1A0E06';
  ctx.beginPath();
  ctx.roundRect(-7, 2, 14, 8, 3);
  ctx.fill();
  // Specular shine on nose
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.ellipse(-2, 4, 3, 1.5, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Large Expressive Pixar Eyes
  const blink = Math.sin(time * 2.5) > 0.96;
  [-11, 11].forEach((eyeX) => {
    ctx.save();
    ctx.translate(eyeX, -3);

    if (blink) {
      // Blinking slit
      ctx.strokeStyle = '#2B1408';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.stroke();
    } else {
      // Sclera
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(0, 0, 7.5, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pupil / Iris
      ctx.fillStyle = '#1A0E06';
      ctx.beginPath();
      ctx.ellipse(0, 0, 5.5, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glossy highlight dots
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(2, -2.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-1.5, 2.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  // Mouth & Speaking Animation
  ctx.save();
  ctx.translate(0, 16);
  const mouthOpen = isSpeaking ? (Math.sin(time * 20) * 0.5 + 0.5) * 8 : (expression === 'laughing' || expression === 'happy' ? 5 : 1);

  if (mouthOpen > 2) {
    // Open mouth / tongue
    ctx.fillStyle = '#880E4F';
    ctx.beginPath();
    ctx.ellipse(0, mouthOpen / 2, 7, mouthOpen / 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pink tongue
    ctx.fillStyle = '#FF4081';
    ctx.beginPath();
    ctx.ellipse(0, mouthOpen - 1, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Closed friendly smile
    ctx.strokeStyle = '#1A0E06';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.quadraticCurveTo(0, 4, 6, 0);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore(); // end head
  ctx.restore(); // end ettore
}

// Draw Rex (German Shepherd - Noble Black & Tan, Navy Collar, Star Silver Medal)
export function drawRexRig(ctx: CanvasRenderingContext2D, state: AnimationRigState) {
  const {
    x,
    y,
    scale,
    time,
    isWalking = false,
    isSpeaking = false,
    isJumping = false,
    isDriving = false,
    facing = 'right',
    expression = 'focused'
  } = state;

  ctx.save();
  ctx.translate(x, y);
  const flip = facing === 'left' ? -1 : 1;
  ctx.scale(scale * flip, scale);

  const walkBob = isWalking ? Math.sin(time * 10) * 6 : 0;
  const walkStride = isWalking ? Math.sin(time * 5) * 0.05 : 0;
  const totalY = walkBob;

  ctx.translate(0, totalY);
  ctx.rotate(walkStride);

  // Shadow on ground
  if (!isDriving) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 78 - totalY, 48, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Bushy Shepherd Tail
  ctx.save();
  const tailSway = Math.sin(time * 8) * 0.2;
  ctx.translate(-38, 30);
  ctx.rotate(0.6 + tailSway);
  ctx.fillStyle = '#1A1817';
  ctx.beginPath();
  ctx.ellipse(-14, 0, 20, 9, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#9C6838';
  ctx.beginPath();
  ctx.ellipse(-26, 0, 10, 6, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Tall back legs
  if (!isDriving) {
    const legCycle = isWalking ? Math.sin(time * 10) * 16 : 0;
    ctx.fillStyle = '#8B5424';
    ctx.beginPath();
    ctx.ellipse(-24 + legCycle, 60, 10, 24, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(18 - legCycle, 60, 10, 24, -0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Athletic Torso / Body (Black saddle over warm tan)
  const bodyGrad = ctx.createLinearGradient(-35, -20, 35, 50);
  bodyGrad.addColorStop(0, '#1F1B18');
  bodyGrad.addColorStop(0.55, '#2D2723');
  bodyGrad.addColorStop(0.85, '#B26F34');
  bodyGrad.addColorStop(1, '#8B5424');
  ctx.fillStyle = bodyGrad;

  ctx.beginPath();
  ctx.ellipse(0, 28, 38, 36, -0.05, 0, Math.PI * 2);
  ctx.fill();

  // Warm Tan Chest
  ctx.fillStyle = '#C87D38';
  ctx.beginPath();
  ctx.ellipse(14, 25, 20, 28, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Front legs
  if (!isDriving) {
    const frontCycle = isWalking ? Math.sin(time * 10 + Math.PI) * 16 : 0;
    ctx.fillStyle = '#C87D38';
    ctx.beginPath();
    ctx.ellipse(-12 - frontCycle, 66, 10, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(26 + frontCycle, 66, 10, 22, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Deep Navy Collar with Silver Star Medal
  ctx.save();
  ctx.translate(12, -2);
  ctx.fillStyle = '#0D47A1';
  ctx.shadowColor = 'rgba(13, 71, 161, 0.5)';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.roundRect(-24, 0, 48, 10, 4);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Silver Star Medal
  const starSwing = Math.sin(time * 8) * 0.15;
  ctx.save();
  ctx.translate(2, 8);
  ctx.rotate(starSwing);
  ctx.fillStyle = '#E0E0E0';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  // 5-point star
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const rOuter = 8;
    const rInner = 4;
    const a1 = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const a2 = a1 + Math.PI / 5;
    if (i === 0) ctx.moveTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
    else ctx.lineTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
    ctx.lineTo(Math.cos(a2) * rInner, Math.sin(a2) * rInner);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();

  // NOBLE HEAD (Tall, pointed ears)
  ctx.save();
  ctx.translate(14, -34);
  const headNod = Math.sin(time * 3) * 0.04;
  ctx.rotate(headNod);

  // Pointed Shepherd Ears
  // Left Ear
  ctx.save();
  ctx.translate(-16, -24);
  ctx.rotate(-0.15);
  ctx.fillStyle = '#1A1817';
  ctx.beginPath();
  ctx.moveTo(-10, 10);
  ctx.lineTo(0, -32);
  ctx.lineTo(12, 10);
  ctx.closePath();
  ctx.fill();
  // Inner pink-tan
  ctx.fillStyle = '#C87D38';
  ctx.beginPath();
  ctx.moveTo(-5, 6);
  ctx.lineTo(0, -22);
  ctx.lineTo(7, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Right Ear
  ctx.save();
  ctx.translate(16, -24);
  ctx.rotate(0.15);
  ctx.fillStyle = '#1A1817';
  ctx.beginPath();
  ctx.moveTo(-12, 10);
  ctx.lineTo(0, -32);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.fill();
  // Inner pink-tan
  ctx.fillStyle = '#C87D38';
  ctx.beginPath();
  ctx.moveTo(-7, 6);
  ctx.lineTo(0, -22);
  ctx.lineTo(5, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Head Silhouette
  const headGrad = ctx.createLinearGradient(0, -20, 0, 20);
  headGrad.addColorStop(0, '#1A1817');
  headGrad.addColorStop(0.5, '#2D2723');
  headGrad.addColorStop(1, '#A0602C');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Black Shepherd Mask
  ctx.fillStyle = '#141210';
  ctx.beginPath();
  ctx.ellipse(0, 2, 21, 19, 0, 0, Math.PI * 2);
  ctx.fill();

  // Elongated Noble Snout
  ctx.fillStyle = '#12100E';
  ctx.beginPath();
  ctx.roundRect(-8, 8, 16, 18, 5);
  ctx.fill();

  // Black Nose
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(-6, 20, 12, 7, 3);
  ctx.fill();
  // Nose shine
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.ellipse(-2, 22, 2.5, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Almond-Shaped Warm Brown Eyes
  [-11, 11].forEach((eyeX) => {
    ctx.save();
    ctx.translate(eyeX, -3);
    // Eyebrow patch (tan mark)
    ctx.fillStyle = '#C87D38';
    ctx.beginPath();
    ctx.ellipse(0, -8, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sclera
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 6, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Iris (Warm Amber / Hazel)
    ctx.fillStyle = '#795548';
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(1.5, -1.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Rex Mouth & Speech
  ctx.save();
  ctx.translate(0, 28);
  const rexMouthOpen = isSpeaking ? (Math.sin(time * 20 + 1) * 0.5 + 0.5) * 8 : 1;
  if (rexMouthOpen > 2) {
    ctx.fillStyle = '#880E4F';
    ctx.beginPath();
    ctx.ellipse(0, rexMouthOpen / 2, 6, rexMouthOpen / 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF4081';
    ctx.beginPath();
    ctx.ellipse(0, rexMouthOpen - 1, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.quadraticCurveTo(0, 3, 6, 0);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore(); // end head
  ctx.restore(); // end rex
}

// Draw Formula 1 Mini Racecar (Red for Ettore #01, Blue for Rex #24, Black for Bruno #07)
export function drawRacecarRig(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number,
  color: 'red' | 'blue' | 'black',
  carNumber: string,
  driver: 'ettore' | 'rex' | 'bruno'
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Engine vibration
  const rumbleY = (Math.random() - 0.5) * 3;
  ctx.translate(0, rumbleY);

  // Shadow under car
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 42, 65, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wheels (Spinning with blur effect)
  const wheelSpin = (time * 40) % (Math.PI * 2);
  [-46, 46].forEach((wx) => {
    // Left/Right racing slick tires
    ctx.fillStyle = '#1C1917';
    ctx.beginPath();
    ctx.roundRect(wx - 14, 18, 28, 22, 6);
    ctx.fill();

    // Golden/Silver Rim
    ctx.fillStyle = color === 'red' ? '#F59E0B' : '#E2E8F0';
    ctx.beginPath();
    ctx.arc(wx, 29, 7, 0, Math.PI * 2);
    ctx.fill();

    // Rim spokes
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wx, 29);
    ctx.lineTo(wx + Math.cos(wheelSpin) * 7, 29 + Math.sin(wheelSpin) * 7);
    ctx.stroke();
  });

  // Aerodynamic Chassis
  const mainColor = color === 'red' ? '#DC2626' : color === 'blue' ? '#2563EB' : '#18181B';
  const highlightColor = color === 'red' ? '#EF4444' : color === 'blue' ? '#3B82F6' : '#27272A';

  const carGrad = ctx.createLinearGradient(0, -25, 0, 35);
  carGrad.addColorStop(0, highlightColor);
  carGrad.addColorStop(1, mainColor);
  ctx.fillStyle = carGrad;

  // Nosecone & Main body
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.lineTo(34, 15);
  ctx.lineTo(44, 34);
  ctx.lineTo(-44, 34);
  ctx.lineTo(-34, 15);
  ctx.closePath();
  ctx.fill();

  // Front Wing / Splitter
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.roundRect(-48, 30, 96, 8, 3);
  ctx.fill();

  // Rear Wing / Spoiler
  ctx.fillStyle = mainColor;
  ctx.fillRect(-38, -32, 76, 7);
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(-36, -26, 6, 12);
  ctx.fillRect(30, -26, 6, 12);

  // Driver in Cockpit
  ctx.save();
  ctx.translate(0, -8);
  if (driver === 'ettore') {
    // Ettore with red racing helmet
    drawEttoreRig(ctx, { x: 0, y: 0, scale: 0.65, time, isDriving: true, facing: 'right' });
    // Red helmet overlay
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(4, -18, 22, Math.PI, Math.PI * 2);
    ctx.fill();
    // Visor
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.roundRect(-8, -20, 24, 7, 3);
    ctx.fill();
  } else if (driver === 'rex') {
    drawRexRig(ctx, { x: 0, y: 0, scale: 0.65, time, isDriving: true, facing: 'right' });
    // Blue helmet overlay
    ctx.fillStyle = '#1D4ED8';
    ctx.beginPath();
    ctx.arc(9, -24, 22, Math.PI, Math.PI * 2);
    ctx.fill();
    // Visor
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.roundRect(-2, -26, 24, 7, 3);
    ctx.fill();
  }
  ctx.restore();

  // Racing Number Badge on Nose
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(0, 14, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(carNumber, 0, 14);

  // Exhaust fire / smoke
  const exhaustFlicker = Math.random() > 0.4;
  if (exhaustFlicker) {
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(-22, -26, 5 + Math.random() * 4, 0, Math.PI * 2);
    ctx.arc(22, -26, 5 + Math.random() * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Draw Signor Baffi (White Fluffy Poodle with blue apron and champagne tray)
export function drawSignorBaffiRig(ctx: CanvasRenderingContext2D, state: AnimationRigState) {
  const { x, y, scale, time, isSpeaking = false } = state;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const bob = Math.sin(time * 6) * 3;
  ctx.translate(0, bob);

  // White fluffy body
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.ellipse(0, 20, 26, 32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Blue Waiter Apron
  ctx.fillStyle = '#1E3A8A';
  ctx.beginPath();
  ctx.roundRect(-16, 8, 32, 40, 4);
  ctx.fill();

  // Red Bow Tie
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(-8, 0);
  ctx.lineTo(-8, 8);
  ctx.closePath();
  ctx.moveTo(0, 4);
  ctx.lineTo(8, 0);
  ctx.lineTo(8, 8);
  ctx.closePath();
  ctx.fill();

  // Head with fluffy white afro curls
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.arc(0, -16, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.arc(-14, -28, 12, 0, Math.PI * 2);
  ctx.arc(14, -28, 12, 0, Math.PI * 2);
  ctx.arc(0, -34, 14, 0, Math.PI * 2);
  ctx.fill();

  // Long curly poodle ears
  [-16, 16].forEach((ex) => {
    ctx.beginPath();
    ctx.ellipse(ex, -10, 8, 22, ex > 0 ? 0.2 : -0.2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Friendly black eyes
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(-7, -16, 3, 0, Math.PI * 2);
  ctx.arc(7, -16, 3, 0, Math.PI * 2);
  ctx.fill();

  // Black nose
  ctx.beginPath();
  ctx.arc(0, -8, 4, 0, Math.PI * 2);
  ctx.fill();

  // Smiling mouth
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -4, 5, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Silver Tray with 2 champagne flutes
  ctx.save();
  ctx.translate(28, 6);
  ctx.fillStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Two Flutes with sparkling amber liquid
  [-8, 8].forEach((fx) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(fx - 4, -18, 8, 16);
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(fx - 3, -12, 6, 10);
  });
  ctx.restore();

  ctx.restore();
}
