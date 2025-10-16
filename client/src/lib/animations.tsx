import React from 'react';

// Animation Classes
export const AnimationClasses = {
  // Fade animations
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  fadeInUp: 'animate-fade-in-up',
  fadeInDown: 'animate-fade-in-down',
  fadeInLeft: 'animate-fade-in-left',
  fadeInRight: 'animate-fade-in-right',
  
  // Scale animations
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',
  scaleUp: 'animate-scale-up',
  scaleDown: 'animate-scale-down',
  
  // Slide animations
  slideInUp: 'animate-slide-in-up',
  slideInDown: 'animate-slide-in-down',
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  
  // Bounce animations
  bounce: 'animate-bounce',
  bounceIn: 'animate-bounce-in',
  bounceOut: 'animate-bounce-out',
  
  // Pulse animations
  pulse: 'animate-pulse',
  pulseSlow: 'animate-pulse-slow',
  pulseFast: 'animate-pulse-fast',
  
  // Spin animations
  spin: 'animate-spin',
  spinSlow: 'animate-spin-slow',
  spinFast: 'animate-spin-fast',
  
  // Shake animations
  shake: 'animate-shake',
  shakeHorizontal: 'animate-shake-horizontal',
  shakeVertical: 'animate-shake-vertical',
  
  // Wiggle animations
  wiggle: 'animate-wiggle',
  wiggleSlow: 'animate-wiggle-slow',
  wiggleFast: 'animate-wiggle-fast',
  
  // Float animations
  float: 'animate-float',
  floatSlow: 'animate-float-slow',
  floatFast: 'animate-float-fast',
  
  // Glow animations
  glow: 'animate-glow',
  glowSlow: 'animate-glow-slow',
  glowFast: 'animate-glow-fast',
  
  // Gradient animations
  gradient: 'animate-gradient',
  gradientSlow: 'animate-gradient-slow',
  gradientFast: 'animate-gradient-fast',
  
  // Typing animations
  typing: 'animate-typing',
  typingSlow: 'animate-typing-slow',
  typingFast: 'animate-typing-fast',
  
  // Loading animations
  loading: 'animate-loading',
  loadingDots: 'animate-loading-dots',
  loadingSpinner: 'animate-loading-spinner',
  loadingBars: 'animate-loading-bars',
  
  // Hover animations
  hoverLift: 'hover:animate-lift',
  hoverGlow: 'hover:animate-glow',
  hoverPulse: 'hover:animate-pulse',
  hoverBounce: 'hover:animate-bounce',
  hoverWiggle: 'hover:animate-wiggle',
  hoverShake: 'hover:animate-shake',
  hoverFloat: 'hover:animate-float',
  hoverScale: 'hover:animate-scale-up',
  hoverRotate: 'hover:animate-rotate',
  hoverSkew: 'hover:animate-skew',
  
  // Focus animations
  focusGlow: 'focus:animate-glow',
  focusPulse: 'focus:animate-pulse',
  focusScale: 'focus:animate-scale-up',
  focusBounce: 'focus:animate-bounce',
  
  // Active animations
  activeScale: 'active:animate-scale-down',
  activeBounce: 'active:animate-bounce',
  activePulse: 'active:animate-pulse',
  activeGlow: 'active:animate-glow',
  
  // Transition animations
  transitionAll: 'transition-all duration-200',
  transitionFast: 'transition-all duration-100',
  transitionSlow: 'transition-all duration-300',
  transitionVerySlow: 'transition-all duration-500',
  
  // Transform animations
  transformHover: 'hover:transform hover:scale-105',
  transformActive: 'active:transform active:scale-95',
  transformFocus: 'focus:transform focus:scale-105',
  
  // Opacity animations
  opacityHover: 'hover:opacity-80',
  opacityActive: 'active:opacity-60',
  opacityFocus: 'focus:opacity-90',
  
  // Shadow animations
  shadowHover: 'hover:shadow-lg',
  shadowActive: 'active:shadow-sm',
  shadowFocus: 'focus:shadow-md',
  
  // Color animations
  colorHover: 'hover:text-blue-600',
  colorActive: 'active:text-blue-800',
  colorFocus: 'focus:text-blue-700',
  
  // Background animations
  bgHover: 'hover:bg-blue-50',
  bgActive: 'active:bg-blue-100',
  bgFocus: 'focus:bg-blue-50',
  
  // Border animations
  borderHover: 'hover:border-blue-300',
  borderActive: 'active:border-blue-400',
  borderFocus: 'focus:border-blue-500',
  
  // Ring animations
  ringHover: 'hover:ring-2 hover:ring-blue-200',
  ringActive: 'active:ring-4 active:ring-blue-300',
  ringFocus: 'focus:ring-2 focus:ring-blue-500',
  
  // Gradient animations
  gradientHover: 'hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600',
  gradientActive: 'active:bg-gradient-to-r active:from-blue-600 active:to-purple-700',
  gradientFocus: 'focus:bg-gradient-to-r focus:from-blue-500 focus:to-purple-600',
  
  // Text animations
  textHover: 'hover:text-blue-600',
  textActive: 'active:text-blue-800',
  textFocus: 'focus:text-blue-700',
  
  // Icon animations
  iconHover: 'hover:rotate-12',
  iconActive: 'active:rotate-0',
  iconFocus: 'focus:rotate-6',
  
  // Button animations
  buttonHover: 'hover:transform hover:scale-105 hover:shadow-lg',
  buttonActive: 'active:transform active:scale-95',
  buttonFocus: 'focus:transform focus:scale-105 focus:shadow-md',
  
  // Card animations
  cardHover: 'hover:transform hover:scale-102 hover:shadow-xl',
  cardActive: 'active:transform active:scale-98',
  cardFocus: 'focus:transform focus:scale-102 focus:shadow-lg',
  
  // Modal animations
  modalEnter: 'animate-fade-in-up',
  modalExit: 'animate-fade-out-down',
  modalBackdrop: 'animate-fade-in',
  
  // Toast animations
  toastEnter: 'animate-slide-in-right',
  toastExit: 'animate-slide-out-right',
  toastProgress: 'animate-progress',
  
  // Dropdown animations
  dropdownEnter: 'animate-fade-in-down',
  dropdownExit: 'animate-fade-out-up',
  dropdownItem: 'hover:animate-pulse',
  
  // Tooltip animations
  tooltipEnter: 'animate-fade-in-up',
  tooltipExit: 'animate-fade-out-down',
  tooltipArrow: 'animate-bounce',
  
  // Progress animations
  progressBar: 'animate-progress-bar',
  progressCircle: 'animate-progress-circle',
  progressDots: 'animate-progress-dots',
  
  // Skeleton animations
  skeleton: 'animate-skeleton',
  skeletonWave: 'animate-skeleton-wave',
  skeletonPulse: 'animate-skeleton-pulse',
  
  // Loading animations
  loadingSpinner: 'animate-spin',
  loadingDots: 'animate-loading-dots',
  loadingBars: 'animate-loading-bars',
  loadingCircle: 'animate-loading-circle',
  
  // Success animations
  successCheck: 'animate-success-check',
  successBounce: 'animate-success-bounce',
  successGlow: 'animate-success-glow',
  
  // Error animations
  errorShake: 'animate-error-shake',
  errorPulse: 'animate-error-pulse',
  errorGlow: 'animate-error-glow',
  
  // Warning animations
  warningPulse: 'animate-warning-pulse',
  warningGlow: 'animate-warning-glow',
  warningBounce: 'animate-warning-bounce',
  
  // Info animations
  infoPulse: 'animate-info-pulse',
  infoGlow: 'animate-info-glow',
  infoBounce: 'animate-info-bounce',
  
  // Custom animations
  custom1: 'animate-custom-1',
  custom2: 'animate-custom-2',
  custom3: 'animate-custom-3',
  custom4: 'animate-custom-4',
  custom5: 'animate-custom-5',
};

