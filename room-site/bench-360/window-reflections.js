// World-space mirrored emissive proxies. Shared parameters come from apply_plate.py.
// The two source images are area-averaged; no scene capture or extra render target.
export function installWindowReflections({THREE:T,scene,parameters,lamp,screen}) {
 const meshes=[],materials=[],geometries=[];
 const pane=parameters.window;
 for(const spec of pane.proxies) {
  const positions=spec.vertices_blender.flatMap(([x,y,z])=>[x,z,-y]);
  const indices=spec.faces.flatMap(f=>f.slice(1,-1).flatMap((_,i)=>[f[0],f[i+1],f[i+2]]));
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);const uv=spec.faces.length===1?[0,0,1,0,1,1,0,1]:spec.vertices_blender.flatMap((_,i)=>[(i%64)/64,i<64?0:1]);geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  const uniforms={lamp,screen,proxyGroup:{value:spec.group==='lamp'?0:1},emission:{value:new T.Vector3(...spec.color).multiplyScalar(spec.radiance*pane.reflectance)},paneDepth:{value:-pane.pane_y},aperture:{value:new T.Vector4(...pane.aperture_blender)}};
  const material=new T.ShaderMaterial({uniforms,side:T.DoubleSide,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,
   vertexShader:'varying vec3 worldPoint;varying vec2 proxyUV;void main(){proxyUV=uv;vec4 p=modelMatrix*vec4(position,1.);worldPoint=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}',
   fragmentShader:`varying vec3 worldPoint;varying vec2 proxyUV;uniform vec3 emission,screen;uniform float lamp,proxyGroup,paneDepth;uniform vec4 aperture;
   void main(){vec3 ray=worldPoint-cameraPosition;if(abs(ray.z)<1e-6)discard;float t=(paneDepth-cameraPosition.z)/ray.z;if(t<=0.||t>=1.)discard;vec3 hit=cameraPosition+ray*t;
    if(hit.x<aperture.x||hit.x>aperture.y||hit.y<aperture.z||hit.y>aperture.w)discard;
    vec2 f=sin(3.141592653589793*clamp(proxyUV,0.,1.));float falloff=f.y*f.y;if(proxyGroup>.5)falloff*=f.x*f.x;float edge=.012;falloff*=smoothstep(aperture.x,aperture.x+edge,hit.x)*(1.-smoothstep(aperture.y-edge,aperture.y,hit.x))*smoothstep(aperture.z,aperture.z+edge,hit.y)*(1.-smoothstep(aperture.w-edge,aperture.w,hit.y));vec3 level=proxyGroup<.5?vec3(lamp):screen;gl_FragColor=vec4(emission*level*falloff,1.);}`});
  const mesh=new T.Mesh(geometry,material);mesh.name='window_reflection_'+spec.group;mesh.frustumCulled=true;mesh.renderOrder=1;scene.add(mesh);meshes.push(mesh);materials.push(material);geometries.push(geometry);
 }
 return {meshes,cost:{drawCalls:meshes.length,triangles:geometries.reduce((n,g)=>n+g.index.count/3,0),extraScenePasses:0,renderTargetBytes:0,textureBytes:0,vertexBytes:geometries.reduce((n,g)=>n+g.attributes.position.array.byteLength+g.attributes.uv.array.byteLength+g.index.array.byteLength,0)},setVisible(v){meshes.forEach(m=>m.visible=v);},dispose(){meshes.forEach(m=>scene.remove(m));materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());}};
}
