import React from 'react';
import { AR, Asset } from 'expo';
import ExpoTHREE, { AR as ThreeAR, THREE } from 'expo-three';
import { View as GraphicsView } from 'expo-graphics';

const _ = require('lodash');




class MainScreen extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      docs: true
    }
  }





  async componentDidMount() {
    THREE.suppressExpoWarnings(true)
    ThreeAR.suppressWarnings()

    let isARvailable = await AR.isAvailable(); //  true
    let getVersion = await AR.getVersion(); // 1.5

    const listener = AR.onFrameDidUpdate((data) => {
      if(!_.isEmpty(data)) {
        console.log('FrameDidUpdate: ', data);
      }
    });

  }


  
  render() {

    return (
      <GraphicsView
        style={{ flex: 1 }}
        onContextCreate={this.onContextCreate}
        onRender={this.onRender}
        onResize={this.onResize}
        isArEnabled
        isArRunningStateEnabled
        isArCameraStateEnabled
        arTrackingConfiguration={AR.TrackingConfigurations.World}
      />
    );
  }

  // When our context is built we can start coding 3D things.
  onContextCreate = async ({ gl, scale: pixelRatio, width, height }) => {
    // This will allow ARKit to collect Horizontal surfaces
    AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);

    // Create a 3D renderer
    this.renderer = new ExpoTHREE.Renderer({
      gl,
      pixelRatio,
      width,
      height,
    });

    // We will add all of our meshes to this scene.
    this.scene = new THREE.Scene();
    // This will create a camera texture and use it as the background for our scene
    this.scene.background = new ThreeAR.BackgroundTexture(this.renderer);
    // Now we make a camera that matches the device orientation. 
    // Ex: When we look down this camera will rotate to look down too!
    this.camera = new ThreeAR.Camera(width, height, 0.01, 1000);
    
    // Make a cube - notice that each unit is 1 meter in real life, we will make our box 0.1 meters
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    // Simple color material
    const material = new THREE.MeshPhongMaterial({
      color: 0xff00ff,
    });
    
    // Combine our geometry and material
    this.cube = new THREE.Mesh(geometry, material);
    // Place the box 0.4 meters in front of us.
    this.cube.position.z = -10
    // Add the cube to the scene
    this.scene.add(this.cube);
    
    // Setup a light so we can see the cube color
    // AmbientLight colors all things in the scene equally.
    this.scene.add(new THREE.AmbientLight(0xffffff));

    // Create this cool utility function that let's us see all the raw data points.
    this.points = new ThreeAR.Points();
    // Add the points to our scene...
    this.scene.add(this.points)
  };

  // When the phone rotates, or the view changes size, this method will be called.
  onResize = ({ x, y, scale, width, height }) => {
    // Let's stop the function if we haven't setup our scene yet
    if (!this.renderer) {
      return;
    }
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  // Called every frame.
  onRender = () => {
    // This will make the points get more rawDataPoints from Expo.AR
    this.points.update()
    // Finally render the scene with the AR Camera
    this.renderer.render(this.scene, this.camera);
  };
}


export default MainScreen;