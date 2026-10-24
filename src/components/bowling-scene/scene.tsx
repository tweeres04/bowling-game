"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useEffectEvent, useMemo, useRef } from "react";
import * as THREE from "three";
import type { SceneView } from "@/lib/scene-view";

// On: rendered at a fraction of screen resolution and scaled up with crisp
// pixels, to match the pixel art icon. Off: sharp and antialiased.
const PIXEL_ART = true;
const PIXEL_SCALE = 0.25;

// Shorter than a real lane so the bowler isn't tiny when the whole lane has
// to fit across a narrow phone screen
const LANE_LENGTH = 8;
const LANE_WIDTH = 1.05;
const BALL_RADIUS = 0.11;

// One throw, in seconds: approach, swing, release, and roll to the pins,
// then the bowler snaps back to the start. Fits inside auto mode's 4 second
// interval.
const RELEASE_AT = 1.15;
const ROLL_TIME = 1.8;
const THROW_LENGTH = RELEASE_AT + ROLL_TIME;
// Knocked pins fly for this long after the ball arrives, then the rack resets
const PIN_FLIGHT = 0.9;
const GRAVITY = -9.8;

const COLORS = {
  lane: "#c98f56",
  approach: "#a8743f",
  gutter: "#3a3f55",
  pinDeck: "#1b2236",
  pin: "#f4f1ea",
  pinStripe: "#d83a3a",
  shirt: "#e0552b",
  pants: "#2b3148",
  skin: "#e9b48c",
  hair: "#3a2a20",
  shoes: "#f2f2f2",
  ball: "#2f5fd8",
};

type Keyframes = [time: number, value: number][];

// Eased value between the keyframes around t; holds the ends past either side
function sample(frames: Keyframes, t: number) {
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    const [endTime, endValue] = frames[i];
    if (t <= endTime) {
      const [startTime, startValue] = frames[i - 1];
      const progress = (t - startTime) / (endTime - startTime);
      const eased = progress * progress * (3 - 2 * progress);
      return startValue + (endValue - startValue) * eased;
    }
  }
  return frames[frames.length - 1][1];
}

// Rotations are radians. Positive arm and leg angles swing toward the pins;
// negative lean tips the upper body forward.
const POSES = {
  z: [
    [0, 2.4],
    [1.0, 1.0],
    [1.3, 0.7],
  ],
  rightArm: [
    [0, 0.3],
    [0.25, 0.7],
    [0.8, -1.5],
    [1.2, 0.4],
    [1.4, 1.6],
  ],
  leftArm: [
    [0, 0],
    [1.0, -0.3],
    [1.25, -1.1],
  ],
  lean: [
    [0, 0],
    [0.9, -0.15],
    [1.25, -0.5],
  ],
  leftLeg: [
    [0, 0],
    [0.25, 0.45],
    [0.5, -0.45],
    [0.75, 0.45],
    [1.05, 0.5],
  ],
  rightLeg: [
    [0, 0],
    [0.25, -0.45],
    [0.5, 0.45],
    [0.75, -0.45],
    [1.05, -0.8],
  ],
} satisfies Record<string, Keyframes>;

// Cel shading: light snaps to these three brightness bands (shadow, mid,
// lit) instead of blending smoothly. Nearest filtering keeps the steps hard.
const TOON_BANDS = (() => {
  const texture = new THREE.DataTexture(
    new Uint8Array([90, 170, 255]),
    3,
    1,
    THREE.RedFormat,
  );
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
})();

// Toon everywhere: no smooth shading or shiny highlights anywhere in the scene
function Material({ color }: { color: string }) {
  return <meshToonMaterial color={color} gradientMap={TOON_BANDS} />;
}

// Comic book outline thickness, in scene units. A fixed thickness (rather
// than scaling each part) keeps thin arms from getting hairline outlines.
const OUTLINE = 0.05;

type Shape =
  | { box: [width: number, height: number, depth: number] }
  | { gem: number; detail: number };

function ShapeGeometry({ shape, grow = 0 }: { shape: Shape; grow?: number }) {
  if ("box" in shape) {
    const [width, height, depth] = shape.box;
    return (
      <boxGeometry
        args={[width + grow * 2, height + grow * 2, depth + grow * 2]}
      />
    );
  }
  return <icosahedronGeometry args={[shape.gem + grow, shape.detail]} />;
}

// The "inverted hull" trick: a slightly bigger black copy that only draws its
// inside faces, so it peeks out around the edges as an outline
// Stencil value the head writes, so the hair's outline can skip his face
const FACE_MASK = 1;

