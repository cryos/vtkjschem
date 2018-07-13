import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkActor           from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper          from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkImageData       from 'vtk.js/Sources/Common/DataModel/ImageData';
import vtkColorTransferFunction   from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkDataArray               from 'vtk.js/Sources/Common/Core/DataArray';
import vtkPiecewiseFunction       from 'vtk.js/Sources/Common/DataModel/PiecewiseFunction';
import vtkVolume                  from 'vtk.js/Sources/Rendering/Core/Volume';
import vtkVolumeMapper            from 'vtk.js/Sources/Rendering/Core/VolumeMapper';
import vtkMolecule   from 'vtk.js/Sources/Common/DataModel/Molecule';
import vtkMoleculeToRepresentation from 'vtk.js/Sources/Filters/General/MoleculeToRepresentation';
import vtkSphereMapper                  from 'vtk.js/Sources/Rendering/Core/SphereMapper';
import vtkStickMapper                   from 'vtk.js/Sources/Rendering/Core/StickMapper';

import data from './caffeine-homo.json';

const { spacing, origin, scalars, dimensions } = data.cube;
const dims = dimensions;
const extent = [
  0, dims[0] - 1,
  0, dims[1] - 1,
  0, dims[2] - 1,
];
const tmp = new Float32Array(scalars.length);
for (var i = 0; i < dims[0]; i++) {
  for (var j = 0; j < dims[1]; j++) {
    for (var k = 0; k < dims[2]; k++) {
      tmp[i + dims[0] * (j + k * dims[1])] = scalars[(i * dims[1] + j) * dims[2] + k];
    }
  }
}
const field = vtkDataArray.newInstance({ values: tmp, name: 'scalars' });

const dataRange = field.getRange();
console.log(dataRange);

const imageData = vtkImageData.newInstance({ spacing, origin, extent });
imageData.getPointData().setScalars(field);

const molecule = vtkMolecule.newInstance(data);
const filter = vtkMoleculeToRepresentation.newInstance();

//import controlPanel from './controller.html';
// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------
const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({ background: [1, 1, 1] });
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();
// ----------------------------------------------------------------------------
const sphereMapper = vtkSphereMapper.newInstance();
const stickMapper = vtkStickMapper.newInstance();
const sphereActor = vtkActor.newInstance();
const stickActor = vtkActor.newInstance();

filter.setInputData(molecule);

// render sphere
sphereMapper.setInputConnection(filter.getOutputPort(0));
sphereMapper.setScaleArray(filter.getSphereScaleArrayName());
sphereActor.setMapper(sphereMapper);

// render sticks
stickMapper.setInputConnection(filter.getOutputPort(1));
stickMapper.setScaleArray('stickScales');
stickMapper.setOrientationArray('orientation');
stickActor.setMapper(stickMapper);

renderer.addActor(sphereActor);
renderer.addActor(stickActor);
const actor = vtkVolume.newInstance();
const mapper = vtkVolumeMapper.newInstance();
mapper.setSampleDistance(0.7);
actor.setMapper(mapper);

// create color and opacity transfer functions
const ctfun = vtkColorTransferFunction.newInstance();
ctfun.addRGBPoint(dataRange[0], 0.9, 0.3, 0);
ctfun.addRGBPoint(dataRange[0] * 0.40, 0.6, 0.0, 0.0);
ctfun.addRGBPoint(0, 0.2, 0.3, 0.6);
ctfun.addRGBPoint(dataRange[1] * 0.40, 0.0, 0.0, 0.6);
ctfun.addRGBPoint(dataRange[1], 0, 0.3, 0.9);

const ofun = vtkPiecewiseFunction.newInstance();

ofun.addPoint(dataRange[0], 0.99);
ofun.addPoint(dataRange[0] * 0.15, 0.8);
ofun.addPoint(dataRange[0] * 0.10, 0.2);
ofun.addPoint(0, 0.0);
ofun.addPoint(dataRange[1] * 0.10, 0.2);
ofun.addPoint(dataRange[1] * 0.15, 0.8);
ofun.addPoint(dataRange[1], 0.99);

actor.getProperty().setRGBTransferFunction(0, ctfun);
actor.getProperty().setScalarOpacity(0, ofun);
actor.getProperty().setScalarOpacityUnitDistance(0, 4.5);
actor.getProperty().setInterpolationTypeToLinear();
// actor.getProperty().setUseGradientOpacity(0, true);
// actor.getProperty().setGradientOpacityMinimumValue(0, 15);
// actor.getProperty().setGradientOpacityMinimumOpacity(0, 0.0);
// actor.getProperty().setGradientOpacityMaximumValue(0, 100);
// actor.getProperty().setGradientOpacityMaximumOpacity(0, 1.0);
// actor.getProperty().setShade(true);
// actor.getProperty().setAmbient(0.2);
// actor.getProperty().setDiffuse(0.7);
// actor.getProperty().setSpecular(0.3);
// actor.getProperty().setSpecularPower(8.0);

mapper.setInputData(imageData);
renderer.addVolume(actor);
renderer.resetCamera();
renderer.updateLightsGeometryToFollowCamera();
renderWindow.render();

// -----------------------------------------------------------
// Make some variables global so that you can inspect and
// modify objects in your browser's developer console:
// -----------------------------------------------------------

global.source = imageData;
global.mapper = mapper;
global.actor = actor;
global.ctfun = ctfun;
global.ofun = ofun;
global.renderer = renderer;
global.renderWindow = renderWindow;