// Animation Duration Classes
export const AnimationDurations = {
  fast: 'duration-100',
  normal: 'duration-200',
  slow: 'duration-300',
  verySlow: 'duration-500',
  ultraSlow: 'duration-1000',
};

// Animation Delay Classes
export const AnimationDelays = {
  none: 'delay-0',
  fast: 'delay-100',
  normal: 'delay-200',
  slow: 'delay-300',
  verySlow: 'delay-500',
  ultraSlow: 'delay-1000',
};

// Animation Easing Classes
export const AnimationEasing = {
  linear: 'ease-linear',
  in: 'ease-in',
  out: 'ease-out',
  inOut: 'ease-in-out',
  bounce: 'ease-bounce',
  elastic: 'ease-elastic',
  back: 'ease-back',
  cubic: 'ease-cubic',
  quart: 'ease-quart',
  quint: 'ease-quint',
  sine: 'ease-sine',
  expo: 'ease-expo',
  circ: 'ease-circ',
};

// Animation Direction Classes
export const AnimationDirections = {
  normal: 'animate-normal',
  reverse: 'animate-reverse',
  alternate: 'animate-alternate',
  alternateReverse: 'animate-alternate-reverse',
};

// Animation Fill Mode Classes
export const AnimationFillModes = {
  none: 'animate-fill-none',
  forwards: 'animate-fill-forwards',
  backwards: 'animate-fill-backwards',
  both: 'animate-fill-both',
};

