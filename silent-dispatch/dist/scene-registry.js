// Each worker owns one module. Shared duration and transition policy live here.
export const scenes = [
  {id:0, title:'Before the story', duration:3, status:'ready', transition:'cut', load:() => import('./scenes/scene-00.js')},
  {id:1, title:'Breakfast', duration:45, status:'animation preview', transition:'cut', load:() => import('./scenes/scene-01.js')},
  {id:2, title:'The house', duration:40, status:'animation preview', transition:'cut', load:() => import('./scenes/scene-02.js')},
  {id:3, title:'Mortar and run-out', duration:20, status:'animation preview', transition:'smoke', load:() => import('./scenes/scene-03.js')},
  {id:4, title:'Field, three shots', duration:105, status:'animation preview', transition:'cut', load:() => import('./scenes/scene-04.js')},
  {id:5, title:'The grenade', duration:30, status:'animation preview', transition:'black', load:() => import('./scenes/scene-05.js')},
  {id:6, title:'Black ending', duration:45, status:'animation preview', transition:'cut', load:() => import('./scenes/scene-06.js')},
];
export const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);