function OutlinedPart({
  shape,
  color,
  position,
  ref,
  masksFace = false,
  outlineSkipsFace = false,
}: {
  shape: Shape;
  color: string;
  position?: [number, number, number];
  ref?: React.Ref<THREE.Mesh>;
  // Marks this part's pixels as face, for outlineSkipsFace
  masksFace?: boolean;
  // Keeps this part's outline from drawing over the face, where an
  // overlapping shell would otherwise show as a line across it
  outlineSkipsFace?: boolean;
}) {
  return (
    <mesh ref={ref} position={position}>
      <ShapeGeometry shape={shape} />
      {masksFace ? (
        <meshToonMaterial
          color={color}
          gradientMap={TOON_BANDS}
          stencilWrite
          stencilRef={FACE_MASK}
          stencilZPass={THREE.ReplaceStencilOp}
        />
      ) : (
        <Material color={color} />
      )}
      {/* Drawn after everything else when it has to check the face mask */}
      <mesh renderOrder={outlineSkipsFace ? 1 : 0}>
        <ShapeGeometry shape={shape} grow={OUTLINE} />
        <meshBasicMaterial
          color="black"
          side={THREE.BackSide}
          stencilWrite={outlineSkipsFace}
          stencilRef={FACE_MASK}
          stencilFunc={THREE.NotEqualStencilFunc}
        />
      </mesh>
    </mesh>
  );
}

function Lane() {
  return (
    <group>
      <mesh position={[0, -0.05, -LANE_LENGTH / 2]}>
        <boxGeometry args={[LANE_WIDTH, 0.1, LANE_LENGTH]} />
        <Material color={COLORS.lane} />
      </mesh>
      <mesh position={[0, -0.05, 1.6]}>
        <boxGeometry args={[LANE_WIDTH + 0.6, 0.1, 3.2]} />
        <Material color={COLORS.approach} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (LANE_WIDTH / 2 + 0.13), -0.08, -LANE_LENGTH / 2]}
        >
          <boxGeometry args={[0.26, 0.1, LANE_LENGTH]} />
          <Material color={COLORS.gutter} />
        </mesh>
      ))}
      <mesh position={[0, 0.6, -LANE_LENGTH - 1.2]}>
        <boxGeometry args={[LANE_WIDTH + 1, 1.4, 0.2]} />
        <Material color={COLORS.pinDeck} />
      </mesh>
    </group>
  );
}

// Head pin first, then rows of 2, 3 and 4 behind it
const PIN_SPOTS = [0, 1, 2, 3].flatMap((row) =>
  Array.from({ length: row + 1 }, (_, index) => ({
    row,
    position: new THREE.Vector3(
      (index - row / 2) * 0.3,
      0,
      -LANE_LENGTH + 0.6 - row * 0.26,
    ),
  })),
);

// Which pins go down first for a given count: the head pin, then working back
// through the pocket a right hander hits (indexes into PIN_SPOTS)
const KNOCK_ORDER = [0, 2, 1, 4, 5, 3, 8, 7, 9, 6];

type PinFlight = { velocity: THREE.Vector3; spin: THREE.Vector3 };

// Launches pins up and away from the head pin, with a random tumble
function launchPins(pinsDown: number): (PinFlight | null)[] {
  const knocked = new Set(KNOCK_ORDER.slice(0, pinsDown));
  const impact = PIN_SPOTS[0].position;
  return PIN_SPOTS.map(({ position }, index) => {
    if (!knocked.has(index)) return null;
    const away = new THREE.Vector2(
      position.x - impact.x + (Math.random() - 0.5) * 0.3,
      position.z - impact.z - 0.3,
    ).normalize();
    const speed = 1.5 + Math.random() * 1.5;
    return {
      velocity: new THREE.Vector3(
        away.x * speed,
        3.5 + Math.random() * 2,
        away.y * speed,
      ),
      spin: new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 20,
      ),
    };
  });
}

function Pins({
  throwStart,
  flights,
}: {
  throwStart: React.RefObject<number>;
  flights: React.RefObject<(PinFlight | null)[]>;
}) {
  // Low segment count keeps the faceted look
  const pinGeometry = useMemo(() => {
    const profile = [
      [0, 0],
      [0.05, 0],
      [0.06, 0.08],
      [0.06, 0.14],
      [0.035, 0.24],
      [0.03, 0.28],
      [0.045, 0.33],
      [0.03, 0.38],
      [0, 0.38],
    ].map(([radius, height]) => new THREE.Vector2(radius, height));
    return new THREE.LatheGeometry(profile, 8);
  }, []);
  const pins = useRef<(THREE.Group | null)[]>([]);

  useFrame((state) => {
    const t = performance.now() / 1000 - throwStart.current;
    const resetAt = THROW_LENGTH + PIN_FLIGHT;

    PIN_SPOTS.forEach(({ row, position }, index) => {
      const pin = pins.current[index]!;
      const flight = flights.current[index];
      // Back rows get hit a beat after the front
      const airborne = t - THROW_LENGTH - row * 0.05;
      if (!flight || t >= resetAt || airborne < 0) {
        pin.position.copy(position);
        pin.rotation.set(0, 0, 0);
        return;
      }
      // Frozen where it lands, so it doesn't fall through the lane
      const landsAt = (2 * flight.velocity.y) / -GRAVITY;
      const flying = Math.min(airborne, landsAt);
      pin.position.set(
        position.x + flight.velocity.x * flying,
        position.y +
          flight.velocity.y * flying +
          0.5 * GRAVITY * flying * flying,
        position.z + flight.velocity.z * flying,
      );
      pin.rotation.set(
        flight.spin.x * flying,
        flight.spin.y * flying,
        flight.spin.z * flying,
      );
    });

    if (t < resetAt) state.invalidate();
  });

  return PIN_SPOTS.map(({ position }, index) => (
    <group
      key={index}
      ref={(pin) => {
        pins.current[index] = pin;
      }}
      position={position}
    >
      <mesh geometry={pinGeometry}>
        <Material color={COLORS.pin} />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 0.02, 8]} />
        <Material color={COLORS.pinStripe} />
      </mesh>
    </group>
  ));
}