// Animation Iteration Count Classes
export const AnimationIterations = {
  once: 'animate-once',
  twice: 'animate-twice',
  infinite: 'animate-infinite',
  custom: 'animate-custom',
};

// Animation Play State Classes
export const AnimationPlayStates = {
  running: 'animate-running',
  paused: 'animate-paused',
};

// Animation Timing Function Classes
export const AnimationTimingFunctions = {
  linear: 'animate-timing-linear',
  ease: 'animate-timing-ease',
  easeIn: 'animate-timing-ease-in',
  easeOut: 'animate-timing-ease-out',
  easeInOut: 'animate-timing-ease-in-out',
  stepStart: 'animate-timing-step-start',
  stepEnd: 'animate-timing-step-end',
  cubicBezier: 'animate-timing-cubic-bezier',
};

// Animation Keyframes Classes
export const AnimationKeyframes = {
  fadeIn: 'animate-keyframes-fade-in',
  fadeOut: 'animate-keyframes-fade-out',
  slideIn: 'animate-keyframes-slide-in',
  slideOut: 'animate-keyframes-slide-out',
  scaleIn: 'animate-keyframes-scale-in',
  scaleOut: 'animate-keyframes-scale-out',
  rotateIn: 'animate-keyframes-rotate-in',
  rotateOut: 'animate-keyframes-rotate-out',
  bounceIn: 'animate-keyframes-bounce-in',
  bounceOut: 'animate-keyframes-bounce-out',
  zoomIn: 'animate-keyframes-zoom-in',
  zoomOut: 'animate-keyframes-zoom-out',
  flipIn: 'animate-keyframes-flip-in',
  flipOut: 'animate-keyframes-flip-out',
  rollIn: 'animate-keyframes-roll-in',
  rollOut: 'animate-keyframes-roll-out',
  lightSpeedIn: 'animate-keyframes-light-speed-in',
  lightSpeedOut: 'animate-keyframes-light-speed-out',
  hinge: 'animate-keyframes-hinge',
  jackInTheBox: 'animate-keyframes-jack-in-the-box',
  jello: 'animate-keyframes-jello',
  rubberBand: 'animate-keyframes-rubber-band',
  shake: 'animate-keyframes-shake',
  swing: 'animate-keyframes-swing',
  tada: 'animate-keyframes-tada',
  wobble: 'animate-keyframes-wobble',
  pulse: 'animate-keyframes-pulse',
  heartBeat: 'animate-keyframes-heart-beat',
  headShake: 'animate-keyframes-head-shake',
  flash: 'animate-keyframes-flash',
  flip: 'animate-keyframes-flip',
  slideInUp: 'animate-keyframes-slide-in-up',
  slideInDown: 'animate-keyframes-slide-in-down',
  slideInLeft: 'animate-keyframes-slide-in-left',
  slideInRight: 'animate-keyframes-slide-in-right',
  slideOutUp: 'animate-keyframes-slide-out-up',
  slideOutDown: 'animate-keyframes-slide-out-down',
  slideOutLeft: 'animate-keyframes-slide-out-left',
  slideOutRight: 'animate-keyframes-slide-out-right',
  zoomInUp: 'animate-keyframes-zoom-in-up',
  zoomInDown: 'animate-keyframes-zoom-in-down',
  zoomInLeft: 'animate-keyframes-zoom-in-left',
  zoomInRight: 'animate-keyframes-zoom-in-right',
  zoomOutUp: 'animate-keyframes-zoom-out-up',
  zoomOutDown: 'animate-keyframes-zoom-out-down',
  zoomOutLeft: 'animate-keyframes-zoom-out-left',
  zoomOutRight: 'animate-keyframes-zoom-out-right',
  rotateInUpLeft: 'animate-keyframes-rotate-in-up-left',
  rotateInUpRight: 'animate-keyframes-rotate-in-up-right',
  rotateInDownLeft: 'animate-keyframes-rotate-in-down-left',
  rotateInDownRight: 'animate-keyframes-rotate-in-down-right',
  rotateOutUpLeft: 'animate-keyframes-rotate-out-up-left',
  rotateOutUpRight: 'animate-keyframes-rotate-out-up-right',
  rotateOutDownLeft: 'animate-keyframes-rotate-out-down-left',
  rotateOutDownRight: 'animate-keyframes-rotate-out-down-right',
  flipInX: 'animate-keyframes-flip-in-x',
  flipInY: 'animate-keyframes-flip-in-y',
  flipOutX: 'animate-keyframes-flip-out-x',
  flipOutY: 'animate-keyframes-flip-out-y',
  lightSpeedInLeft: 'animate-keyframes-light-speed-in-left',
  lightSpeedInRight: 'animate-keyframes-light-speed-in-right',
  lightSpeedOutLeft: 'animate-keyframes-light-speed-out-left',
  lightSpeedOutRight: 'animate-keyframes-light-speed-out-right',
  rollInLeft: 'animate-keyframes-roll-in-left',
  rollInRight: 'animate-keyframes-roll-in-right',
  rollOutLeft: 'animate-keyframes-roll-out-left',
  rollOutRight: 'animate-keyframes-roll-out-right',
  jackInTheBoxLeft: 'animate-keyframes-jack-in-the-box-left',
  jackInTheBoxRight: 'animate-keyframes-jack-in-the-box-right',
  jackInTheBoxUp: 'animate-keyframes-jack-in-the-box-up',
  jackInTheBoxDown: 'animate-keyframes-jack-in-the-box-down',
  jelloLeft: 'animate-keyframes-jello-left',
  jelloRight: 'animate-keyframes-jello-right',
  jelloUp: 'animate-keyframes-jello-up',
  jelloDown: 'animate-keyframes-jello-down',
  rubberBandLeft: 'animate-keyframes-rubber-band-left',
  rubberBandRight: 'animate-keyframes-rubber-band-right',
  rubberBandUp: 'animate-keyframes-rubber-band-up',
  rubberBandDown: 'animate-keyframes-rubber-band-down',
  shakeLeft: 'animate-keyframes-shake-left',
  shakeRight: 'animate-keyframes-shake-right',
  shakeUp: 'animate-keyframes-shake-up',
  shakeDown: 'animate-keyframes-shake-down',
  swingLeft: 'animate-keyframes-swing-left',
  swingRight: 'animate-keyframes-swing-right',
  swingUp: 'animate-keyframes-swing-up',
  swingDown: 'animate-keyframes-swing-down',
  tadaLeft: 'animate-keyframes-tada-left',
  tadaRight: 'animate-keyframes-tada-right',
  tadaUp: 'animate-keyframes-tada-up',
  tadaDown: 'animate-keyframes-tada-down',
  wobbleLeft: 'animate-keyframes-wobble-left',
  wobbleRight: 'animate-keyframes-wobble-right',
  wobbleUp: 'animate-keyframes-wobble-up',
  wobbleDown: 'animate-keyframes-wobble-down',
  pulseLeft: 'animate-keyframes-pulse-left',
  pulseRight: 'animate-keyframes-pulse-right',
  pulseUp: 'animate-keyframes-pulse-up',
  pulseDown: 'animate-keyframes-pulse-down',
  heartBeatLeft: 'animate-keyframes-heart-beat-left',
  heartBeatRight: 'animate-keyframes-heart-beat-right',
  heartBeatUp: 'animate-keyframes-heart-beat-up',
  heartBeatDown: 'animate-keyframes-heart-beat-down',
  headShakeLeft: 'animate-keyframes-head-shake-left',
  headShakeRight: 'animate-keyframes-head-shake-right',
  headShakeUp: 'animate-keyframes-head-shake-up',
  headShakeDown: 'animate-keyframes-head-shake-down',
  flashLeft: 'animate-keyframes-flash-left',
  flashRight: 'animate-keyframes-flash-right',
  flashUp: 'animate-keyframes-flash-up',
  flashDown: 'animate-keyframes-flash-down',
  flipLeft: 'animate-keyframes-flip-left',
  flipRight: 'animate-keyframes-flip-right',
  flipUp: 'animate-keyframes-flip-up',
  flipDown: 'animate-keyframes-flip-down',
};

