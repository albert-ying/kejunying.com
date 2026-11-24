// R3 rain normal strength is .08 in polish_r3.py; the cloud remains still.
export const originalWindowFragment=`varying vec2 vUv; uniform sampler2D map,rainMap;uniform float benchRain,benchTime,benchMotion,strength,benchHorizon;uniform vec3 grade;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
void main(){float t=mod(benchTime,3600.)*benchMotion;vec2 uv=vUv;vec2 detail=texture2D(rainMap,vUv*vec2(3.,2.)).rg*2.-1.;
 vec2 grid=vUv*vec2(115.,60.),cell=floor(grid),center=vec2(.2+.6*hash(cell),.2+.6*hash(cell+13.));vec2 d=fract(grid)-center;d.y*=.72+.4*hash(cell+29.);
 float radius=.18+.18*hash(cell+7.),selected=step(.94,hash(cell+2.)),r=length(d);
 float bead=(1.-smoothstep(radius-.035,radius+.015,r))*selected;float rim=exp(-pow((r-radius)/.028,2.))*selected;
 vec2 tracks=vec2(0.);float track=0.;for(int i=0;i<7;i++){float k=float(i),x=hash(vec2(k,9.)),y=fract(hash(vec2(k,18.))+t*(.0018+.0025*hash(vec2(k,21.))));float dx=vUv.x-x-sin(vUv.y*26.+k)*.00025;
 float tail=smoothstep(y-.13,y-.035,vUv.y)*(1.-smoothstep(y,y+.003,vUv.y));float running=exp(-dx*dx/.0000002)*tail;track+=running;tracks.x+=running*sign(dx);}
 const float normalStrength=.08;vec2 offset=normalStrength*(detail*.12+normalize(d+vec2(.0001))*sqrt(max(0.,1.-pow(r/radius,2.)))*bead*.025+tracks*.015);
 uv+=offset*benchRain;
 // Water displacement fades to zero at the horizon; cloud and sky have no warp.
 float H=benchHorizon;float depth=clamp((vUv.y-H)/(1.-H),0.,1.),water=smoothstep(H+.003,H+.025,vUv.y)*benchMotion;
 float ripple=.6*sin(vUv.x*(170.+depth*140.)+t*.4)*sin(vUv.y*900.-t*.2)+.4*(vn(vUv*vec2(90.,60.)+vec2(t*.06,t*.035))-.5);
 uv.y+=water*ripple*(.00035+.0014*depth);uv.x+=water*ripple*.0003;
 vec3 color=texture2D(map,clamp(uv,0.,1.)).rgb*grade*strength;color*=1.+water*ripple*.08;color*=1.-.025*bead*benchRain;color+=vec3(.006,.008,.0085)*(rim*.45*smoothstep(.70,.82,vUv.y)+track*.18)*benchRain;float warmRim=smoothstep(.0,.20,color.r-color.b);color*=mix(1.25,1.85,warmRim); /* round17b */gl_FragColor=vec4(color,1.);}`;

