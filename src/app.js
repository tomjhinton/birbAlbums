/*For @sableRaph's weekly Creative Coding Challenge. The Challenge topic was Album Cover's.
Made a little model in blender, baked the texture. Loaded it with three.js. Uses cannon to do physics simulations. Generates a new albu cover if you click the counter. Band names layered over by creating a hidden Canvas element and using that as a texture within a glsl shader. New shaders created for each cover with some template literals to allow for pretending Math.random() is me being creative. Does have a very hacky and horrible musical element, just pretend it was mastered by Rashad Becker and released on PAN or whatever. That's done with Tone.js. Pretty sure I only used samples that come with Tidal so should be ok to stick wherever? 
*/



import './style.scss'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { gsap } from 'gsap'
import * as Tone from 'tone'


import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const canvas = document.querySelector('canvas.webgl')

import cannonDebugger from 'cannon-es-debugger'

const textureLoader = new THREE.TextureLoader()

const bakedTexture = textureLoader.load('bake2.jpg')

bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture,
  side: THREE.DoubleSide})

const birds = ['Crows','Peacocks','Doves','Sparrows','Geese','Ostriches','Pigeons','Turkeys']

const passio = new FontFace('Passio', 'url(Passio-Graphis.otf)')

const olondona = new FontFace('Olondona', 'url(Olondona.otf)')

const tapeworm = new FontFace('Tapeworm', 'url(Tapeworm-Regular.otf)')

const murmure = new FontFace('murmure', 'url(le-murmure.otf)')

const ferrite = new FontFace('ferrite', 'url(FerriteCoreDX-Regular.otf)')

const fontsL = [passio, olondona, tapeworm, murmure, ferrite]

const fonts = ['Passio', 'Olondona', 'Tapeworm', 'murmure', 'ferrite']




fontsL.map(x => {
  document.fonts.add(x)
})
const scene = new THREE.Scene()
const world = new CANNON.World()




//Desk

const halfExtents = new CANNON.Vec3(10.2, 5, 5)
const boxShape = new CANNON.Box(halfExtents)
const boxBody = new CANNON.Body({ mass: 0, shape: boxShape })
boxBody.position.y = -5
world.addBody(boxBody)


const recordPlayer = new CANNON.Vec3(2.3, 1.5, 2.3)
const playerShape = new CANNON.Box(recordPlayer)
const playerBody = new CANNON.Body({ mass: 0, shape: playerShape })
playerBody.position.x = -7.1
playerBody.position.y = -1.
playerBody.position.z = -.2
world.addBody(playerBody)

const meshDesk = new THREE.Mesh(new THREE.BoxGeometry(15.4, 10, 10), new THREE.MeshBasicMaterial())
meshDesk.position.y = -5
meshDesk.position.x = 3






// cannonDebugger(scene, world.bodies, )



// Loading Bar Stuff

const loadingBarElement = document.querySelector('.loading-bar')
const loadingBarText = document.querySelector('.loading-bar-text')
const loadingManager = new THREE.LoadingManager(
  // Loaded
  () =>{
    window.setTimeout(() =>{
      gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })

      loadingBarElement.classList.add('ended')
      loadingBarElement.style.transform = ''

      loadingBarText.classList.add('fade-out')

    }, 500)
  },

  // Progress
  (itemUrl, itemsLoaded, itemsTotal) =>{
    const progressRatio = itemsLoaded / itemsTotal
    loadingBarElement.style.transform = `scaleX(${progressRatio})`

  }
)

const gtlfLoader = new GLTFLoader(loadingManager)