// Plays one throw each time shotKey changes, skipping the first render, and
// knocks down as many pins as the shot did
function Throw({
  shotKey,
  pinsDown,
}: {
  shotKey: number | null;
  pinsDown: number;
}) {
  // Seconds from the browser's clock, not three's: three's clock only
  // advances when a frame draws, and frames stop between throws. Starts far
  // in the past, so everything waits in its resting pose.
  const throwStart = useRef(-Infinity);
  const flights = useRef<(PinFlight | null)[]>([]);
  const previousKey = useRef(shotKey);
  const invalidate = useThree((state) => state.invalidate);

  const startThrow = useEffectEvent(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    flights.current = launchPins(pinsDown);
    throwStart.current = performance.now() / 1000;
    invalidate();
  });

  useEffect(() => {
    if (shotKey === previousKey.current) return;
    previousKey.current = shotKey;
    startThrow();
  }, [shotKey]);

  return (
    <>
      <Pins throwStart={throwStart} flights={flights} />
      <Bowler throwStart={throwStart} />
    </>
  );
}

function Limb({
  size,
  color,
}: {
  size: [number, number, number];
  color: string;
}) {
  // Hangs down from its pivot, so rotating the parent group swings it
  return (
    <OutlinedPart
      shape={{ box: size }}
      color={color}
      position={[0, -size[1] / 2, 0]}
    />
  );
}

function Bowler({ throwStart }: { throwStart: React.RefObject<number> }) {
  const bowler = useRef<THREE.Group>(null);
  const upperBody = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const hand = useRef<THREE.Object3D>(null);
  const ball = useRef<THREE.Mesh>(null);
  const releasePoint = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const t = performance.now() / 1000 - throwStart.current;
    // Once the ball reaches the pins, snap back to the starting pose
    const poseTime = t < THROW_LENGTH ? t : 0;

    bowler.current!.position.z = sample(POSES.z, poseTime);
    upperBody.current!.rotation.x = sample(POSES.lean, poseTime);
    rightArm.current!.rotation.x = sample(POSES.rightArm, poseTime);
    leftArm.current!.rotation.z = sample(POSES.leftArm, poseTime);
    leftLeg.current!.rotation.x = sample(POSES.leftLeg, poseTime);
    rightLeg.current!.rotation.x = sample(POSES.rightLeg, poseTime);

    const ballMesh = ball.current!;
    const rollProgress = (t - RELEASE_AT) / ROLL_TIME;
    if (t < RELEASE_AT || t >= THROW_LENGTH) {
      // In hand: before the release, and back at the start after the roll
      bowler.current!.updateMatrixWorld();
      hand.current!.getWorldPosition(ballMesh.position);
      releasePoint.copy(ballMesh.position);
    } else {
      // Drops to the lane, then rolls to the pins with a little hook
      ballMesh.position.set(
        releasePoint.x * (1 - rollProgress) +
          Math.sin(rollProgress * Math.PI) * 0.12,
        BALL_RADIUS +
          Math.max(0, releasePoint.y - BALL_RADIUS) *
            Math.max(0, 1 - rollProgress * 8),
        releasePoint.z + (-LANE_LENGTH + 0.6 - releasePoint.z) * rollProgress,
      );
      ballMesh.rotation.x -= 0.4;
    }

    // Only keep drawing frames while the throw is playing
    if (t < THROW_LENGTH) state.invalidate();
  });

  return (
    <>
      <group ref={bowler} position={[-0.2, 0, POSES.z[0][1]]}>
        {[
          { ref: leftLeg, x: -0.1 },
          { ref: rightLeg, x: 0.1 },
        ].map(({ ref, x }) => (
          <group key={x} ref={ref} position={[x, 0.9, 0]}>
            <Limb size={[0.15, 0.82, 0.17]} color={COLORS.pants} />
            <OutlinedPart
              shape={{ box: [0.15, 0.08, 0.28] }}
              color={COLORS.shoes}
              position={[0, -0.86, -0.05]}
            />
          </group>
        ))}
        <group ref={upperBody} position={[0, 0.9, 0]}>
          <OutlinedPart
            shape={{ box: [0.42, 0.62, 0.24] }}
            color={COLORS.shirt}
            position={[0, 0.3, 0]}
          />
          <OutlinedPart
            shape={{ gem: 0.13, detail: 0 }}
            color={COLORS.skin}
            position={[0, 0.78, 0]}
            masksFace
          />
          <OutlinedPart
            shape={{ box: [0.22, 0.08, 0.22] }}
            color={COLORS.hair}
            position={[0, 0.88, 0.02]}
            outlineSkipsFace
          />
          <group ref={leftArm} position={[-0.27, 0.56, 0]}>
            <Limb size={[0.1, 0.62, 0.1]} color={COLORS.shirt} />
          </group>
          <group ref={rightArm} position={[0.27, 0.56, 0]}>
            <Limb size={[0.1, 0.62, 0.1]} color={COLORS.shirt} />
            <object3D ref={hand} position={[0, -0.7, -0.04]} />
          </group>
        </group>
      </group>
      <OutlinedPart
        ref={ball}
        shape={{ gem: BALL_RADIUS, detail: 1 }}
        color={COLORS.ball}
      />
    </>
  );
}