// Animation Utility Functions
export const createAnimation = (
  type: keyof typeof AnimationClasses,
  duration: keyof typeof AnimationDurations = 'normal',
  delay: keyof typeof AnimationDelays = 'none',
  easing: keyof typeof AnimationEasing = 'ease',
  direction: keyof typeof AnimationDirections = 'normal',
  fillMode: keyof typeof AnimationFillModes = 'both',
  iterationCount: keyof typeof AnimationIterations = 'once',
  playState: keyof typeof AnimationPlayStates = 'running',
  timingFunction: keyof typeof AnimationTimingFunctions = 'ease',
  keyframes: keyof typeof AnimationKeyframes = 'fadeIn'
) => {
  return [
    AnimationClasses[type],
    AnimationDurations[duration],
    AnimationDelays[delay],
    AnimationEasing[easing],
    AnimationDirections[direction],
    AnimationFillModes[fillMode],
    AnimationIterations[iterationCount],
    AnimationPlayStates[playState],
    AnimationTimingFunctions[timingFunction],
    AnimationKeyframes[keyframes]
  ].join(' ');
};

// Animation Hook
export const useAnimation = (
  type: keyof typeof AnimationClasses,
  duration: keyof typeof AnimationDurations = 'normal',
  delay: keyof typeof AnimationDelays = 'none',
  easing: keyof typeof AnimationEasing = 'ease',
  direction: keyof typeof AnimationDirections = 'normal',
  fillMode: keyof typeof AnimationFillModes = 'both',
  iterationCount: keyof typeof AnimationIterations = 'once',
  playState: keyof typeof AnimationPlayStates = 'running',
  timingFunction: keyof typeof AnimationTimingFunctions = 'ease',
  keyframes: keyof typeof AnimationKeyframes = 'fadeIn'
) => {
  return createAnimation(
    type,
    duration,
    delay,
    easing,
    direction,
    fillMode,
    iterationCount,
    playState,
    timingFunction,
    keyframes
  );
};