const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
  depthWrite: false,
  uniforms:
    {
      uAlpha: { value: 1 }
    },
  transparent: true,
  vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
  fragmentShader: `
  uniform float uAlpha;
        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
})

const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)


const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}



//Resizing handler

window.addEventListener('resize', () =>{



  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2 ))


})




/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, .1, 2000)
camera.position.x = -15
camera.position.y = 20
camera.position.z = 45
scene.add(camera)




// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxPolarAngle = Math.PI / 2 - 0.1
//controls.enableZoom = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
})
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()



renderer.domElement.addEventListener( 'pointerup', onClick, false )


//Drop

function onClick(event) {
  event.preventDefault()

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1

  raycaster.setFromCamera( mouse, camera )

  var intersects = raycaster.intersectObjects( intersectsArr, true )

  if ( intersects.length > 0 ) {

    // console.log(intersects[0].point)
    createRecord(4, .15, 4, { x: intersects[0].point.x,
      y: (objectsToUpdate.length/10)+1,
      z: intersects[0].point.z
    })
  }



}
const objectsToUpdate = []

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

//Physics

//World

world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, -9.82, 0)

//Materials
const defaultMaterial = new CANNON.Material('default')


const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.2,
    restitution: 0.7
  }
)

world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial



const createRecord = (width, height, depth, position) =>{
  const mat = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff })

  const canvas = document.createElement('canvas')
  canvas.id = 'textBox'+objectsToUpdate.length
  canvas.width = 1000
  canvas.height = 1000
  canvas.style.display = 'none'
  document.body.appendChild(canvas)

  const textTexture = document.getElementById("textBox"+objectsToUpdate.length)



  const glslArr = [
    `triangleGrid(vUv, ${Math.random()}, ${Math.random() /1000},${Math.random() /100})`,

    `cnoise(uv * ${Math.random() * 50.})`,

    'hexf'
  ]



  const uvArr = [`brownConradyDistortion(vUv, ${Math.random() * 10.}, ${Math.random() * 10.})`,

    'vUv',

    `brownConradyDistortion(vUv, ${(Math.random() * 10. *-1.)}, ${Math.random() * 10.})`,

    `brownConradyDistortion(vUv, ${Math.random() * 10.}, ${(Math.random() * 10.) * -1.})`,

    'vUv',

    'vUv'

  ]

  var ctx = canvas.getContext('2d')
  ctx.fillStyle = 'white'
  let font = fonts[Math.floor(Math.random()* fonts.length)]

  ctx.font = '100px ' + font
  if(font === 'Tapeworm' || font === 'ferrite'){
    ctx.font = '70px ' + font
  }

  ctx.fillText('The ' + birds[Math.floor(Math.random()* birds.length)], 100, 200)

  //Three.js mesh
  const mesh = new THREE.Mesh(boxGeometry, [mat, mat,  new THREE.ShaderMaterial({
    depthWrite: true,
    uniforms:
      {
        uAlpha: { value: 1 },
        uTexture: {
          value: new THREE.CanvasTexture(textTexture)
        }
      },
    transparent: true,
    vertexShader: `
          varying vec2 vUv;
          void main()
          {
            vec4 modelPosition = modelMatrix * vec4(position, 1.);

            vec4 viewPosition = viewMatrix * modelPosition;

            vec4 projectionPosition = projectionMatrix * viewPosition;

            gl_Position = projectionPosition;
            vUv = uv;
          }
      `,
    fragmentShader: `
        uniform sampler2D uTexture;

        varying vec2 vUv;
        const float PI = 3.1415926535897932384626433832795;
        const float TAU = PI * 2.;

          vec2 brownConradyDistortion(in vec2 uv, in float k1, in float k2)
  {
      uv = uv * 2.0 - 1.0;	// brown conrady takes [-1:1]

      // positive values of K1 give barrel distortion, negative give pincushion
      float r2 = uv.x*uv.x + uv.y*uv.y;
      uv *= 1.0 + k1 * r2 + k2 * r2 * r2;

      // tangential distortion (due to off center lens elements)
      // is not modeled in this function, but if it was, the terms would go here

      uv = (uv * .5 + .5);	// restore -> [0:1]
      return uv;
  }



        //	Classic Perlin 2D Noise
        //	by Stefan Gustavson
        //
        vec4 permute(vec4 x)
        {
            return mod(((x*34.0)+1.0)*x, 289.0);
        }


        vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

        float cnoise(vec2 P){
          vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
          vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
          Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
          vec4 ix = Pi.xzxz;
          vec4 iy = Pi.yyww;
          vec4 fx = Pf.xzxz;
          vec4 fy = Pf.yyww;
          vec4 i = permute(permute(ix) + iy);
          vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
          vec4 gy = abs(gx) - 0.5;
          vec4 tx = floor(gx + 0.5);
          gx = gx - tx;
          vec2 g00 = vec2(gx.x,gy.x);
          vec2 g10 = vec2(gx.y,gy.y);
          vec2 g01 = vec2(gx.z,gy.z);
          vec2 g11 = vec2(gx.w,gy.w);
          vec4 norm = 1.79284291400159 - 0.85373472095314 *
            vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
          g00 *= norm.x;
          g01 *= norm.y;
          g10 *= norm.z;
          g11 *= norm.w;
          float n00 = dot(g00, vec2(fx.x, fy.x));
          float n10 = dot(g10, vec2(fx.y, fy.y));
          float n01 = dot(g01, vec2(fx.z, fy.z));
          float n11 = dot(g11, vec2(fx.w, fy.w));
          vec2 fade_xy = fade(Pf.xy);
          vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
          float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
          return 2.3 * n_xy;
}

        const vec2 v60 = vec2( cos(PI/3.0), sin(PI/3.0));
        const vec2 vm60 = vec2(cos(-PI/3.0), sin(-PI/3.0));
        const mat2 rot60 = mat2(v60.x,-v60.y,v60.y,v60.x);
        const mat2 rotm60 = mat2(vm60.x,-vm60.y,vm60.y,vm60.x);
        float triangleGrid(vec2 p, float stepSize,float vertexSize,float lineSize)
        {
    // equilateral triangle grid
    vec2 fullStep= vec2( stepSize , stepSize*v60.y);
    vec2 halfStep=fullStep/2.0;
    vec2 grid = floor(p/fullStep);
    vec2 offset = vec2( (mod(grid.y,2.0)==1.0) ? halfStep.x : 0. , 0.);
   	// tiling
    vec2 uv = mod(p+offset,fullStep)-halfStep;
    float d2=dot(uv,uv);
    return vertexSize/d2 + // vertices
    	max( abs(lineSize/(uv*rotm60).y), // lines -60deg
        	 max ( abs(lineSize/(uv*rot60).y), // lines 60deg
        	  	   abs(lineSize/(uv.y)) )); // h lines
               }

      const vec2 s = vec2(1, 1.7320508);


     float hex(in vec2 p){

     		 p = abs(p);

     		 return max(dot(p, s*.5), p.x); // Hexagon.

      }
     vec4 getHex(vec2 p){

     		 vec4 hC = floor(vec4(p, p - vec2(.5, 1))/s.xyxy) + .5;

     		 vec4 h = vec4(p - hC.xy*s, p - (hC.zw + .5)*s);

     		 return dot(h.xy, h.xy)<dot(h.zw, h.zw) ? vec4(h.xy, hC.xy) : vec4(h.zw, hC.zw + vec2(.5, 1));

      }

     float stroke(float x, float s, float w){
        float d = step(s,x + w * .5) -
        step(s, x-w *.5);


        return clamp(d, 0., 1.);
      }



          void main()
          {
              vec2 uv = ${uvArr[Math.floor(Math.random()* uvArr.length)]};

              vec4 tex = texture2D(uTexture, vUv);

              vec4 hex_uv = getHex(uv * ${Math.random() * 20});

              float hexf = stroke(hex(hex_uv.xy), ${Math.random()}, ${Math.random()});


              float r = ${glslArr[Math.floor(Math.random()*glslArr.length)]};

            	float g = ${glslArr[Math.floor(Math.random()*glslArr.length)]};

              float b = ${glslArr[Math.floor(Math.random()*glslArr.length)]};

              vec3 color = vec3(r, g, b);

              color = mix(color, 1.-color, ${glslArr[Math.floor(Math.random()*glslArr.length)]} );

              gl_FragColor = vec4(color, 1.)+ tex + tex + tex;
          }
      `
  }), mat, mat,mat ])
  mesh.castShadow = true
  mesh.position.copy(position)
  mesh.scale.set(width, height, depth)
  scene.add(mesh)

  //Cannon.js Body
  const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))
  const body = new CANNON.Body({
    mass: 1,
    positon: new CANNON.Vec3(0, 3, 0),
    shape: shape,
    material: defaultMaterial
  })
  body.position.copy(position)

  world.addBody(body)

  objectsToUpdate.push({
    mesh: mesh,
    body: body
  })

}


const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(
  new CANNON.Vec3(-1, 0, 0),
  Math.PI * 0.5
)
floorBody.position.y = -9

world.addBody(floorBody)

let sceneGroup, room
const intersectsArr = []

intersectsArr.push(meshDesk)
gtlfLoader.load(
  'recordStore.glb',
  (gltf) => {
    gltf.scene.scale.set(4.5,4.5,4.5)
    sceneGroup = gltf.scene
    sceneGroup.needsUpdate = true
    sceneGroup.position.y -= 4.5
    scene.add(sceneGroup)

    room = gltf.scene.children.find((child) => {
      return child.name === 'room'
    })
    // intersectsArr.push(room)
    room.material = bakedMaterial


  }
)


const clock = new THREE.Clock()
let oldElapsedTime = 0
const tick = () =>{
  // if ( mixer ) mixer.update( clock.getDelta() )
  const elapsedTime = clock.getElapsedTime()

  const deltaTime = elapsedTime - oldElapsedTime
  oldElapsedTime = elapsedTime
  //Update Physics World

  world.step(1/60, deltaTime, 3)

  for(const object of objectsToUpdate){
    object.mesh.position.copy(object.body.position)
    object.mesh.quaternion.copy(object.body.quaternion)
  }

  // Update controls
  controls.update()



  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()




/// Hacky horrible sounds bit

let seq, seq2, seq3

const notes = ['A1', 'B2', 'C3', 'D4', 'E5', 'F6', 'G7', 'A8']

const notesLow = ['E2','F2','G2','A2','D2','E3','F3','G3','A3','D3']


const synth = new Tone.PolySynth(Tone.MembraneSynth, {
  envelope: {
    attack: 0.02,
    decay: 0.1,
    sustain: 0.3,
    release: 1
  }
}).toDestination()

const bass = new Tone.PolySynth(Tone.DuoSynth, {
  envelope: {
    attack: 0.02,
    decay: .01,
    sustain: .1,
    release: 1
  }




}).toDestination()



const metal = new Tone.PolySynth(Tone.MetalSynth, {
  envelope: {
    attack: 0.02,
    decay: .01,
    sustain: .1,
    release: 1
  }




}).toDestination()

const am = new Tone.PolySynth(Tone.AMSynth, {
  envelope: {
    attack: 0.04,
    decay: .01,
    sustain: .1,
    release: 1
  }




}).toDestination()


let synthArr = [ synth, metal]

let synthArr2 = [ bass, am]

document.querySelector('#tone-play-toggle').addEventListener('click', (e) => {
  let index = 0
  // sampler.triggerAttackRelease(["A2", "E1", "G1", "B1"], 0.5);
if (Tone.Transport.state !== 'started') {
  Tone.start()
   seq = new Tone.Sequence((time, note) => {
	sampler.triggerAttackRelease(note, 0.9, time);
	// subdivisions are given as subarrays
}, [notes[Math.floor(Math.random() * notes.length)]
    , [notes[Math.floor(Math.random() * notes.length)], notes[Math.floor(Math.random() * notes.length)], notes[Math.floor(Math.random() * notes.length)]]
    , notes[Math.floor(Math.random() * notes.length)], [notes[Math.floor(Math.random() * notes.length)], notes[Math.floor(Math.random() * notes.length)]]
    , notes[Math.floor(Math.random() * notes.length)], notes[Math.floor(Math.random() * notes.length)], notes[Math.floor(Math.random() * notes.length)], notes[Math.floor(Math.random() * notes.length)], notes[Math.floor(Math.random() * notes.length)], [notes[Math.floor(Math.random() * notes.length)], notes[Math.floor(Math.random() * notes.length)]]]).start(0);



    seq2 = new Tone.Pattern((time, note) => {


      synthArr[Math.floor(Math.random() * synthArr.length)].triggerAttackRelease(note, .5, time)
    },
    [notesLow[Math.floor(Math.random() * notesLow.length)], [notesLow[Math.floor(Math.random() * notesLow.length)], notesLow[Math.floor(Math.random() * notesLow.length)], notesLow[Math.floor(Math.random() * notesLow.length)]], notesLow[Math.floor(Math.random() * notesLow.length)], [notesLow[Math.floor(Math.random() * notesLow.length)], notesLow[Math.floor(Math.random() * notesLow.length)]], notesLow[Math.floor(Math.random() * notesLow.length)], notesLow[Math.floor(Math.random() * notesLow.length)], notesLow[Math.floor(Math.random() * notesLow.length)], notesLow[Math.floor(Math.random() * notesLow.length)], notesLow[Math.floor(Math.random() * notesLow.length)], [notesLow[Math.floor(Math.random() * notesLow.length)], notesLow[Math.floor(Math.random() * notesLow.length)]]]).start(0)



    seq3 = new Tone.Pattern((time, note) => {
      synthArr2[Math.floor(Math.random() * synthArr2.length)].triggerAttackRelease(note, .05, time)
    },
    [notes[Math.floor(Math.random() * notes.length)], [notes[Math.floor(Math.random() * notes.length)], notes[Math.floor(Math.random() * notes.length)], notes[Math.floor(Math.random() * notes.length)]], notes[Math.floor(Math.random() * notes.length)], [notes[Math.floor(Math.random() * notes.length)], notes[Math.floor(Math.random() * notes.length)]], notes[Math.floor(Math.random() * notes.length)], notes[Math.floor(Math.random() * notes.length)], notes[Math.floor(Math.random() * notes.length)], notes[Math.floor(Math.random() * notes.length)], notes[Math.floor(Math.random() * notes.length)], [notes[Math.floor(Math.random() * notes.length)], notes[Math.floor(Math.random() * notes.length)]]]).start(0)

    seq.probability = Math.random() * 10
    seq2.probability = Math.random() * 10
    seq3.probability = Math.random() * 10


    Tone.Transport.start()
  } else {
    Tone.Transport.stop()
    seq.dispose()
    seq2.dispose()
    seq3.dispose()

  }

})

const sampler = new Tone.Sampler({
	urls: {
		A1: "clap.wav",
		B2: "kick.wav",
    C3: "VEC1 BD Distortion 06.wav",
    D4: "VEC1 BD Distortion 37.wav",
    E5: "VEC1 BD Distortion 39.wav",
    F6: "VEC1 BD Distortion 41.wav",
    G7: "VEC1 BD Distortion 52.wav",
    A8: "VEC1 BD Distortion 53.wav"
	},
	onload: () => {

	}
}).toDestination()