// Plate UVs and the receiving projection stay unchanged.
export function skyLightRGB(t){const s=Math.sin(2*Math.PI*t/1200);return [1.0075+.035*s,1+.0325*s,1+.03*s];}
export const skyVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const windowFragment=`
varying vec2 vUv;
uniform sampler2D map,rainMap,cloudMap,cleanMap,varianceMap;
uniform float benchRain,benchTime,benchMotion,strength,benchHorizon;
uniform vec3 grade,skyLight;
uniform vec4 cloudRect,seaRegions[20],glintAnchor;
uniform float seaEnergy[20];
uniform vec2 cloudFlow,plateSize;
uniform float cloudSwing,cloudPeriod,cloudRounding,seaRate,seaPeriod,seaCycles;
const float PI=3.141592653589793;
float neutralSupport(vec2 uv){vec2 q=(uv-seaRegions[19].xy)/seaRegions[19].zw;return smoothstep(.1,.4,exp(-.5*dot(q,q)));}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float crestSigma(vec2 uv,float footprint){
 vec3 s=texture2D(varianceMap,uv).rgb;float level=clamp(log2(max(footprint,.5)/.5),0.,2.);
 return max(mix(mix(s.r,s.g,clamp(level,0.,1.)),s.b,clamp(level-1.,0.,1.)),.01);
}
vec3 sourceGlint(vec2 uv){
 float depth=clamp((uv.y-benchHorizon)/(1.-benchHorizon),0.,1.);
 float water=smoothstep(benchHorizon+.003,benchHorizon+.025,uv.y),ref=.6;
 float ripple=.6*sin(uv.x*(170.+depth*140.)+ref*.4)*sin(uv.y*900.-ref*.2)+.4*(vn(uv*vec2(90.,60.)+vec2(ref*.06,ref*.035))-.5);
 vec2 p=uv+water*ripple*vec2(.0003,.00035+.0014*depth);
 return texture2D(map,clamp(p,0.,1.)).rgb*(1.+water*ripple*.08);
}
vec3 flowSea(vec2 uv,float t){
 float phase=t/seaPeriod;
 float p0=fract(phase),p1=fract(phase+.5);
 float w0=pow(sin(PI*p0),2.),w1=pow(sin(PI*p1),2.);
 float H=benchHorizon,z=clamp((uv.y-H)/(1.-H),.00001,.99999);
 // Logistic transport stays strictly between horizon and the photo bottom.
 // Its forward velocity increases from the horizon without a mirrored fold.
 float logDepth=log(z/(1.-z));
 float d0=1./(1.+exp(-logDepth+seaRate*(p0-.5)*seaPeriod));
 float d1=1./(1.+exp(-logDepth+seaRate*(p1-.5)*seaPeriod));
 float n0=mod(2.*floor(phase)+1.,2.*seaCycles),n1=mod(2.*floor(phase+.5),2.*seaCycles);
 float x0=.004*(sin(n0*2.399963)-sin(0.));
 float x1=.004*(sin(n1*2.399963)-sin(0.));
 float farFade=smoothstep(H+.010,H+.035,uv.y);
 vec2 a=vec2(uv.x+x0*farFade,mix(uv.y,H+(1.-H)*d0,farFade));
 vec2 b=vec2(uv.x+x1*farFade,mix(uv.y,H+(1.-H)*d1,farFade));
 vec3 ca=texture2D(map,a,.2).rgb,cb=texture2D(map,b,.2).rgb;
 vec3 broad=texture2D(map,uv,4.).rgb;
 vec3 ba=texture2D(map,a,4.).rgb,bb=texture2D(map,b,4.).rgb;
 vec3 original=texture2D(map,uv).rgb;
 vec3 Y=vec3(.2126,.7152,.0722);
 float broadL=dot(broad*grade,Y),originalL=dot(original*grade,Y);
 float da=dot(ca*grade,Y)/max(dot(ba*grade,Y),.0001)-1.;
 float db=dot(cb*grade,Y)/max(dot(bb*grade,Y),.0001)-1.;
 float sigma=crestSigma(uv,length(dFdy(uv)*plateSize));
 da*=sigma/crestSigma(a,length(dFdy(a)*plateSize));
 db*=sigma/crestSigma(b,length(dFdy(b)*plateSize));
 vec2 correlationScale=vec2(24.,2.)*max(length(dFdy(uv)*plateSize),.5);
 vec2 phaseSeparation=(a-b)*plateSize/correlationScale;
 float phaseCorrelation=exp(-.5*dot(phaseSeparation,phaseSeparation));
 float phaseVariance=w0*w0+w1*w1+2.*w0*w1*phaseCorrelation;
 float energy=inversesqrt(max(phaseVariance,.001));
 float detail=clamp((da*w0+db*w1)*energy,-3.*sigma,3.*sigma);
 float target=max(0.,broadL*(1.+detail));
 // Keep the photograph's chroma at each location while transporting its
 // crest luminance. Warm highlights retain their position and colour, but
 // their intensity comes entirely from the moving crests.
 vec3 water=original*(target/max(originalL,.0001));
  // Photographed glint crests move within a fixed broad light path. There
  // are no held pixels: both coordinates and crest exposure evolve.
  float fade=smoothstep(benchHorizon+.008,benchHorizon+.025,uv.y)*(1.-smoothstep(.96,.99,uv.y));
  float warmEnvelope=clamp((texture2D(varianceMap,uv).a-.5)*2.,0.,1.)*fade;
  vec3 steady=sourceGlint(uv);
  float crestMotion=smoothstep(.035,.085,dot(steady*grade,Y)*strength);
  float sy=gl_FragCoord.y*.02;
  float shift=1.5*crestMotion*(sin(t*(2.*PI*37./1200.)+sy)-sin(sy)+.5*(sin(t*(2.*PI*23./1200.)+sy*.73)-sin(sy*.73)));
  vec2 warp=vec2(dFdx(uv).x,0.)*shift;
  vec3 glint=sourceGlint(uv+warp*fade)*(1.+.10*crestMotion*tanh(detail/max(sigma,.01)));
  float glintL=dot(glint*grade,Y);
  float lit=smoothstep(mix(-.03,-.16,neutralSupport(uv)),mix(0.,-.12,neutralSupport(uv)),(glint.r*grade.r-glint.b*grade.b)/max(glintL,.0001));
  // The broad envelope fixes the light path; only warm crest light uses the
  // photographed glint. Grey and dark wave structure continues to travel.
  water=mix(water,broad*(target/max(broadL,.0001)),warmEnvelope);
  water=mix(water,glint,fade*lit);

 return water;

}
float balanceGain(vec2 uv,float index){
 float value=0.;
 for(int i=0;i<20;i++){vec2 q=(uv-seaRegions[i].xy)/seaRegions[i].zw;float w=exp(-.5*dot(q,q));value+=w*seaEnergy[i];}
 return exp(clamp(value,-1.6,1.6));
}
vec3 balanceSea(vec3 water,vec2 uv,float t){
 float gain=balanceGain(uv,0.);
 vec3 Y=vec3(.2126,.7152,.0722),broad=texture2D(map,uv,4.).rgb;
 float base=dot(broad*grade,Y),value=dot(water*grade,Y);
 float warm=smoothstep(mix(-.03,-.16,neutralSupport(uv)),mix(0.,-.12,neutralSupport(uv)),(water.r*grade.r-water.b*grade.b)/max(value,.0001));
 gain=mix(gain,1.,warm);
 float target=max(0.,base+(value-base)*gain);
 vec3 moved=water*(target/max(value,.0001));
 // Bound only blue crest outliers, conserving linear Rec709 luminance.
 // The limit is below 106 display-blue levels through the shipped AgX LUT.
 float excess=max(moved.b*grade.b*strength-.09,0.)*smoothstep(1.5,2.,moved.b/max(moved.r,.0001));
 moved.b-=excess/(grade.b*strength);
 moved.r+=excess*(.0722/.2126)/(grade.r*strength);
 // Match the source exposure in the dim narrow sea band.
 vec2 q=(uv-seaRegions[19].xy)/seaRegions[19].zw;
 return moved*(1.-.01*exp(-.5*dot(q,q)));
}
void main(){
 float t=benchTime*benchMotion;
 vec2 uv=vUv;
 // Preserve the original seven running tracks and bead refraction in plate UV.
 vec2 detail=texture2D(rainMap,vUv*vec2(3.,2.)).rg*2.-1.;
 vec2 grid=vUv*vec2(115.,60.),cell=floor(grid),center=vec2(.2+.6*hash(cell),.2+.6*hash(cell+13.));
 vec2 d=fract(grid)-center;d.y*=.72+.4*hash(cell+29.);
 float radius=.18+.18*hash(cell+7.),selected=step(.94,hash(cell+2.)),r=length(d);
 float bead=(1.-smoothstep(radius-.035,radius+.015,r))*selected;float rim=exp(-pow((r-radius)/.028,2.))*selected;
 vec2 tracks=vec2(0.);float track=0.;
 for(int i=0;i<7;i++){float k=float(i),x=hash(vec2(k,9.)),y=fract(hash(vec2(k,18.))+t*(.0018+.0025*hash(vec2(k,21.))));float dx=vUv.x-x-sin(vUv.y*26.+k)*.00025;
  float tail=smoothstep(y-.13,y-.035,vUv.y)*(1.-smoothstep(y,y+.003,vUv.y));float running=exp(-dx*dx/.0000002)*tail;track+=running;tracks.x+=running*sign(dx);}
 vec2 offset=.08*(detail*.12+normalize(d+vec2(.0001))*sqrt(max(0.,1.-pow(r/radius,2.)))*bead*.025+tracks*.015);
 uv+=offset*benchRain;
 vec3 photo=texture2D(map,clamp(uv,0.,1.)).rgb;
 vec3 water=photo;
 if(uv.y>benchHorizon+.006)water=balanceSea(flowSea(uv,t),uv,t);

 vec3 color=photo;
 // Outside this padded source rectangle both the cleaned crop and advected alpha are zero.
 vec2 pad=vec2(cloudSwing+1.7*cloudFlow.x,.009+1.7*cloudFlow.y)+.005;
 if(all(greaterThanEqual(uv,cloudRect.xy-pad))&&all(lessThanEqual(uv,cloudRect.xy+cloudRect.zw+pad))){
 vec2 local=(uv-cloudRect.xy)/cloudRect.zw;
 float rect=smoothstep(0.,.015,local.x)*(1.-smoothstep(.985,1.,local.x))*smoothstep(0.,.02,local.y)*(1.-smoothstep(.98,1.,local.y));
 vec3 clean=texture2D(cleanMap,clamp(local,0.,1.)).rgb;
 color=mix(photo,clean,rect);
 // One opaque photographed cloud oscillates inside the measured overscan.
 float swing=cloudSwing*asin(cloudRounding*sin(2.*PI*t/cloudPeriod))/asin(cloudRounding);
 vec2 q=uv-vec2(swing,.0045*(cos(2.*PI*t/cloudPeriod)-1.));
 vec2 flow=vec2(vn(q*vec2(55.,31.)+vec2(t*.12,t*.05)),vn(q*vec2(37.,43.)+vec2(-t*.08,t*.15)))-.5;
 vec2 initial=vec2(vn(q*vec2(55.,31.)),vn(q*vec2(37.,43.)))-.5;
 float turnBillow=1.+.7*pow(abs(sin(2.*PI*t/cloudPeriod)),8.);
 q+=(flow-initial)*cloudFlow*turnBillow*vec2(1.,1.-smoothstep(benchHorizon-.025,benchHorizon-.004,uv.y));
 vec2 cuv=(q-cloudRect.xy)/cloudRect.zw;
 vec4 cloud=texture2D(cloudMap,clamp(cuv,0.,1.));
 float inside=step(0.,cuv.x)*step(cuv.x,1.)*step(0.,cuv.y)*step(cuv.y,1.);
 float evolution=.35*sin(t*.65+q.x*83.+q.y*71.)*sin(t*.33);
 float alpha=cloud.a+cloud.a*(1.-cloud.a)*evolution;
 color=mix(color,cloud.rgb,clamp(alpha*inside,0.,1.));
 }
 color=mix(color,water,smoothstep(benchHorizon+.006,benchHorizon+.012,uv.y));
 vec3 emission=color*grade*strength*skyLight;
 float seaWeight=smoothstep(benchHorizon+.006,benchHorizon+.012,uv.y);
 color=emission;
 vec3 broadColor=texture2D(map,uv,1.5).rgb*grade;
 if(seaWeight>0.){
 float warm=max(smoothstep(mix(-.04,-.16,neutralSupport(uv)),mix(.04,-.12,neutralSupport(uv)),(broadColor.r-broadColor.b)/max(dot(broadColor,vec3(.2126,.7152,.0722)),.001)),smoothstep(mix(0.,-.16,neutralSupport(uv)),mix(.08,-.12,neutralSupport(uv)),(photo.r*grade.r-photo.b*grade.b)/max(dot(photo*grade,vec3(.2126,.7152,.0722)),.001)));

 vec3 seaEmission=water*grade*strength*mix(skyLight.g,1.,warm);
 color=mix(emission,seaEmission,seaWeight);
 }
 color*=1.-.025*bead*benchRain;color+=vec3(.006,.008,.0085)*(rim*.45*smoothstep(.70,.82,vUv.y)+track*.18)*benchRain;
 float warmRim=smoothstep(.0,.20,color.r-color.b);color*=mix(1.25,1.85,warmRim); /* round17b */gl_FragColor=vec4(color,1.);
}`;