const CAMERA_FOV: Record<SceneView, number> = {
  side: 40,
  angled: 40,
  behind: 55,
};

// The side on views: how far the camera swings around toward the bowler's
// end (so he's a little closer and the pins recede), and how high it sits
// for each unit it backs away
const SIDE_ON_CAMERAS = {
  side: { swing: 0, rise: 0.12 },
  angled: { swing: THREE.MathUtils.degToRad(20), rise: 0.25 },
};

function SceneCamera({ view }: { view: SceneView }) {
  // Prop changes don't draw a frame on their own in demand mode
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => invalidate(), [view, invalidate]);

  useFrame((state) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    if (camera.fov !== CAMERA_FOV[view]) {
      camera.fov = CAMERA_FOV[view];
      camera.updateProjectionMatrix();
    }

    if (view === "behind") {
      // Behind and a little to the right of the bowler, looking down the lane
      camera.position.set(0.5, 2.3, 5.8);
      camera.lookAt(0, 0.4, -LANE_LENGTH / 2);
      return;
    }

    // Off the bowler's right side, so the lane runs left to right with the
    // bowler on the left and the pins on the right. Backs off far enough
    // that the whole lane fits the screen's width, whatever its shape.
    const { size } = state;
    const halfVertical = THREE.MathUtils.degToRad(camera.fov / 2);
    const halfHorizontal = Math.atan(
      Math.tan(halfVertical) * (size.width / size.height),
    );
    // From just behind the bowler's start to the back of the pin deck
    const nearEnd = 3.2;
    const farEnd = -LANE_LENGTH - 1.4;
    const centerZ = (nearEnd + farEnd) / 2;
    const distance = (nearEnd - farEnd) / 2 / Math.tan(halfHorizontal);
    const { swing, rise } = SIDE_ON_CAMERAS[view];
    camera.position.set(
      Math.cos(swing) * distance,
      1.5 + distance * rise,
      centerZ + Math.sin(swing) * distance,
    );
    camera.lookAt(0, 0.8, centerZ);
  });
  return null;
}

export default function BowlingScene({
  shotKey,
  pinsDown,
  view,
}: {
  shotKey: number | null;
  pinsDown: number;
  view: SceneView;
}) {
  return (
    <Canvas
      frameloop="demand"
      // Capped at 2x so high density phones don't render more than they need
      dpr={PIXEL_ART ? PIXEL_SCALE : [1, 2]}
      // Stencil for the face mask (three leaves it off by default)
      gl={{ antialias: !PIXEL_ART, stencil: true }}
      className={
        PIXEL_ART ? "[&_canvas]:[image-rendering:pixelated]" : undefined
      }
    >
      {/* Fill light is added evenly on top of the toon bands, so it stays low
          to keep the shadow band clearly darker. The key light is above and
          off to one side of each camera, so it sees lit faces with a shadow
          side. */}
      <hemisphereLight args={["#ffffff", "#445066", 0.5]} />
      <directionalLight
        position={view === "behind" ? [-3, 5, 3] : [5, 6, 3]}
        intensity={2.6}
      />
      <SceneCamera view={view} />
      <Lane />
      <Throw shotKey={shotKey} pinsDown={pinsDown} />
    </Canvas>
  );
}