// Animation Component
export const AnimatedComponent: React.FC<{
  children: React.ReactNode;
  animation: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}> = ({
  children,
  animation,
  className = '',
  style = {},
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur
}) => {
  return (
    <div
      className={`${animation} ${className}`}
      style={style}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {children}
    </div>
  );
};

// Animation Presets
export const AnimationPresets = {
  // Button animations
  buttonHover: createAnimation('hoverLift', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  buttonClick: createAnimation('activeScale', 'fast', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  buttonFocus: createAnimation('focusGlow', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  
  // Card animations
  cardHover: createAnimation('cardHover', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  cardClick: createAnimation('cardActive', 'fast', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  cardFocus: createAnimation('cardFocus', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  
  // Modal animations
  modalEnter: createAnimation('modalEnter', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  modalExit: createAnimation('modalExit', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeOut'),
  modalBackdrop: createAnimation('modalBackdrop', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  
  // Toast animations
  toastEnter: createAnimation('toastEnter', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'slideIn'),
  toastExit: createAnimation('toastExit', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'slideOut'),
  toastProgress: createAnimation('toastProgress', 'slow', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  
  // Dropdown animations
  dropdownEnter: createAnimation('dropdownEnter', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  dropdownExit: createAnimation('dropdownExit', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeOut'),
  dropdownItem: createAnimation('dropdownItem', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  
  // Tooltip animations
  tooltipEnter: createAnimation('tooltipEnter', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  tooltipExit: createAnimation('tooltipExit', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeOut'),
  tooltipArrow: createAnimation('tooltipArrow', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'bounce'),
  
  // Progress animations
  progressBar: createAnimation('progressBar', 'slow', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  progressCircle: createAnimation('progressCircle', 'slow', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  progressDots: createAnimation('progressDots', 'normal', 'none', 'ease', 'normal', 'both', 'infinite', 'running', 'ease', 'fadeIn'),
  
  // Skeleton animations
  skeleton: createAnimation('skeleton', 'normal', 'none', 'ease', 'normal', 'both', 'infinite', 'running', 'ease', 'fadeIn'),
  skeletonWave: createAnimation('skeletonWave', 'normal', 'none', 'ease', 'normal', 'both', 'infinite', 'running', 'ease', 'fadeIn'),
  skeletonPulse: createAnimation('skeletonPulse', 'normal', 'none', 'ease', 'normal', 'both', 'infinite', 'running', 'ease', 'fadeIn'),
  
  // Loading animations
  loadingSpinner: createAnimation('loadingSpinner', 'normal', 'none', 'ease', 'normal', 'both', 'infinite', 'running', 'ease', 'fadeIn'),
  loadingDots: createAnimation('loadingDots', 'normal', 'none', 'ease', 'normal', 'both', 'infinite', 'running', 'ease', 'fadeIn'),
  loadingBars: createAnimation('loadingBars', 'normal', 'none', 'ease', 'normal', 'both', 'infinite', 'running', 'ease', 'fadeIn'),
  loadingCircle: createAnimation('loadingCircle', 'normal', 'none', 'ease', 'normal', 'both', 'infinite', 'running', 'ease', 'fadeIn'),
  
  // Success animations
  successCheck: createAnimation('successCheck', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  successBounce: createAnimation('successBounce', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'bounce'),
  successGlow: createAnimation('successGlow', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  
  // Error animations
  errorShake: createAnimation('errorShake', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'shake'),
  errorPulse: createAnimation('errorPulse', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'pulse'),
  errorGlow: createAnimation('errorGlow', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  
  // Warning animations
  warningPulse: createAnimation('warningPulse', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'pulse'),
  warningGlow: createAnimation('warningGlow', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  warningBounce: createAnimation('warningBounce', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'bounce'),
  
  // Info animations
  infoPulse: createAnimation('infoPulse', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'pulse'),
  infoGlow: createAnimation('infoGlow', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'fadeIn'),
  infoBounce: createAnimation('infoBounce', 'normal', 'none', 'ease', 'normal', 'both', 'once', 'running', 'ease', 'bounce'),
};

// Export all animation utilities
export default {
  AnimationClasses,
  AnimationDurations,
  AnimationDelays,
  AnimationEasing,
  AnimationDirections,
  AnimationFillModes,
  AnimationIterations,
  AnimationPlayStates,
  AnimationTimingFunctions,
  AnimationKeyframes,
  createAnimation,
  useAnimation,
  AnimatedComponent,
  AnimationPresets
};
